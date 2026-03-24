export interface HostedConfig {
  /** API key for the d8um hosted service. */
  apiKey: string
  /** Base URL for the hosted API. Defaults to 'https://api.d8um.dev'. */
  baseUrl?: string | undefined
  /** Default tenant ID for all operations. */
  tenantId?: string | undefined
  /** Request timeout in milliseconds. Default: 30000. */
  timeout?: number | undefined
}

export class D8umApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message)
    this.name = 'D8umApiError'
  }
}
