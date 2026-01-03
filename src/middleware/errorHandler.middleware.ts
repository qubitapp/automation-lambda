import { Request, Response, NextFunction } from 'express'

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface ApiErrorResponse {
  error: ApiError
  retry_after?: number
}

export class AppError extends Error {
  public statusCode: number
  public code: string
  public details?: any
  public isOperational: boolean

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    const errorResponse: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    }

    res.status(err.statusCode).json(errorResponse)
    return
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err)

  const errorResponse: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }

  res.status(500).json(errorResponse)
}

// Error factory functions for common errors
export const createUnauthorizedError = (message: string = 'Missing or invalid authentication') =>
  new AppError(401, 'UNAUTHORIZED', message)

export const createForbiddenError = (message: string = "User doesn't own this resource") =>
  new AppError(403, 'FORBIDDEN', message)

export const createNotFoundError = (message: string = "Resource doesn't exist") =>
  new AppError(404, 'NOT_FOUND', message)

export const createInvalidParameterError = (message: string, field?: string, value?: any) =>
  new AppError(400, 'INVALID_PARAMETER', message, field && value ? { field, value } : undefined)

export const createPlatformDisconnectedError = (platform: string) =>
  new AppError(424, 'PLATFORM_DISCONNECTED', `OAuth token expired for ${platform}`)

export const createRateLimitError = (retryAfter: number) => {
  const error = new AppError(
    429,
    'RATE_LIMIT_EXCEEDED',
    `Rate limit exceeded. Try again in ${retryAfter} seconds.`
  )
  // Add retry_after to response (handled in errorHandler)
  return error
}

export const createInternalError = (message: string = 'Internal server error') =>
  new AppError(500, 'INTERNAL_ERROR', message)
