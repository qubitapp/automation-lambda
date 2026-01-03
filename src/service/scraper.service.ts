import {
  NewsRepository,
  ProcessLogRepository,
} from "../database/pSql/repository"
import { IProcessLog, ScrapeResult } from "../interface"
import { scraperRegistry } from "../scrapers"

const log = {
  info: (message: string, data?: object) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : "")
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error instanceof Error ? error.message : error)
  },
  success: (message: string, data?: object) => {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : "")
  },
  warn: (message: string, data?: object) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : "")
  },
}

export class ScraperService {
  private static instance: ScraperService
  private rawNewsRepository = new NewsRepository()
  private processLogRepository = new ProcessLogRepository()

  static getInstance() {
    if (!this.instance) {
      this.instance = new ScraperService()
    }
    return this.instance
  }

  /* ===================================================== */

  async runScheduledScrape(
    sources: string[] = ["marketingtechnews"],
    limit = 20
  ): Promise<IProcessLog> {
    log.info("Starting scheduled scrape", { sources, limit })
    const processLog = await this.createProcessLog(sources.length)

    try {
      const result = await this.invokeScraper({ sources, limit })

      log.success("Scraping completed", {
        totalArticles: result.total_articles,
        sources
      })
      return await this.saveScrapedArticles(result, processLog, "Marketing")
    } catch (e: any) {
      log.error("Scraping failed", e)
      await this.failProcess(processLog, e.message)
      throw e
    }
  }

  /* ===================================================== */

  private async invokeScraper(payload: {
    sources: string[]
    limit: number
  }): Promise<ScrapeResult> {
    log.info("Running TypeScript scrapers", { sources: payload.sources, limit: payload.limit })
    return scraperRegistry.runMultipleScrapers(payload.sources, payload.limit)
  }

  /* ===================================================== */

  private async saveScrapedArticles(
    scrapeResult: ScrapeResult,
    processLog: IProcessLog,
    fallbackCategory: string
  ) {
    log.info("Saving scraped articles to RawNews", {
      totalArticles: scrapeResult.total_articles
    })

    const urlsProcessed: string[] = []
    const urlsFailed: string[] = []
    const skippedDuplicates: string[] = []

    let successCount = 0
    let failedCount = 0

    for (const article of scrapeResult.articles || []) {
      try {
        // Check for duplicate URL in RawNews table
        const exists = await this.rawNewsRepository.findSingleNews({
          url: article.url,
        })

        if (exists) {
          skippedDuplicates.push(article.url)
          log.warn("Skipping duplicate article", { url: article.url })
          continue
        }

        // Save to RawNews table
        await this.rawNewsRepository.create({
          url: article.url,
          category: article.category || fallbackCategory,
          newsDetails: article,
          approved: false,
          published: false,
          newsDate: article.date_of_news ? new Date(article.date_of_news) : new Date()
        } as any)

        urlsProcessed.push(article.url)
        successCount++
        log.success("Saved article to RawNews", {
          title: article.title,
          url: article.url
        })
      } catch (error) {
        urlsFailed.push(article.url)
        failedCount++
        log.error("Failed to save article", { url: article.url, error })
      }
    }

    const status =
      failedCount === 0 ? "success" : successCount === 0 ? "failed" : "partial"

    log.info("Scrape summary", {
      status,
      successCount,
      failedCount,
      skippedDuplicates: skippedDuplicates.length,
      totalProcessed: scrapeResult.total_articles
    })

    await this.processLogRepository.update(
      { processLogId: processLog.processLogId },
      {
        status,
        urlsProcessed,
        urlsFailed,
        totalUrls: scrapeResult.total_articles,
        successCount,
        failedCount,
        completedAt: new Date(),
        errorDetails: scrapeResult.errors?.length
          ? { scraperErrors: scrapeResult.errors }
          : null,
      }
    )

    return this.processLogRepository.findOne({
      processLogId: processLog.processLogId,
    }) as Promise<IProcessLog>
  }

  private createProcessLog(totalUrls: number) {
    return this.processLogRepository.create({
      processType: "scrape",
      status: "partial",
      urlsProcessed: [],
      urlsFailed: [],
      totalUrls,
      successCount: 0,
      failedCount: 0,
      startedAt: new Date(),
      errorDetails: null,
    })
  }

  private failProcess(processLog: IProcessLog, message: string) {
    return this.processLogRepository.update(
      { processLogId: processLog.processLogId },
      {
        status: "failed",
        completedAt: new Date(),
        errorDetails: { message },
      }
    )
  }

  async scrapeSpecificUrls(urls: string[], category: string): Promise<IProcessLog> {
    const processLog = await this.createProcessLog(urls.length)

    try {
      const articles = urls.map((url) => ({
        id: Buffer.from(url).toString("base64").slice(0, 32),
        url,
        title: "",
        content: "",
        category,
        scraped_at: new Date().toISOString(),
      }))

      const result: ScrapeResult = {
        success: true,
        total_articles: articles.length,
        articles,
      }

      return await this.saveScrapedArticles(result, processLog, category)
    } catch (e: any) {
      await this.failProcess(processLog, e.message)
      throw e
    }
  }

}
