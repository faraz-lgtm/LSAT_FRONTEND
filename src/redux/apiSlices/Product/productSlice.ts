import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import { api } from "../../api";
import type { 
  ProductOutput, 
  CreateProductInput, 
  UpdateProductInput
} from "@/types/api/data-contracts";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/products - Get all products (public endpoint)
    getProducts: builder.query<BaseApiResponse<ProductOutput[]>, void>({
      query: () => ({
        url: "products",
        method: "GET",
      }),
      providesTags: ['Products'],
    }),

    // GET /api/v1/products/{id} - Get product by ID (public endpoint)
    getProductById: builder.query<BaseApiResponse<ProductOutput>, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),

    // POST /api/v1/products - Create new product (admin only)
    createProduct: builder.mutation<BaseApiResponse<ProductOutput>, CreateProductInput>({
      query: (productData) => ({
        url: "products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ['Products'],
    }),

    // PATCH /api/v1/products/{id} - Update product (admin only)
    updateProduct: builder.mutation<BaseApiResponse<ProductOutput>, { id: number; data: UpdateProductInput }>({
      query: ({ id, data }) => ({
        url: `products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        'Products'
      ],
    }),

    // DELETE /api/v1/products/{id} - Delete product (admin only)
    deleteProduct: builder.mutation<BaseApiResponse<{ message: string }>, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Products', id },
        'Products'
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
