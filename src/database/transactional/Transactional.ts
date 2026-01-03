import { Transaction } from 'sequelize'
import { DatabaseInitializer } from '../pSql/DatabaseInitializer'
import { LoggerProvider } from '../../provider/logger.provider'
const loggerProvider = LoggerProvider.Instance

export function Transactional(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = async function (...args: any[]) {
    const dbInstance = await DatabaseInitializer.getInstance().getConnection()
    const t = (await dbInstance?.sequelize?.transaction()) as Transaction
    try {
      args.push({ transaction: t })
      loggerProvider.logger.info(`Starting transaction for ${target.constructor.name}.${propertyKey}`)
      // Pass transaction as last argument
      const result = await originalMethod.apply(this, args)
      loggerProvider.logger.info(`Transaction successful for ${target.constructor.name}.${propertyKey}`, result)
      await t.commit()
      return result
    } catch (error) {
      loggerProvider.logger.error(`Transaction failed ${target.constructor.name}: {${propertyKey}}`, error)
      await t.rollback()
      throw error
    }
  }
}
