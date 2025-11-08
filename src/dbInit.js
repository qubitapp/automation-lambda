const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testConnection() {
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: console.log, // Enable logging to see what's happening
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        }
    );

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Define the News model
        const News = sequelize.define('News', {
            newsId: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'Marketing'
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            newsDetails: {
                type: Sequelize.JSONB,
                allowNull: false
            }
        }, {
            tableName: 'news',
            timestamps: true
        });

        // Force sync (this will drop the table if it exists and create a new one)
        await News.sync({ force: true });
        console.log('News table has been created');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
