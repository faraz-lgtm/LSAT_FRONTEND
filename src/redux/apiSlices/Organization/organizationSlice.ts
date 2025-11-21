import { api } from "@/redux/api";
import type { 
  OrganizationOutput,
  MetaResponse,
  CreateOrganizationDto
} from "@/types/api/data-contracts";

/**
 * Response type for single organization
 */
type SingleOrganizationResponse = {
  meta: MetaResponse;
  data: OrganizationOutput;
};

/**
 * Response type for array of organizations
 */
type OrganizationsArrayResponse = {
  meta: MetaResponse;
  data: OrganizationOutput[];
};

/**
 * Organization API slice
 * Provides endpoints for fetching, creating, updating, and deleting organization data
 * Uses Swagger-generated types from data-contracts
 */
export const organizationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get current user's organization
     * GET /api/v1/organizations/my-organization
     * Works with X-Organization-Slug header for public access
     */
    getMyOrganization: builder.query<SingleOrganizationResponse, void>({
      query: () => ({
        url: "organizations/my-organization",
        method: "GET",
      }),
      providesTags: ["Organization"],
    }),

    /**
     * Get all organizations (SUPER_ADMIN only)
     * GET /api/v1/organizations?hasDomain=true
     * Returns only organizations that have domains configured
     */
    getAllOrganizations: builder.query<OrganizationsArrayResponse, { hasDomain?: boolean } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.hasDomain !== undefined) {
          queryParams.append('hasDomain', params.hasDomain.toString())
        }
        const queryString = queryParams.toString()
        return {
          url: `organizations${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        }
      },
      providesTags: ["Organization"],
    }),

    /**
     * Update organization (SUPER_ADMIN only)
     * PATCH /api/v1/organizations/{id}
     */
    updateOrganization: builder.mutation<SingleOrganizationResponse, { id: number; data: CreateOrganizationDto }>({
      query: ({ id, data }) => ({
        url: `organizations/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),

    /**
     * Create organization (SUPER_ADMIN only)
     * POST /api/v1/organizations
     */
    createOrganization: builder.mutation<SingleOrganizationResponse, CreateOrganizationDto>({
      query: (data) => ({
        url: "organizations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),

    /**
     * Delete organization (SUPER_ADMIN only)
     * DELETE /api/v1/organizations/{id}
     */
    deleteOrganization: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `organizations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),
  }),
});

// Re-export OrganizationOutput for convenience
export type { OrganizationOutput };

// Export hooks
export const {
  useGetMyOrganizationQuery,
  useGetAllOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} = organizationApi;

