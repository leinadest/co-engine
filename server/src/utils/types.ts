export interface Edge<T> {
  cursor: string;
  node: T;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface RelayConnection<T> {
  totalCount?: number;
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
}
