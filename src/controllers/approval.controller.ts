import { ControllersRequest } from '../interface'
import { ApprovalService } from '../service/approval.service'
import { badRequest } from '../utils'

const approvalService = ApprovalService.getInstance()

export const approveNews = async ({ request }: ControllersRequest) => {
  const { rawNewsId } = request.params
  if (!rawNewsId) {
    throw badRequest('rawNewsId is required')
  }

  const result = await approvalService.approveNews(rawNewsId)

  return {
    success: true,
    message: 'News approved and processed with AI',
    data: result
  }
}

export const bulkApproveNews = async ({ request }: ControllersRequest) => {
  const { rawNewsIds } = request.body

  if (!rawNewsIds || !Array.isArray(rawNewsIds) || rawNewsIds.length === 0) {
    throw badRequest('rawNewsIds array is required')
  }
  const result = await approvalService.bulkApproveNews(rawNewsIds)
  return {
    success: true,
    message: `Approved ${result.successful.length} news, ${result.failed.length} failed`,
    data: result
  }
}

export const rejectNews = async ({ request }: ControllersRequest) => {
  const { rawNewsId } = request.params

  if (!rawNewsId) {
    throw badRequest('rawNewsId is required')
  }

  await approvalService.rejectNews(rawNewsId)

  return {
    success: true,
    message: 'News rejected and deleted'
  }
}

export const publishNews = async ({ request }: ControllersRequest) => {
  const { filteredId } = request.params

  if (!filteredId) {
    throw badRequest('filteredId is required')
  }

  const result = await approvalService.publishNews(filteredId)

  return {
    success: true,
    message: 'News published',
    data: result
  }
}

export const getPendingApprovals = async ({ request }: ControllersRequest) => {
  const limit = parseInt(request.query.limit as string) || 50
  const offset = parseInt(request.query.offset as string) || 0

  const news = await approvalService.getPendingApprovals(limit, offset)

  return {
    success: true,
    data: news,
    pagination: {
      limit,
      offset,
      count: news.length
    }
  }
}

export const getApprovedNews = async ({ request }: ControllersRequest) => {
  const limit = parseInt(request.query.limit as string) || 50
  const offset = parseInt(request.query.offset as string) || 0

  const news = await approvalService.getApprovedNews(limit, offset)

  return {
    success: true,
    data: news,
    pagination: {
      limit,
      offset,
      count: news.length
    }
  }
}

export const reprocessAI = async ({ request }: ControllersRequest) => {
  const { filteredId } = request.params

  if (!filteredId) {
    throw badRequest('filteredId is required')
  }

  const result = await approvalService.reprocessAI(filteredId)

  return {
    success: true,
    message: 'AI content reprocessed',
    data: result
  }
}
