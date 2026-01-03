import { Sequelize, DataTypes } from 'sequelize'
import { IFilteredRawData, SequelizeAttributes } from '../../../interface'

export const FilteredRawDataModel = (sequelize: Sequelize) => {
  const attributes: SequelizeAttributes<IFilteredRawData> = {
    filteredId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rawNewsId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'RawNews',
        key: 'rawNewsId'
      }
    },
    originalNewsDetails: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    aiProcessedContent: {
      type: DataTypes.JSONB,
      allowNull: true
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
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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

  const FilteredRawData = sequelize.define('FilteredRawData', attributes)

  FilteredRawData.init(attributes as any, {
    sequelize,
    modelName: 'FilteredRawData',
    tableName: 'FilteredRawData',
    timestamps: true,
    underscored: false,
  })

  return FilteredRawData
}
