import { DBModels } from "../../interface"
import { DbConnectionManager } from "../base/DbConnectionManager"
import { SqlConnectionManager } from "./connection/pSqlConnection"

export class DatabaseInitializer {
  private static instance: DatabaseInitializer
  public static getInstance(): DatabaseInitializer {
    // eslint-disable-next-line @typescript-eslint/tslint/config
    if (
      DatabaseInitializer.instance === null ||
      DatabaseInitializer.instance === undefined
    )
      DatabaseInitializer.instance = new DatabaseInitializer()
    return DatabaseInitializer.instance
  }

  public async setupDatabaseProviders() {
    await this.configureMySqlDb()
  }

  public async getConnection(): Promise<DBModels> {
    const manager: DbConnectionManager = new SqlConnectionManager()
    return manager.getConnection()
  }

  private async configureMySqlDb(): Promise<void> {
    const manager: DbConnectionManager = new SqlConnectionManager()
    await manager.getConnection()
  }
}
