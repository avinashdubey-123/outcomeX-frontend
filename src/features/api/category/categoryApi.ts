import { api } from "../api"

export type Category = {
  id: string
  name: string
  slug?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

type CategoryResponse = {
  status: boolean
  statusCode: number
  message: string
  type: string
  data: Category
}

type CategoryListResponse = {
  status: boolean
  statusCode: number
  message: string
  type: string
  data: {
    data: Category[]
    count: number
  }
}

type GetCategoriesParams = {
  page?: number
  limit?: number
  search?: string
}

const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], GetCategoriesParams | void>({
      query: (params) => {
        const queryParams = params ?? {}

        return {
          url: "/v1/user/categories",
          params: queryParams,
        }
      },

      transformResponse: (res: CategoryListResponse): Category[] => res?.data?.data ?? [],

      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map((category) => ({
                type: "Categories" as const,
                id: category.id,
              })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    getCategoryById: builder.query<CategoryResponse, string>({
      query: (id) => ({
        url: `/v1/user/categories/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "Categories", id }],
    }),
  }), // ✅ closes endpoints
}) // ✅ closes injectEndpoints

export const { useGetCategoriesQuery, useGetCategoryByIdQuery } = categoryApi
