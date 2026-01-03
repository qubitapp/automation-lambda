import { ScraperService } from '../service/scraper.service'
import { DatabaseInitializer } from '../database/pSql/DatabaseInitializer'

interface LambdaContext {
  functionName: string
  awsRequestId: string
}

/**
 * Lambda handler for EventBridge scheduled scraping events.
 * This function is triggered by a schedule rule (e.g., every hour or daily).
 */
export const handler = async (event: Record<string, unknown>, context: LambdaContext) => {
  console.log('Scheduled scraper triggered')
  console.log('Event:', JSON.stringify(event))
  console.log('Context:', JSON.stringify({
    functionName: context.functionName,
    awsRequestId: context.awsRequestId
  }))

  try {
    // Initialize database connection
    await DatabaseInitializer.getInstance().setupDatabaseProviders()

    // Run the scraper
    const scraperService = ScraperService.getInstance()
    const result = await ScraperService.getInstance().runScheduledScrape(
  ['marketingtechnews'],
  20
)

    console.log('Scraping completed successfully')
    console.log('Result:', JSON.stringify({
      processLogId: result.processLogId,
      status: result.status,
      successCount: result.successCount,
      failedCount: result.failedCount
    }))

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Scheduled scrape completed',
        processLogId: result.processLogId,
        status: result.status,
        successCount: result.successCount,
        failedCount: result.failedCount
      })
    }

  } catch (error) {
    console.error('Scheduled scraper error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Scheduled scrape failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
