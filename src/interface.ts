import { Algorithm } from 'jsonwebtoken'
import { Request, Response } from 'express'
import { UUIDTypes } from 'uuid'
import { DataTypeAbstract, ModelAttributeColumnOptions, Sequelize } from 'sequelize'

export type DbModelName =
  | 'RawNews'
  | 'FilteredRawData'
  | 'ProcessLog'
  | 'sequelize'

export interface Env {
  ALLOWED_ORIGINS: string[]
  SQL_DATABASE: string
  SQL_HOST: string
  SQL_PORT: number
  SQL_USER: string
  SQL_PASSWORD: string
  SQL_LOG: boolean
  ALTER_TABLE: boolean
  JWT_AUDIENCE: string
  JWT_ISSUER: string
  JWT_ALGO: Algorithm
  JWT_EXPIRES_IN: number
  NETWORK_WEBHOOK_SECRET: string
  OPENAI_API_KEY:string
}

export interface ResponseData {
  code?: number
  alreadySendResponse?: boolean
}


export interface ControllersRequest {
  request: Request
  response: Response
}

export interface DBModels {
  RawNews: any
  FilteredRawData: any
  ProcessLog: any
  sequelize: Sequelize | null
  Sequelize: typeof Sequelize
}

type SequelizeAttribute = string | DataTypeAbstract | ModelAttributeColumnOptions

export type SequelizeAttributes<T extends { [key: string]: any }> = {
  [P in keyof T]: SequelizeAttribute
}

export interface IRawNews {
  rawNewsId: UUIDTypes
  newsDetails: any
  newsDate:Date
  category: string
  url: string
  approved: boolean
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IFilteredRawData {
  filteredId: UUIDTypes
  rawNewsId: UUIDTypes
  originalNewsDetails: any
  aiProcessedContent: IQubitBit | null
  category: string
  url: string
  approvedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface IQubitBit {
  title: string
  content: string
  url: string
  thumbnail: string
  typeOfBit: string
  publisherName: string
  dateOfNews: string
  category: string
  subcategory: string
}

export interface IProcessLog {
  processLogId: UUIDTypes
  processType: 'scrape' | 'ai_process' | 'approval'
  status: 'success' | 'failed' | 'partial'
  urlsProcessed: string[]
  urlsFailed: string[]
  totalUrls: number
  successCount: number
  failedCount: number
  errorDetails: any
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
export interface ScrapedArticle {
  id: string
  url: string
  title: string
  content: string
  thumbnail?: string
  category: string
  publisher_name?: string
  date_of_news?: string
  scraped_at?: string
}

export interface ScrapeResult {
  success: boolean
  total_articles: number
  articles: ScrapedArticle[]
  errors?: Array<{ source: string; error: string }>
}

