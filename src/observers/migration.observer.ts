import { DatabaseInitializer } from '../database/pSql/DatabaseInitializer'

export class MigrationObserver {
  private static instance: MigrationObserver

  async start(): Promise<void> {
    await this.migrateSchema()
  }

  async migrateSchema(): Promise<void> {
    console.log('Migration start.')
    await DatabaseInitializer.getInstance().setupDatabaseProviders()
    console.log('Migration complete.')
  }

  static getInstance(): MigrationObserver {
    if (!MigrationObserver.instance) {
      MigrationObserver.instance = new MigrationObserver()
    }
    return MigrationObserver.instance
  }
}
