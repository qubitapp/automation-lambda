import { Sequelize, DataTypes } from 'sequelize'
import { IRawNews, SequelizeAttributes } from '../../../interface'

export const RawNewsModel = (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<IRawNews> = {
    rawNewsId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Marketing'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    newsDetails: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    newsDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }

  const RawNews = sequelize.define('RawNews', attributes)

  RawNews.init(attributes as any, {
    sequelize,
    modelName: 'RawNews',
    tableName: 'RawNews',
    timestamps: true,
    underscored: false,
  })

  return RawNews
}
