import type { MetaResponse } from "@/types/api/data-contracts";

export interface BaseApiResponse<T> {
    data: T;
    meta:MetaResponse;
    // meta: {
    //     page: number;
    //     limit: number;
    //     total: number;
    // };
}