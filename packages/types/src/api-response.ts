export interface BaseApiResponse<T = any> {
  success: boolean;
  message?: string;
  status?: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string | number;
    message: string;
    details?: any;
  };
}

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  [key: string]: any;
  items: T[] | null;
  meta: PaginationMeta;
}

export type PaginatedResponse<T> = BaseApiResponse<PaginatedData<T>>;

export type QueryParamsData = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: string;
  search?: string;
  searchFields?: string[];
  include?: string[];
  exclude?: string[];
  [key: string]: any;
};
