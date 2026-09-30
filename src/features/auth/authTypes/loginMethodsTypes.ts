export const LOGIN_METHODS = {
  Email: "email",
  Google: "google",
  MetaMask: "metamask",
} as const

export type LoginMethod = (typeof LOGIN_METHODS)[keyof typeof LOGIN_METHODS] | null
