// orderApi.ts

import { secondApi } from "../secondApi"
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersParams,
  GetOrdersResponse,
} from "./orderApiTypes"

export const orderApi = secondApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: "/v1/order",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Orders"],
    }),

    //get orders

    // GET /v1/user/orders
    getOrders: builder.query<GetOrdersResponse, GetOrdersParams>({
      query: ({ status, limit = 10, page, skip }) => {
        const params = new URLSearchParams()
        if (status !== undefined) params.set("status", String(status))
        if (limit !== undefined) params.set("limit", String(limit))
        if (page !== undefined) params.set("page", String(page)) // future
        if (skip !== undefined) params.set("skip", String(skip))
        return `/v1/user/orders?${params.toString()}`
      },
      // cache each unique param combination separately
      serializeQueryArgs: ({ queryArgs }) => queryArgs,
    }),

    cancelOrder: builder.mutation<unknown, string>({
      query: (orderId) => ({
        url: `/v1/orders`,
        method: "DELETE",
        body: { orderId: orderId },
      }),
    }),
  }),
})

export const { useCreateOrderMutation, useGetOrdersQuery, useCancelOrderMutation } = orderApi
