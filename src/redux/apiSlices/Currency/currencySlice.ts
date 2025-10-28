import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";

export interface CurrencyRates {
  baseCurrency: string;
  rates: Record<string, number>; // Dynamic rates object
  lastUpdated: string;
}

export const currencyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrencyRates: builder.query<BaseApiResponse<CurrencyRates>, string>({
      query: (baseCurrency = 'CAD') => ({
        url: `currency/exchange-rates?baseCurrency=${baseCurrency}`,
        method: "GET",
      }),
      // Cache for 1 hour (3600 seconds)
      keepUnusedDataFor: 3600,
    }),
  }),
});

// Add skip parameter support
export type GetCurrencyRatesQueryOptions = {
  skip?: boolean;
};

export const { useGetCurrencyRatesQuery } = currencyApi;

