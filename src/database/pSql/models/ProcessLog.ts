import { Sequelize, DataTypes } from 'sequelize'
import { IProcessLog, SequelizeAttributes } from '../../../interface'

export const ProcessLogModel = (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<IProcessLog> = {
    processLogId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    processType: {
      type: DataTypes.ENUM('scrape', 'ai_process', 'approval'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'partial'),
      allowNull: false
    },
    urlsProcessed: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    urlsFailed: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    totalUrls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    successCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    failedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    errorDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }

  const ProcessLog = sequelize.define('ProcessLog', attributes)

  ProcessLog.init(attributes as any, {
    sequelize,
    modelName: 'ProcessLog',
    tableName: 'ProcessLog',
    timestamps: true,
    underscored: false,
  })

  return ProcessLog
}
