import { LoggerProvider } from '../provider/logger.provider'
import { createInternalError } from '../middleware/errorHandler.middleware'

const logger = LoggerProvider.Instance.logger

export const health = function () {
  try {
    logger.info('health: Health check requested')

    const result = {
      message: 'Server is running',
    }

    logger.success('health: Server is healthy')
    return result
  } catch (error: any) {
    logger.error('health: Health check failed', { error: error.message })
    if (error.statusCode) {
      throw error
    }
    throw createInternalError('Health check failed')
  }
}
