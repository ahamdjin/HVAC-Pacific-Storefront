import "server-only";

const STOREFRONT_API_VERSION = "2026-10";
const CONFIG_CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 12_000;

type ShopifyConnectionSettings = {
  shop_domain?: string;
  storefront_access_token?: string;
};

type ShopifyConnectionResponse = {
  items?: Array<{ settings?: ShopifyConnectionSettings }>;
};

export type ShopifyStorefrontConfig = {
  shopDomain: string;
  storefrontAccessToken: string;
  accessTokenType: "public" | "private";
};

let cachedConfig:
  | { value: ShopifyStorefrontConfig; expiresAt: number }
  | undefined;

function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function envConfig(): ShopifyStorefrontConfig | null {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const publicToken =
    process.env.SHOPIFY_STOREFRONT_TOKEN ??
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const mode = process.env.SHOPIFY_STOREFRONT_AUTH_MODE ?? "auto";
  if (!["auto", "public", "private"].includes(mode)) {
    throw new Error("SHOPIFY_STOREFRONT_AUTH_MODE must be auto, public, or private.");
  }
  const accessTokenType = mode === "public" ? "public" : mode === "private" || privateToken ? "private" : "public";
  const storefrontAccessToken = accessTokenType === "private" ? privateToken : publicToken;
  if (mode !== "auto" && (!shopDomain || !storefrontAccessToken)) {
    throw new Error(`Shopify ${mode} authentication requires the store domain and its corresponding Storefront token.`);
  }
  if (!shopDomain || !storefrontAccessToken) return null;
  return {
    shopDomain: normalizeDomain(shopDomain),
    storefrontAccessToken,
    accessTokenType,
  };
}

function getConnectionEndpoint() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const identity = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;

  if (!hostname || !identity) {
    throw new Error(
      "Shopify is not configured. Add SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN or connect the Replit Shopify integration.",
    );
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
  const direct = envConfig();
  if (direct) return direct;

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
      "Shopify integration is missing Storefront API settings.",
    );
  }

  cachedConfig = {
    value: {
      shopDomain: normalizeDomain(settings.shop_domain),
      storefrontAccessToken: settings.storefront_access_token,
      accessTokenType: "public",
    },
    expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
  };
  return cachedConfig.value;
}

export async function shopifyStorefrontRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: { cache?: RequestCache; revalidate?: number; buyerIp?: string; tags?: string[] } = {},
): Promise<T> {
  const config = await getShopifyStorefrontConfig();
  const request = async (current: ShopifyStorefrontConfig) =>
    fetch(
      `https://${current.shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [current.accessTokenType === "private"
            ? "Shopify-Storefront-Private-Token"
            : "X-Shopify-Storefront-Access-Token"]: current.storefrontAccessToken,
          ...(current.accessTokenType === "private" && options.buyerIp
            ? { "Shopify-Storefront-Buyer-IP": options.buyerIp }
            : {}),
        },
        body: JSON.stringify({ query, variables }),
        cache: options.cache ?? "force-cache",
        next: {
          revalidate: options.revalidate ?? 3600,
          ...(options.tags ? { tags: options.tags } : {}),
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    );

  let response = await request(config);
  if (response.status === 401 || response.status === 403) {
    cachedConfig = undefined;
    response = await request(
      await getShopifyStorefrontConfig({ forceRefresh: true }),
    );
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
