import "server-only";

const STOREFRONT_API_VERSION = "2026-04";
const CONFIG_CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 10_000;

type ShopifyConnectionSettings = {
  shop_domain?: string;
  storefront_access_token?: string;
};

type ShopifyConnectionResponse = {
  items?: Array<{ settings?: ShopifyConnectionSettings }>;
};

type ShopifyStorefrontConfig = {
  shopDomain: string;
  storefrontAccessToken: string;
};

let cachedConfig:
  | { value: ShopifyStorefrontConfig; expiresAt: number }
  | undefined;

function getConnectionEndpoint() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const identity = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;

  if (!hostname || !identity) {
    throw new Error("Missing Replit connector environment variables");
  }

  const protocol = hostname.startsWith("localhost") ? "http" : "https";
  const url = new URL(`${protocol}://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "shopify-store");
  url.searchParams.set("refresh_policy", "none");
  return { url: url.toString(), token: identity };
}

export async function getShopifyStorefrontConfig(
  options: { forceRefresh?: boolean } = {},
): Promise<ShopifyStorefrontConfig> {
  if (
    cachedConfig &&
    !options.forceRefresh &&
    Date.now() < cachedConfig.expiresAt
  ) {
    return cachedConfig.value;
  }

  const { url, token } = getConnectionEndpoint();
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      X_REPLIT_TOKEN: token,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Shopify connection: ${response.status}`);
  }

  const data = (await response.json()) as ShopifyConnectionResponse;
  const settings = data.items?.[0]?.settings;
  if (!settings?.shop_domain || !settings.storefront_access_token) {
    throw new Error(
      "Shopify Store integration is missing Storefront settings. Recreate the integration after OpenInt provisions a Storefront token.",
    );
  }

  cachedConfig = {
    value: {
      shopDomain: settings.shop_domain,
      storefrontAccessToken: settings.storefront_access_token,
    },
    expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
  };
  return cachedConfig.value;
}

export async function shopifyStorefrontRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = await getShopifyStorefrontConfig();
  const response = await fetch(
    `https://${config.shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    },
  );

  if (response.status === 401 || response.status === 403) {
    cachedConfig = undefined;
    const refreshed = await getShopifyStorefrontConfig({ forceRefresh: true });
    const retry = await fetch(
      `https://${refreshed.shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": refreshed.storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );
    return parseResponse<T>(retry);
  }

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: { data?: T; errors?: unknown[] };
  try {
    json = text ? (JSON.parse(text) as { data?: T; errors?: unknown[] }) : {};
  } catch {
    json = { errors: [{ message: text }] };
  }

  if (!response.ok || json.errors?.length || json.data === undefined) {
    throw new Error(
      `Shopify Storefront API error (${response.status}): ${JSON.stringify(json.errors ?? json)}`,
    );
  }
  return json.data;
}