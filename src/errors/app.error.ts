import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: ContentfulStatusCode,
    public code: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
