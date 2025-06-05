
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
    totalItems: number
    totalPages: number
    page: number
    pageSize: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export interface PaginatedData<T> {
    items: T[]
    meta: PaginationMeta
}


export type PaginatedResponse<T> = BaseApiResponse<PaginatedData<T>>