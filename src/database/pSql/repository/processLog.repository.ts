import { DatabaseInitializer } from '../DatabaseInitializer'
import { IProcessLog } from '../../../interface'
import { jsonParse, jsonStringify } from '../../../utils'
import { IncludeOptions, WhereOptions } from 'sequelize'

export class ProcessLogRepository {
  async findAll(query: WhereOptions<IProcessLog>, options: IncludeOptions = {}): Promise<IProcessLog[]> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      options['where'] = query
      options['order'] = options.order ?? [['createdAt', 'DESC']]
      return jsonParse(jsonStringify(await dbInstance.ProcessLog.findAll(options)))
    } catch (error) {
      console.error('Error in findAll ProcessLog:', error)
      throw error
    }
  }

  async findOne(query: WhereOptions<IProcessLog>): Promise<IProcessLog | null> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.ProcessLog.findOne({ where: query })))
    } catch (error) {
      console.error('Error in findOne ProcessLog:', error)
      throw error
    }
  }

  async create(data: Partial<IProcessLog>): Promise<IProcessLog> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.ProcessLog.create(data)))
    } catch (error) {
      console.error('Error in create ProcessLog:', error)
      throw error
    }
  }

  async update(query: WhereOptions<IProcessLog>, data: Partial<IProcessLog>): Promise<[number]> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.ProcessLog.update(data, { where: query })
    } catch (error) {
      console.error('Error in update ProcessLog:', error)
      throw error
    }
  }

  async getLatestByType(processType: IProcessLog['processType']): Promise<IProcessLog | null> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.ProcessLog.findOne({
        where: { processType },
        order: [['createdAt', 'DESC']]
      })))
    } catch (error) {
      console.error('Error in getLatestByType ProcessLog:', error)
      throw error
    }
  }
}
