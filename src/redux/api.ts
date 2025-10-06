// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: `${BASE_URL}/api/v1` }),
  tagTypes:["Orders"],
  endpoints: () => ({}), // start empty
});
