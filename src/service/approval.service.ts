import { NewsRepository, FilteredRawDataRepository, ProcessLogRepository } from '../database/pSql/repository'
import { OpenAIService } from './openai.service'
import { IRawNews, IFilteredRawData, IProcessLog } from '../interface'

export class ApprovalService {
  private static instance: ApprovalService
  private newsRepository: NewsRepository
  private filteredRawDataRepository: FilteredRawDataRepository
  private processLogRepository: ProcessLogRepository
  private openAIService: OpenAIService

  private constructor() {
    this.newsRepository = new NewsRepository()
    this.filteredRawDataRepository = new FilteredRawDataRepository()
    this.processLogRepository = new ProcessLogRepository()
    this.openAIService = OpenAIService.getInstance()
  }

  public static getInstance(): ApprovalService {
    if (!ApprovalService.instance) {
      ApprovalService.instance = new ApprovalService()
    }
    return ApprovalService.instance
  }

  async approveNews(rawNewsId: string): Promise<any> {
    // Find the raw news
    const rawNews = await this.newsRepository.findSingleNews({ rawNewsId })

    if (!rawNews) {
      throw new Error('News article not found')
    }

    if (rawNews.approved) {
      throw new Error('News article is already approved')
    }

    try {
      // Process with OpenAI
      const newsDetails = rawNews.newsDetails
      const aiProcessedContent = await this.openAIService.processNewsContent({
        title: newsDetails.title,
        content: newsDetails.content,
        url: rawNews.url,
        thumbnail: newsDetails.thumbnail,
        publisherName: newsDetails.publisher_name,
        dateOfNews: newsDetails.date
      })

      // Update raw news as approved
      await this.newsRepository.update(
        { rawNewsId },
        { approved: true }
      )

      // Create filtered raw data entry
      await this.filteredRawDataRepository.create({
        rawNewsId: rawNews.rawNewsId,
        originalNewsDetails: rawNews.newsDetails,
        aiProcessedContent,
        category: rawNews.category,
        url: rawNews.url,
        approvedAt: new Date()
      })



      return {
        ...aiProcessedContent,
       ...newsDetails
      }

    } catch (error) {
      // Update process log with failure
    console.error('Error approving news:', error)
      throw error
    }
  }

  async bulkApproveNews(rawNewsIds: string[]): Promise<{
    successful: IFilteredRawData[]
    failed: Array<{ rawNewsId: string; error: string }>
  }> {
    const successful: IFilteredRawData[] = []
    const failed: Array<{ rawNewsId: string; error: string }> = []

    // Create process log
    const processLog = await this.processLogRepository.create({
      processType: 'approval',
      status: 'partial',
      urlsProcessed: [],
      urlsFailed: [],
      totalUrls: rawNewsIds.length,
      successCount: 0,
      failedCount: 0,
      startedAt: new Date(),
      errorDetails: null
    })

    const urlsProcessed: string[] = []
    const urlsFailed: string[] = []

    for (const rawNewsId of rawNewsIds) {
      try {
        const filteredData = await this.approveNews(rawNewsId)
        successful.push(filteredData)
        urlsProcessed.push(filteredData.url)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        failed.push({ rawNewsId, error: errorMessage })
        urlsFailed.push(rawNewsId)
      }
    }

    // Update process log
    const status: IProcessLog['status'] = failed.length === 0
      ? 'success'
      : (successful.length === 0 ? 'failed' : 'partial')

    await this.processLogRepository.update(
      { processLogId: processLog.processLogId },
      {
        status,
        urlsProcessed,
        urlsFailed,
        successCount: successful.length,
        failedCount: failed.length,
        completedAt: new Date(),
        errorDetails: failed.length > 0 ? { failures: failed } : null
      }
    )

    return { successful, failed }
  }

  async rejectNews(rawNewsId: string): Promise<void> {
    const rawNews = await this.newsRepository.findSingleNews({ rawNewsId })

    if (!rawNews) {
      throw new Error('News article not found')
    }

    // Delete the raw news
    await this.newsRepository.delete({ rawNewsId })
  }

  async publishNews(filteredId: string): Promise<IFilteredRawData> {
    const filteredData = await this.filteredRawDataRepository.findOne({ filteredId })

    if (!filteredData) {
      throw new Error('Filtered news not found')
    }

    // Update raw news as published
    await this.newsRepository.update(
      { rawNewsId: filteredData.rawNewsId },
      { published: true }
    )

    return filteredData
  }

  async getPendingApprovals(limit: number = 50, offset: number = 0): Promise<IRawNews[]> {
    return this.newsRepository.findAllINews(
      { approved: false },
      { limit, offset, order: [['newsDate', 'DESC']] } as any
    )
  }

  async getApprovedNews(limit: number = 50, offset: number = 0): Promise<IFilteredRawData[]> {
    return this.filteredRawDataRepository.findAll(
      {},
      { limit, offset, order: [['approvedAt', 'DESC']] } as any
    )
  }

  async reprocessAI(filteredId: string): Promise<IFilteredRawData> {
    const filteredData = await this.filteredRawDataRepository.findOne({ filteredId })

    if (!filteredData) {
      throw new Error('Filtered news not found')
    }

    // Reprocess with OpenAI
    const newsDetails = filteredData.originalNewsDetails
    const aiProcessedContent = await this.openAIService.processNewsContent({
      title: newsDetails.title,
      content: newsDetails.content,
      url: filteredData.url,
      thumbnail: newsDetails.thumbnail,
      publisherName: newsDetails.publisher_name,
      dateOfNews: newsDetails.date
    })

    // Update filtered data
    await this.filteredRawDataRepository.update(
      { filteredId },
      { aiProcessedContent }
    )

    const updatedData = await this.filteredRawDataRepository.findOne({ filteredId })
    return updatedData!
  }
}
