import { DatabaseInitializer } from '../DatabaseInitializer'
import { IFilteredRawData } from '../../../interface'
import { jsonParse, jsonStringify } from '../../../utils'
import { IncludeOptions, WhereOptions } from 'sequelize'

export class FilteredRawDataRepository {
  async findAll(query: WhereOptions<IFilteredRawData>, options: IncludeOptions = {}): Promise<IFilteredRawData[]> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      options['where'] = query
      options['order'] = options.order ?? [['createdAt', 'DESC']]
      return jsonParse(jsonStringify(await dbInstance.FilteredRawData.findAll(options)))
    } catch (error) {
      console.error('Error in findAll FilteredRawData:', error)
      throw error
    }
  }

  async findOne(query: WhereOptions<IFilteredRawData>): Promise<IFilteredRawData | null> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.FilteredRawData.findOne({ where: query })))
    } catch (error) {
      console.error('Error in findOne FilteredRawData:', error)
      throw error
    }
  }

  async create(data: Partial<IFilteredRawData>): Promise<IFilteredRawData> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.FilteredRawData.create(data)))
    } catch (error) {
      console.error('Error in create FilteredRawData:', error)
      throw error
    }
  }

  async update(query: WhereOptions<IFilteredRawData>, data: Partial<IFilteredRawData>): Promise<[number]> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.FilteredRawData.update(data, { where: query })
    } catch (error) {
      console.error('Error in update FilteredRawData:', error)
      throw error
    }
  }

  async delete(query: WhereOptions<IFilteredRawData>): Promise<number> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.FilteredRawData.destroy({ where: query })
    } catch (error) {
      console.error('Error in delete FilteredRawData:', error)
      throw error
    }
  }

  async count(query: WhereOptions<IFilteredRawData>): Promise<number> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.FilteredRawData.count({ where: query })
    } catch (error) {
      console.error('Error in count FilteredRawData:', error)
      throw error
    }
  }
}
