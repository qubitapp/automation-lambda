import { Router } from "express"
import { health } from "../controllers"
import { send } from "../provider"
const router = Router()
router.get("/", send(health, {}))

export default router
