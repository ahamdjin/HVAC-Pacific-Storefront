const ADMIN_API_VERSION = "2026-10";

type GraphQLError = { message: string };
type UserError = { field?: string[] | null; message: string };

export type ExistingProduct = {
  id: string;
  title: string;
  handle: string;
  status: string;
  hasOnlyDefaultVariant: boolean;
  variants: Array<{ id: string; sku: string | null; inventoryItem: { id: string } | null }>;
};

function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function config() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) {
    throw new Error("SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN are required for Shopify Admin operations.");
  }
  return { domain: normalizeDomain(domain), token };
}

export async function adminRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { domain, token } = config();
  const response = await fetch(`https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });
  const payload = (await response.json()) as { data?: T; errors?: GraphQLError[] };
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(`Shopify Admin API error (${response.status}): ${JSON.stringify(payload.errors ?? payload)}`);
  }
  return payload.data;
}

export function assertNoUserErrors(errors: UserError[], context: string) {
  if (errors.length) {
    throw new Error(`${context}: ${errors.map((e) => e.message).join("; ")}`);
  }
}

export async function findProductBySku(sku: string): Promise<ExistingProduct | null> {
  const query = `
    query FindBySku($query:String!) {
      productVariants(first:10, query:$query) {
        nodes {
          id sku
          inventoryItem { id }
          product {
            id title handle status hasOnlyDefaultVariant
            variants(first:5) { nodes { id sku inventoryItem { id } } }
          }
        }
      }
    }`;
  const data = await adminRequest<{
    productVariants: {
      nodes: Array<{
        id: string;
        sku: string | null;
        inventoryItem: { id: string } | null;
        product: {
          id: string;
          title: string;
          handle: string;
          status: string;
          hasOnlyDefaultVariant: boolean;
          variants: { nodes: Array<{ id: string; sku: string | null; inventoryItem: { id: string } | null }> };
        };
      }>;
    };
  }>(query, { query: `sku:"${sku.replace(/"/g, '\\"')}"` });

  const exact = data.productVariants.nodes.filter((node) => node.sku === sku);
  if (exact.length > 1) throw new Error(`Duplicate Shopify SKU detected: ${sku}`);
  const hit = exact[0];
  if (!hit) return null;
  return {
    id: hit.product.id,
    title: hit.product.title,
    handle: hit.product.handle,
    status: hit.product.status,
    hasOnlyDefaultVariant: hit.product.hasOnlyDefaultVariant,
    variants: hit.product.variants.nodes,
  };
}

export async function upsertProduct(input: {
  existing: ExistingProduct | null;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  status: "ACTIVE" | "DRAFT";
  sku: string;
  price: string;
  cost?: string;
  qty?: number;
  locationId?: string;
}) {
  if (input.existing && (!input.existing.hasOnlyDefaultVariant || input.existing.variants.length !== 1)) {
    throw new Error(`Refusing to overwrite multi-option or multi-variant product for SKU ${input.sku}`);
  }
  const variantId = input.existing?.variants[0]?.id;
  const variant: Record<string, unknown> = {
    ...(variantId ? { id: variantId } : {}),
    sku: input.sku,
    price: input.price,
    optionValues: [{ optionName: "Title", name: "Default Title" }],
  };
  if (input.cost || input.qty !== undefined) {
    variant.inventoryItem = {
      ...(input.cost ? { cost: input.cost } : {}),
      ...(input.qty !== undefined ? { tracked: true } : {}),
    };
  }
  if (input.qty !== undefined && input.locationId) {
    variant.inventoryQuantities = [{ locationId: input.locationId, name: "available", quantity: input.qty }];
  }
  const productInput: Record<string, unknown> = {
    title: input.title,
    handle: input.handle,
    vendor: input.vendor,
    productType: input.productType,
    status: input.status,
    productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
    variants: [variant],
  };

  const mutation = `
    mutation Upsert($input:ProductSetInput!, $identifier:ProductSetIdentifiers) {
      productSet(synchronous:true, input:$input, identifier:$identifier) {
        product {
          id title handle status hasOnlyDefaultVariant
          variants(first:5) { nodes { id sku inventoryItem { id } } }
        }
        userErrors { field message }
      }
    }`;
  const data = await adminRequest<{
    productSet: {
      product: {
        id: string; title: string; handle: string; status: string; hasOnlyDefaultVariant: boolean;
        variants: { nodes: Array<{ id: string; sku: string | null; inventoryItem: { id: string } | null }> };
      } | null;
      userErrors: UserError[];
    };
  }>(mutation, {
    input: productInput,
    identifier: input.existing ? { id: input.existing.id } : { handle: input.handle },
  });
  assertNoUserErrors(data.productSet.userErrors, `productSet ${input.sku}`);
  if (!data.productSet.product) throw new Error(`productSet returned no product for ${input.sku}`);
  return data.productSet.product;
}

