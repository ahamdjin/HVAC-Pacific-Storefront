import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { shopifyStorefrontRequest } from "@/lib/shopify/storefront";
import { evaluatePurchasePolicy, type PurchaseAttribute } from "@/lib/purchase-policy";
import { isIP } from "node:net";

const COOKIE = "hvac_cart_id";

function buyerIp(request: NextRequest): string | undefined {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();
  return ip && isIP(ip) ? ip : undefined;
}

type VariantPolicy = {
  id: string;
  availableForSale: boolean;
  product: {
    metafields: Array<{ key: string; value: string } | null>;
  };
};

async function getVariantPolicy(variantId: string, ip?: string) {
  const query = `
    query VariantPolicy($id:ID!) {
      node(id:$id) {
        ... on ProductVariant {
          id
          availableForSale
          product {
            metafields(identifiers:[
              {namespace:"specs",key:"site_status"},
              {namespace:"specs",key:"requires_epa608"},
              {namespace:"specs",key:"requires_licensed_install"}
            ]) { key value }
          }
        }
      }
    }`;
  const data = await shopifyStorefrontRequest<{ node: VariantPolicy | null }>(
    query,
    { id: variantId },
    { cache: "no-store", revalidate: 0, buyerIp: ip },
  );
  return data.node;
}

async function validatePurchasePolicy(variantId: string, attributes: PurchaseAttribute[], ip?: string) {
  const variant = await getVariantPolicy(variantId, ip);
  if (!variant) {
    return evaluatePurchasePolicy({
      found: false,
      availableForSale: false,
      meta: {},
      attributes,
    });
  }
  const meta = Object.fromEntries(
    variant.product.metafields
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => [item.key, item.value]),
  );
  return evaluatePurchasePolicy({
    availableForSale: variant.availableForSale,
    meta,
    attributes,
  });
}

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first:100) {
    nodes {
      id quantity
      merchandise {
        ... on ProductVariant {
          id title price { amount currencyCode }
          product { title handle featuredImage { url altText width height } }
        }
      }
    }
  }
