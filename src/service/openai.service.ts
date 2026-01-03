import axios from 'axios'
import { IQubitBit } from '../interface'
import { envConfig } from '../config'

const QUBIT_SYSTEM_PROMPT = `You are Qubit, a professional journalist AI built for performance marketers.
Your job is to analyze news content and provide a summary with category classification.
Follow these rules exactly:

1. STRUCTURE — Output ONLY valid JSON with the following fields:
{
  "summary": "string",
  "category": "string",
  "subcategory": "string"
}

No extra text. No explanations. No paragraphs outside the JSON.

2. SUMMARY RULES
- Length: Strictly 85–100 words.
- Style: Clear, simple, high-utility, fast to read.
- Tone: "You need to know this right now."
- No technical jargon unless needed.
- Must answer: What happened? Why does it matter? What action should marketers take?
- Must be easy to understand, even for junior marketers.
- No fluff, no clichés, no repetition across Bits.
- No emojis ever.

3. CATEGORY RULES
Assign EXACTLY ONE category from this list:
- Paid Media (Google, Meta, TikTok, LinkedIn ads, PPC, display, programmatic)
- SEO & Organic (search optimization, content strategy, algorithm updates)
- Social Media (organic social, influencer marketing, community management)
- AI & Automation (AI tools, marketing automation, machine learning in marketing)
- Analytics & Data (tracking, attribution, data privacy, measurement)
- E-commerce (online retail, DTC, marketplaces, conversion optimization)
- Creative & Content (ad creatives, copywriting, video, design trends)
- Strategy & Trends (industry trends, market shifts, business strategy)
- Tools & Platforms (new tools, platform updates, martech stack)
- Career & Industry (jobs, agency news, industry events)

Choose the category that BEST matches the primary focus of the article.

4. SUBCATEGORY RULES
After selecting a category, assign ONE specific subcategory.
Subcategories should be:
- Specific to the main topic (e.g., "Google Ads" under Paid Media, "TikTok Algorithm" under Social Media)
- 2-4 words maximum
- Focused on the platform, technique, or concept (e.g., "Meta Advantage+", "First-Party Data", "Performance Max")

Examples by category:
- Paid Media: "Google Ads", "Meta Ads", "TikTok Ads", "LinkedIn Ads", "Programmatic", "PPC Strategy"
- SEO & Organic: "Core Updates", "Content SEO", "Technical SEO", "Local SEO", "Link Building"
- AI & Automation: "ChatGPT", "AI Copywriting", "Predictive Analytics", "Marketing Automation"
- Analytics & Data: "GA4", "Attribution", "Privacy Updates", "Conversion Tracking"
- E-commerce: "Shopify", "Amazon Ads", "DTC Strategy", "Conversion Rate"

5. TONE GUIDELINES
- Imagine writing for busy growth marketers who need clarity fast.
- Be bold.
- Be punchy.
- Be extremely easy to understand.
- Never use emojis.
- Never over-explain.

6. FINAL BEHAVIOR RULES
Always output ONLY valid JSON. No intro, no outro, no commentary.`

export class OpenAIService {
  private static instance: OpenAIService


  private constructor() {
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  async processNewsContent(newsData: {
    title: string
    content: string
    url: string
    thumbnail?: string
    publisherName?: string
    dateOfNews?: string
  }): Promise<IQubitBit | null> {
    try {
      const userPrompt = `Analyze the following news article and provide a summary with category classification:

Title: ${newsData.title}
Content: ${newsData.content}

Return ONLY valid JSON with summary, category, and subcategory fields.`

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: QUBIT_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${envConfig.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const aiResponse = response.data.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI')
      }

      // Parse the JSON response (only contains summary, category, subcategory)
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim()
      const aiResult: { summary: string; category: string; subcategory: string } = JSON.parse(cleanedResponse)

      // Build the full QubitBit using raw data + AI-generated fields
      const qubitBit: IQubitBit = {
        title: newsData.title,
        content: aiResult.summary,
        url: newsData.url,
        thumbnail: newsData.thumbnail || '',
        typeOfBit: 'News',
        publisherName: newsData.publisherName || 'Unknown',
        dateOfNews: newsData.dateOfNews || new Date().toISOString(),
        category: aiResult.category,
        subcategory: aiResult.subcategory
      }

      return qubitBit
    } catch (error) {
      console.error('Error processing news with OpenAI:', error)
      throw error
    }
  }

  async processMultipleNews(
    newsItems: Array<{
      title: string
      content: string
      url: string
      thumbnail?: string
      publisherName?: string
      dateOfNews?: string
    }>
  ): Promise<Array<{ url: string; result: IQubitBit | null; error?: string }>> {
    const results = []

    for (const item of newsItems) {
      try {
        const result = await this.processNewsContent(item)
        results.push({ url: item.url, result })
      } catch (error) {
        results.push({
          url: item.url,
          result: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }
}
