'use strict';

const RawNews = require('./models/rawNews');
const sequelize = require('./config/database');

// Initialize database connection
let isDbInitialized = false;
const initializeDatabase = async () => {
    if (!isDbInitialized) {
        try {
            await sequelize.authenticate();
            console.log('Database connection established.');
            isDbInitialized = true;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    }
};

module.exports.handler = async (event) => {
    try {
        // Initialize database connection
        await initializeDatabase();

        // Get newsId from path parameters
        const newsId = event.pathParameters?.newsId;

        if (!newsId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    message: 'newsId is required'
                }, null, 2)
            };
        }

        // Find the news item first to check if it exists
        const newsItem = await RawNews.findOne({
            where: { newsId },
            attributes: ['newsId', 'category', 'url'], // Only fetch necessary fields
            raw: true
        });

        if (!newsItem) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    message: `News item with ID ${newsId} not found`
                }, null, 2)
            };
        }

        // Delete the news item
        await RawNews.destroy({
            where: { newsId }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: 'News item deleted successfully',
                deletedItem: newsItem
            }, null, 2)
        };
    } catch (error) {
        console.error('Error deleting news:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: 'Error deleting news item',
                error: error.message
            }, null, 2)
        };
    }
};
