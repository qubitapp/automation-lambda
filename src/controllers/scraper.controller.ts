import { ControllersRequest } from '../interface'
import { ScraperService } from '../service/scraper.service'
import { badRequest } from '../utils'

const scraperService = ScraperService.getInstance()

export const runScheduledScrape = async ({ request }: ControllersRequest) => {
  const limit = parseInt(request.query.limit as string) || 20
  const result = await ScraperService.getInstance().runScheduledScrape(
    ['marketingtechnews'],
    limit
  )

  return {
    success: true,
    message: 'Scheduled scrape completed',
    data: result
  }
}

export const scrapeUrls = async ({ request }: ControllersRequest) => {
  const { urls, category } = request.body

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw badRequest('URLs array is required')
  }

  const result = await scraperService.scrapeSpecificUrls(urls, category || 'Marketing')

  return {
    success: true,
    message: 'URL scraping completed',
    data: result
  }
}
