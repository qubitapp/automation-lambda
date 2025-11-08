const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            connectTimeout: 60000 // 60 seconds
        },
        pool: {
            max: 5, // Maximum number of connection in pool
            min: 0, // Minimum number of connection in pool
            acquire: 30000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
            idle: 10000 // The maximum time, in milliseconds, that a connection can be idle before being released
        },
        retry: {
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            max: 3 // Maximum retry 3 times
        }
    }
);

module.exports = sequelize;
