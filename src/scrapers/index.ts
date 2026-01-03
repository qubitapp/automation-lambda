import { ScrapedArticle, ScrapeResult } from "../interface"
import { MarketingTechNewsScraper } from "./sources/MarketingTechNewsScraper"

type ScraperFn = (limit: number) => Promise<ScrapedArticle[]>

const SCRAPER_REGISTRY: Record<string, ScraperFn> = {
  marketingtechnews: (limit) => MarketingTechNewsScraper.scrape(limit, false),
}

export const scraperRegistry = {
  getAvailableScrapers(): string[] {
    return Object.keys(SCRAPER_REGISTRY)
  },

  async runScraper(name: string, limit: number = 20): Promise<ScrapedArticle[]> {
    const scraperFn = SCRAPER_REGISTRY[name.toLowerCase()]
    if (!scraperFn) {
      throw new Error(
        `Scraper "${name}" not found. Available: ${this.getAvailableScrapers().join(", ")}`
      )
    }
    return scraperFn(limit)
  },

  async runMultipleScrapers(
    sources: string[],
    limit: number = 20
  ): Promise<ScrapeResult> {
    const allArticles: ScrapedArticle[] = []
    const errors: Array<{ source: string; error: string }> = []

    for (const source of sources) {
      try {
        console.log(`Starting scraper: ${source}`)
        const articles = await this.runScraper(source, limit)
        allArticles.push(...articles)
        console.log(`Completed ${source}: ${articles.length} articles`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Scraper ${source} failed:`, errorMessage)
        errors.push({ source, error: errorMessage })
      }
    }

    return {
      success: allArticles.length > 0,
      total_articles: allArticles.length,
      articles: allArticles,
      errors: errors.length > 0 ? errors : undefined,
    }
  },
}

export { MarketingTechNewsScraper }
