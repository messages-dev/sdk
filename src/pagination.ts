export interface PaginatedResponse<T> extends AsyncIterable<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
  requestId: string;
}

export function makePaginatedResponse<T>(
  raw: { data: T[]; hasMore: boolean; nextCursor: string | null; requestId: string },
  fetchNext: (cursor: string) => Promise<PaginatedResponse<T>>,
): PaginatedResponse<T> {
  return {
    ...raw,
    async *[Symbol.asyncIterator]() {
      let page: PaginatedResponse<T> = this as PaginatedResponse<T>;
      while (true) {
        for (const item of page.data) {
          yield item;
        }
        if (!page.hasMore || !page.nextCursor) break;
        page = await fetchNext(page.nextCursor);
      }
    },
  };
}
