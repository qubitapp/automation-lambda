import express from "express"
import serverless from "serverless-http"
import { MigrationObserver } from "./observers/migration.observer"
import routes from "./routes"
import { CorsProvider } from "./provider/cors"
import { errorHandler } from "./middleware/errorHandler.middleware"
import pkg from 'pg';

console.log("pg======>",typeof pkg);
const app = express()

async function loadServer() {
  new CorsProvider().corsRequest(app)
  app.use(express.json())
  app.use("/", routes)
  await MigrationObserver.getInstance().start()
  app.use(
    (
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(404).send()
    }
  )

  // Use the standardized error handler
  app.use(errorHandler as express.ErrorRequestHandler)
}
//console.log('pg loaded from layer:', pkg?.Client?.constructor?.name);
// Load the server and handle errors
loadServer().catch((error) => {
  console.error("Error loading server:", error)
})
export const handler = serverless(app)
