const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
    newsId: {
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
        unique: true  // This ensures no duplicate URLs
    },
    newsDetails: {
        type: DataTypes.JSONB,
        allowNull: false
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
}, {
    tableName: 'news',
    timestamps: true
});

module.exports = News;
