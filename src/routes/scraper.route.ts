import { Router } from 'express'
import { send } from '../provider'
import {
  runScheduledScrape,
  scrapeUrls
} from '../controllers/scraper.controller'

const router = Router()

router.post('/run', send(runScheduledScrape, {}))
router.post('/urls', send(scrapeUrls, {}))

export default router