export async function setMetafields(ownerId: string, metafields: Array<{ namespace: string; key: string; type: string; value: string }>) {
  if (!metafields.length) return;
  const mutation = `
    mutation SetMetafields($metafields:[MetafieldsSetInput!]!) {
      metafieldsSet(metafields:$metafields) {
        metafields { id namespace key }
        userErrors { field message code }
      }
    }`;
  const data = await adminRequest<{
    metafieldsSet: { userErrors: Array<UserError & { code?: string | null }> };
  }>(mutation, { metafields: metafields.map((m) => ({ ...m, ownerId })) });
  assertNoUserErrors(data.metafieldsSet.userErrors, "metafieldsSet");
}

export async function setManagedTags(productId: string, pickupOnly: boolean) {
  const mutation = pickupOnly
    ? `mutation Tags($id:ID!){tagsAdd(id:$id,tags:["pickup-only"]){userErrors{field message}}}`
    : `mutation Tags($id:ID!){tagsRemove(id:$id,tags:["pickup-only"]){userErrors{field message}}}`;
  const data = await adminRequest<{ tagsAdd?: { userErrors: UserError[] }; tagsRemove?: { userErrors: UserError[] } }>(mutation, { id: productId });
  const errors = data.tagsAdd?.userErrors ?? data.tagsRemove?.userErrors ?? [];
  assertNoUserErrors(errors, pickupOnly ? "tagsAdd" : "tagsRemove");
}

export async function ensureCollection(title: string, handle: string) {
  const query = `
    query FindCollection($query:String!) {
      collections(first:10, query:$query) { nodes { id title handle } }
    }`;
  const found = await adminRequest<{ collections: { nodes: Array<{ id: string; title: string; handle: string }> } }>(
    query,
    { query: `handle:${handle}` },
  );
  const exact = found.collections.nodes.find((c) => c.handle === handle);
  if (exact) return { ...exact, created: false };

  const mutation = `
    mutation CreateCollection($collection:CollectionCreateInput!) {
      collectionCreate(collection:$collection) {
        collection { id title handle }
        userErrors { field message }
      }
    }`;
  const data = await adminRequest<{
    collectionCreate: { collection: { id: string; title: string; handle: string } | null; userErrors: UserError[] };
  }>(mutation, { collection: { title, handle } });
  assertNoUserErrors(data.collectionCreate.userErrors, `collectionCreate ${title}`);
  if (!data.collectionCreate.collection) throw new Error(`Collection creation returned no collection: ${title}`);
  return { ...data.collectionCreate.collection, created: true };
}

export async function attachProductToCollection(collectionId: string, productId: string) {
  const mutation = `
    mutation Add($id:ID!,$productIds:[ID!]!) {
      collectionAddProducts(id:$id,productIds:$productIds) {
        userErrors { field message }
      }
    }`;
  const data = await adminRequest<{ collectionAddProducts: { userErrors: UserError[] } }>(
    mutation,
    { id: collectionId, productIds: [productId] },
  );
  const errors = data.collectionAddProducts.userErrors.filter((e) => !/already.*collection/i.test(e.message));
  assertNoUserErrors(errors, "collectionAddProducts");
}

export async function setPublication(resourceId: string, publicationId: string, publish: boolean) {
  const mutation = publish
    ? `mutation Publish($id:ID!,$publicationId:ID!){publishablePublish(id:$id,input:{publicationId:$publicationId}){userErrors{field message}}}`
    : `mutation Unpublish($id:ID!,$publicationId:ID!){publishableUnpublish(id:$id,input:{publicationId:$publicationId}){userErrors{field message}}}`;
  const data = await adminRequest<{
    publishablePublish?: { userErrors: UserError[] };
    publishableUnpublish?: { userErrors: UserError[] };
  }>(mutation, { id: resourceId, publicationId });
  const errors = data.publishablePublish?.userErrors ?? data.publishableUnpublish?.userErrors ?? [];
  assertNoUserErrors(errors, publish ? "publishablePublish" : "publishableUnpublish");
}
