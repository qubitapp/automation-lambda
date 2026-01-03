import { DatabaseInitializer } from '../DatabaseInitializer'
import { IRawNews } from '../../../interface'
import { jsonParse, jsonStringify } from '../../../utils'
import { IncludeOptions, WhereOptions } from 'sequelize'

export class NewsRepository {
  async findAllINews(query: WhereOptions<IRawNews>, options: IncludeOptions = {}): Promise<IRawNews[]> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      options['where'] = query
      options['order'] = options.order ?? [['name', 'ASC']]
      return jsonParse(jsonStringify(await dbInstance.RawNews.findAll(options)))
    } catch (error) {
      console.error('Error in findAllINews:', error)
      throw error
    }
  }

 

  async findSingleNews(query: WhereOptions<IRawNews>): Promise<IRawNews | null> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.RawNews.findOne({ where: query })))
    } catch (error) {
      console.error('Error in findSingleNews:', error)
      throw error
    }
  }

  async create(data: Omit<IRawNews, 'newsId'>): Promise<IRawNews> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return jsonParse(jsonStringify(await dbInstance.RawNews.create(data)))
    } catch (error) {
      console.error('Error in create:', error)
      throw error
    }
  }

  async update(query: WhereOptions<IRawNews>, data: Partial<IRawNews>): Promise<[number]> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.RawNews.update(data, { where: query })
    } catch (error) {
      console.error('Error in update:', error)
      throw error
    }
  }

  async delete(query: WhereOptions<IRawNews>): Promise<number> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.RawNews.destroy({ where: query })
    } catch (error) {
      console.error('Error in delete:', error)
      throw error
    }
  }

  async count(query: WhereOptions<IRawNews>): Promise<number> {
    try {
      const dbInstance = await DatabaseInitializer.getInstance().getConnection()
      return await dbInstance.RawNews.count({ where: query })
    } catch (error) {
      console.error('Error in count:', error)
      throw error
    }
  }
}