`;

async function getCart(id: string, ip?: string) {
  const q = `query Cart($id:ID!){cart(id:$id){${CART_FIELDS}}}`;
  return (await shopifyStorefrontRequest<{ cart: any | null }>(
    q, { id }, { cache: "no-store", revalidate: 0, buyerIp: ip }
  )).cart;
}

export async function GET(request: NextRequest) {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  const empty = { id:"", checkoutUrl:"", totalQuantity:0, cost:{subtotalAmount:{amount:"0",currencyCode:"USD"},totalAmount:{amount:"0",currencyCode:"USD"}}, lines:{nodes:[]} };
  if (!id) return NextResponse.json(empty);
  const cart = await getCart(id, buyerIp(request));
  if (!cart) { jar.delete(COOKIE); return NextResponse.json(empty); }
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const ip = buyerIp(request);
  const body = await request.json();
  if (typeof body.variantId !== "string" || !body.variantId) {
    return NextResponse.json({ error: "Missing product variant." }, { status: 400 });
  }
  const attributes: PurchaseAttribute[] = Array.isArray(body.attributes)
    ? body.attributes
        .filter((x: unknown): x is PurchaseAttribute => {
          if (!x || typeof x !== "object") return false;
          const candidate = x as { key?: unknown; value?: unknown };
          return typeof candidate.key === "string" && typeof candidate.value === "string";
        })
        .map((x: PurchaseAttribute) => ({ key: x.key.slice(0, 120), value: x.value.slice(0, 240) }))
    : [];

  const policy = await validatePurchasePolicy(body.variantId, attributes, ip);
  if (!policy.ok) {
    return NextResponse.json({ error: policy.error }, { status: policy.status });
  }

  // "Buy now" uses a separate one-item Shopify cart so existing cart
  // contents are preserved and never leak into the direct checkout.
  const checkoutOnly = body.checkoutOnly === true;

  const line = {
    merchandiseId: body.variantId,
    quantity: Math.max(1, Number(body.quantity) || 1),
    attributes,
  };

  const jar = await cookies();
  let id = checkoutOnly ? undefined : jar.get(COOKIE)?.value;
  let cart: any = null;

  if (id) {
    const mutation = `mutation Add($cartId:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$cartId,lines:$lines){cart{${CART_FIELDS}} userErrors{field message}}}`;
    const data = await shopifyStorefrontRequest<{cartLinesAdd:{cart:any;userErrors:Array<{message:string}>}}>(
      mutation, { cartId:id, lines:[line] }, { cache:"no-store", revalidate:0, buyerIp: ip }
    );
    if (data.cartLinesAdd.userErrors.length) {
      return NextResponse.json({error:data.cartLinesAdd.userErrors[0].message},{status:400});
    }
    cart = data.cartLinesAdd.cart;
  } else {
    const mutation = `mutation Create($input:CartInput!){cartCreate(input:$input){cart{${CART_FIELDS}} userErrors{field message}}}`;
    const data = await shopifyStorefrontRequest<{cartCreate:{cart:any;userErrors:Array<{message:string}>}}>(
      mutation, { input:{lines:[line]} }, { cache:"no-store", revalidate:0, buyerIp: ip }
    );
    if (data.cartCreate.userErrors.length) {
      return NextResponse.json({error:data.cartCreate.userErrors[0].message},{status:400});
    }
    cart = data.cartCreate.cart;
    id = cart.id;
    if (!checkoutOnly) {
      jar.set(COOKIE,cart.id,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
    }
  }

  if (policy.epaNote && id) {
    const noteMutation = `mutation Note($cartId:ID!,$note:String!){cartNoteUpdate(cartId:$cartId,note:$note){userErrors{message}}}`;
    await shopifyStorefrontRequest(
      noteMutation,
      { cartId: id, note: policy.epaNote.slice(0, 500) },
      { cache: "no-store", revalidate: 0, buyerIp: ip },
    ).catch(() => null);
  }
  return NextResponse.json(cart);
}

export async function PATCH(request: NextRequest) {
  const { lineId, quantity } = await request.json();
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id || typeof lineId !== "string") return NextResponse.json({error:"Cart not found."},{status:404});
  const mutation = `mutation Update($cartId:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$cartId,lines:$lines){cart{${CART_FIELDS}} userErrors{message}}}`;
  const data = await shopifyStorefrontRequest<{cartLinesUpdate:{cart:any;userErrors:Array<{message:string}>}}>(
    mutation,{cartId:id,lines:[{id:lineId,quantity:Math.max(1,Number(quantity)||1)}]},{cache:"no-store",revalidate:0,buyerIp:buyerIp(request)}
  );
  if (data.cartLinesUpdate.userErrors.length) return NextResponse.json({error:data.cartLinesUpdate.userErrors[0].message},{status:400});
  return NextResponse.json(data.cartLinesUpdate.cart);
}

export async function DELETE(request: NextRequest) {
  const { lineId } = await request.json();
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id || typeof lineId !== "string") return NextResponse.json({error:"Cart not found."},{status:404});
  const mutation = `mutation Remove($cartId:ID!,$lineIds:[ID!]!){cartLinesRemove(cartId:$cartId,lineIds:$lineIds){cart{${CART_FIELDS}} userErrors{message}}}`;
  const data = await shopifyStorefrontRequest<{cartLinesRemove:{cart:any;userErrors:Array<{message:string}>}}>(
    mutation,{cartId:id,lineIds:[lineId]},{cache:"no-store",revalidate:0,buyerIp:buyerIp(request)}
  );
  if (data.cartLinesRemove.userErrors.length) return NextResponse.json({error:data.cartLinesRemove.userErrors[0].message},{status:400});
  return NextResponse.json(data.cartLinesRemove.cart);
}