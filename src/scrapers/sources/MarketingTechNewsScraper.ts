import axios from "axios"
import * as cheerio from "cheerio"
import { ScrapedArticle } from "../../interface"
import { parseDateToUTC } from "../../utils"

const BASE_URL = "https://www.marketingtechnews.net"
const NEWS_URL = `${BASE_URL}/news/`
const CATEGORY = "Marketing"

export class MarketingTechNewsScraper {
  private static seenUrls = new Set<string>()

  private static isToday(dateStr: string | undefined): boolean {
    if (!dateStr) return false
    const articleDate = new Date(dateStr)
    const today = new Date()
    return (
      articleDate.getFullYear() === today.getFullYear() &&
      articleDate.getMonth() === today.getMonth() &&
      articleDate.getDate() === today.getDate()
    )
  }

  private static normalizeUrl(path: string): string {
    // Trim whitespace first
    const trimmedPath = path.trim()

    // If path already starts with http, use it as-is
    if (
      trimmedPath.startsWith("http://") ||
      trimmedPath.startsWith("https://")
    ) {
      return trimmedPath
    }
    // Otherwise prepend BASE_URL
    return `${BASE_URL}${trimmedPath.startsWith("/") ? "" : "/"}${trimmedPath}`
  }

  static async scrapeList(
    limit = 20,
    todayOnly = true
  ): Promise<ScrapedArticle[]> {
    const { data } = await axios.get(NEWS_URL, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    const $ = cheerio.load(data)
    const articles: ScrapedArticle[] = []

    $("article").each((_, el) => {
      if (articles.length >= limit) return false

      const title = $(el).find("h3 a").text().trim()
      const path = $(el).find("h3 a").attr("href")
      const rawMetaText = $(el)
        .find(".byline .content")
        .clone()
        .children("a")
        .remove()
        .end()
        .text()
        .trim()

      console.log(`Raw meta text: ${rawMetaText}`)

      const publishedAtText = rawMetaText.replace("|", "").trim()

      const publishedAt = publishedAtText
        ? parseDateToUTC(publishedAtText)
        : undefined

      console.log(`Found article: ${title} - ${path} - ${publishedAt}`)

      if (!title || !path) return

      // Filter for today's news only
      if (todayOnly && !this.isToday(publishedAt)) return

      const url = this.normalizeUrl(path)

      // Skip duplicates
      if (this.seenUrls.has(url)) return
      this.seenUrls.add(url)

      articles.push({
        id: url,
        url,
        title,
        content: "",
        category: CATEGORY,
        publisher_name: "Marketing Tech News",
        date_of_news: publishedAt,
        scraped_at: new Date().toISOString(),
      })
    })

    return articles
  }

  static async scrapeDetail(article: ScrapedArticle): Promise<ScrapedArticle> {
    const { data } = await axios.get(article.url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    const $ = cheerio.load(data)

    article.content = $(".entry-content p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join("\n\n")

    article.thumbnail =
      $("meta[property='og:image']").attr("content") || undefined

    return article
  }

  static async scrape(limit = 20, todayOnly = true): Promise<ScrapedArticle[]> {
    // Clear seen URLs at the start of each scrape run
    this.seenUrls.clear()

    const list = await this.scrapeList(limit, todayOnly)
    const results: ScrapedArticle[] = []

    console.log(
      `Found ${list.length} articles${todayOnly ? " from today" : ""}`
    )

    for (const article of list) {
      try {
        const full = await this.scrapeDetail(article)
        results.push(full)
        console.log(`Scraped: ${article.title}`)
      } catch (err) {
        console.error("Failed:", article.url)
      }
    }

    return results
  }
}
