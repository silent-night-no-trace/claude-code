export type StatusLineRateLimitWindow = {
  used_percentage: number
  resets_at: string
}

export type StatusLineRateLimits = {
  five_hour?: StatusLineRateLimitWindow
  seven_day?: StatusLineRateLimitWindow
}

export type StatusLineCommandInput = {
  rate_limits?: StatusLineRateLimits
  [key: string]: unknown
}
