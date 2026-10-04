export type ShopifyConnection<T> = {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

/** Follow every cursor; fail explicitly rather than serve a truncated catalog. */
export async function collectConnection<T>(
  fetchPage: (after: string | null) => Promise<ShopifyConnection<T>>,
  limit?: number,
): Promise<T[]> {
  const nodes: T[] = [];
  const cursors = new Set<string>();
  let after: string | null = null;
  for (;;) {
    const page = await fetchPage(after);
    nodes.push(...page.nodes);
    if (limit !== undefined && nodes.length >= limit) return nodes.slice(0, limit);
    if (!page.pageInfo.hasNextPage) return nodes;
    const cursor = page.pageInfo.endCursor;
    if (!cursor || cursors.has(cursor)) {
      throw new Error("Shopify returned an invalid catalog pagination cursor.");
    }
    cursors.add(cursor);
    after = cursor;
  }
}