import { Router } from 'express'
import health from './health.route'
import scraper from './scraper.route'
import approval from './approval.route'

const router = Router()
router.use('/health', health)
router.use('/scraper', scraper)
router.use('/approval', approval)

export default router
