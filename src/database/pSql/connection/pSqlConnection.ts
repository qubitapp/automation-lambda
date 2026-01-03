import { Sequelize } from 'sequelize'
import { configSqlDb, envConfig } from '../../../config'
import { DbModelName, DBModels } from '../../../interface'
import { isNil } from '../../../utils'
import { RawNewsModel, FilteredRawDataModel, ProcessLogModel } from '../models'

export class SqlConnectionManager {
  private static instance: DBModels | null | undefined = null
  private static db: DBModels = {
    RawNews: null,
    FilteredRawData: null,
    ProcessLog: null,
    sequelize: null,
    Sequelize: Sequelize,
  }

  getConnection = async () => {
    if (SqlConnectionManager.instance === null || SqlConnectionManager.instance === undefined)
      SqlConnectionManager.instance = await this.getSqlInstance()

    return SqlConnectionManager.instance
  }

  getSqlInstance = async () => {
    const sequelize = new Sequelize(configSqlDb)
    await sequelize.authenticate()

    const rawNews = RawNewsModel(sequelize)
    const filteredRawData = FilteredRawDataModel(sequelize)
    const processLog = ProcessLogModel(sequelize)

    SqlConnectionManager.db.RawNews = rawNews
    SqlConnectionManager.db.FilteredRawData = filteredRawData
    SqlConnectionManager.db.ProcessLog = processLog

    // invoke associations on each of the models
    Object.keys(SqlConnectionManager.db).forEach((modelName: string) => {
      this.associate(modelName as DbModelName)
    })

    await sequelize.sync({
      logging: false,
      alter: envConfig.ALTER_TABLE,
    })

    const instance = {
      ...SqlConnectionManager.db,
      sequelize,
      Sequelize,
    }
    return instance
  }

  associate = (modelName: DbModelName) => {
    if (
      !isNil(modelName) &&
      Object.hasOwnProperty.call(SqlConnectionManager.db, modelName) &&
      !isNil(SqlConnectionManager.db[modelName as keyof DBModels]) &&
      Object.hasOwnProperty.call(SqlConnectionManager.db[modelName as keyof DBModels], 'associate')
    )
      (SqlConnectionManager.db[modelName as keyof DBModels] as any).associate(SqlConnectionManager.db)
  }
}
