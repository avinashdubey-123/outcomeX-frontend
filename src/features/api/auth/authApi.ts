import { secondApi } from "../secondApi"

export interface GetLockedBalanceResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    lockedAmount: string // USDC amount as string
    tokenId?: string // present only if tokenId was passed
  }
}

type LoginResponse = {
  status: boolean
  statusCode: number
  message: string
  type: string
  data: {
    token: string
  }
}

type LogoutResponse = {
  status: boolean
  statusCode: number
  message: string
  type: string
}

type LoginWalletResponse = {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    nonce: string // the challenge message MetaMask will sign
    token: string // temp JWT — send in Authorization header for verify-wallet
  }
}

type VerifyWalletResponse = {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    token: string
  }
}

type ProfileResponse = {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    id: string
    name: string
    onboardingStatus: number
  }
}

const authApi = secondApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { didToken: string; deviceToken: string }>({
      query: ({ didToken, deviceToken }) => ({
        url: "/v1/user/login",
        method: "POST",
        body: { didToken, deviceToken },
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/v1/user/logout",
        method: "POST",
      }),
    }),
    //login walllet
    loginWallet: builder.mutation<LoginWalletResponse, { publicAddress: string }>({
      query: (body) => ({
        url: "/v1/user/login-wallet",
        method: "POST",
        body,
      }),
    }),

    //verify wallet re

    verifyWallet: builder.mutation<
      VerifyWalletResponse,
      { signature: string; deviceToken: string }
    >({
      query: (body) => ({
        url: "/v1/user/verify-wallet",
        method: "POST",
        body,
      }),
    }),
    Profile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/v1/user/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    // PUT /v1/user/profile
    updateProfile: builder.mutation<
      { statusCode: number; status: boolean; message: string; type: string },
      { name: string }
    >({
      // The backend route uses multer (multipart/form-data) because it also accepts a profile
      // picture. A JSON body is ignored there — name arrives undefined and nothing is saved —
      // so this must be sent as FormData. Don't set Content-Type; the browser adds the boundary.
      query: ({ name }) => {
        const body = new FormData()
        body.append("name", name)
        return { url: "/v1/user/profile", method: "PUT", body }
      },
      invalidatesTags: ["Profile"],
    }),

    // GET /v1/user/locked-balance
    getLockedBalance: builder.query<GetLockedBalanceResponse, { tokenId?: string } | void>({
      query: (params) => {
        const tokenId = (params as { tokenId?: string })?.tokenId
        const url = "/v1/user/locked-balance"
        return tokenId ? `${url}?tokenId=${tokenId}` : url
      },
    }),

    // POST /v1/onboarding/submit-name
    submitName: builder.mutation<
      { statusCode: number; status: boolean; message: string; type: string },
      { name: string }
    >({
      query: (body) => ({
        url: "/v1/onboarding/submit-name",
        method: "POST",
        body,
      }),
      // Refetch the profile so the name (navbar, profile page, settings) and onboardingStatus
      // update right after the first-login username is set.
      invalidatesTags: ["Profile"],
    }),
  }),
})
export const {
  useLoginMutation,
  useLogoutMutation,
  useLoginWalletMutation,
  useVerifyWalletMutation,
  useProfileQuery,
  useGetLockedBalanceQuery,
  useSubmitNameMutation,
  useUpdateProfileMutation,
} = authApi
