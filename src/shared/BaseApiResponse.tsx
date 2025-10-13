export interface BaseApiResponse<T> {
    data: T;
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}