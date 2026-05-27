export type SubscriptionType = string

export type RateLimitTier = string

export type OAuthProfileResponse = {
  account: {
    uuid: string
    email: string
    display_name?: string | null
    created_at?: string
  }
  organization: {
    uuid: string
    has_extra_usage_enabled?: boolean | null
    billing_type?: string | null
    subscription_created_at?: string | null
  }
}

export type OAuthTokenExchangeResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  account?: {
    uuid: string
    email_address: string
  }
  organization?: {
    uuid: string
  }
}

export type OAuthTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scopes: string[]
  subscriptionType: SubscriptionType | null
  rateLimitTier: RateLimitTier | null
  profile?: OAuthProfileResponse
  tokenAccount?: {
    uuid: string
    emailAddress: string
    organizationUuid?: string
  }
}
