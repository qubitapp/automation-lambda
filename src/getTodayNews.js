'use strict';

const News = require('./models/news');
const sequelize = require('./config/database');
const { Op } = require('sequelize');

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

        // Get parameters from query string
        const queryParams = event.queryStringParameters || {};
        const category = queryParams.category;
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        
        // Validate pagination parameters
        if (page < 1) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    message: 'Page number must be greater than 0'
                })
            };
        }

        if (limit < 1 || limit > 100) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    message: 'Limit must be between 1 and 100'
                })
            };
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Create base query
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const whereClause = {
            createdAt: {
                [Op.gte]: today
            }
        };

        // Add category filter if provided
        if (category) {
            whereClause.category = category;
        }

        // Query the database with pagination
        const { count, rows: news } = await News.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            raw: true, // Returns plain objects instead of Sequelize instances
            attributes: ['newsId', 'category', 'url', 'newsDetails', 'createdAt', 'updatedAt'], // Explicitly select needed fields
            logging: false // Disable query logging for better performance
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Enable CORS
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                data: news,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: count,
                    totalPages: totalPages,
                    hasNextPage: hasNextPage,
                    hasPreviousPage: hasPreviousPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    previousPage: hasPreviousPage ? page - 1 : null
                }
            }, null, 2)
        };
    } catch (error) {
        console.error('Error fetching news:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Enable CORS
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: 'Error fetching news',
                error: error.message
            }, null, 2)
        };
    }
};
