export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MissionQueryParams {
  search?: string;
  statut?: string;
  clientId?: number | null;
  consultantId?: number | null;
  debutApres?: string | null;
  debutAvant?: string | null;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
