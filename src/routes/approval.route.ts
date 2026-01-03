import { Router } from 'express'
import { send } from '../provider'
import {
  approveNews,
  bulkApproveNews,
  rejectNews,
  publishNews,
  getPendingApprovals,
  getApprovedNews,
  reprocessAI
} from '../controllers/approval.controller'

const router = Router()

router.get('/pending', send(getPendingApprovals, {}))
router.get('/approved', send(getApprovedNews, {}))
router.post('/approve/:rawNewsId', send(approveNews, {}))
router.post('/approve/bulk', send(bulkApproveNews, {}))
router.delete('/reject/:rawNewsId', send(rejectNews, {}))
router.post('/publish/:filteredId', send(publishNews, {}))
router.post('/reprocess/:filteredId', send(reprocessAI, {}))

export default router
