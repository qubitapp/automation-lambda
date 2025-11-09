'use strict';

const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs').promises;
const RawNews = require('./models/rawNews');
const sequelize = require('./config/database');

// Enable Sequelize logging
sequelize.options.logging = console.log;

// Initialize database connection and create tables
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await RawNews.sync();
        console.log('RawNews table created successfully.');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

// Call initialize when the module loads
initializeDatabase();

// Store execution states in memory (in production, use a proper database)
const executionStates = new Map();

const createExecutionId = () => {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const saveExecutionState = async (executionId, state) => {
    const logsDir = path.join(__dirname, '../logs');
    try {
        await fs.mkdir(logsDir, { recursive: true });
        await fs.writeFile(
            path.join(logsDir, `${executionId}.json`),
            JSON.stringify(state)
        );
    } catch (error) {
        console.error('Error saving execution state:', error);
    }
};

const processNewsItems = async (newsItems, category, state) => {
    let newCount = 0;
    let skipCount = 0;

    for (const newsItem of newsItems) {
        try {
            // Extract URL from newsItem (using the 'id' field which contains the article URL)
            const url = newsItem.id;

            if (!url) {
                const errorMessage = `Skipping article due to missing URL: ${JSON.stringify(newsItem)}`;
                console.error(errorMessage);
                state.errors.push(errorMessage);
                continue;
            }

            // Check if article already exists
            const existingNews = await RawNews.findOne({ where: { url: url } });

            if (!existingNews) {
                // Create new record only if it doesn't exist
                const createdNews = await RawNews.create({
                    category: category,
                    url: url,
                    newsDetails: newsItem
                });
                newCount++;
                const logMessage = `Added new article: ${url}`;
                console.log(logMessage);
                state.output.push(logMessage);
                console.log(`Inserted news item with ID: ${createdNews.newsId}`);
            } else {
                skipCount++;
                const logMessage = `Skipped duplicate article: ${url}`;
                console.log(logMessage);
                state.output.push(logMessage);
            }

            // Debug: Log successful processing
            console.log('Successfully processed article with URL:', url);
        } catch (dbError) {
            const errorMessage = `Failed to process news item: ${dbError.message}\nItem: ${JSON.stringify(newsItem, null, 2)}`;
            console.error(errorMessage);
            state.errors.push(errorMessage);
        }
    }

    return { newCount, skipCount };
};

module.exports.execute = async (event) => {
    try {
        // Parse request body
        const body = event.body ? JSON.parse(event.body) : {};

        // Get category from request body
        const category = body.category;

        // Only proceed if category is provided
        if (!category) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Category parameter is required',
                    status: 'ERROR'
                }, null, 2)
            };
        }

        // Map category to script file
        const categoryScriptMap = {
            'marketing': 'marketing_news_scraper.py'
            // Add more mappings here for other categories
        };

        const scriptFileName = categoryScriptMap[category.toLowerCase()];
        if (!scriptFileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: `Unsupported category: ${category}. Supported categories are: ${Object.keys(categoryScriptMap).join(', ')}`,
                    status: 'ERROR'
                }, null, 2)
            };
        }

        const scriptPath = path.join(__dirname, 'scripts', scriptFileName);

        // Verify script exists
        try {
            await fs.access(scriptPath);
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Script not found for category: ${category}`,
                    status: 'ERROR'
                }, null, 2)
            };
        }

        // Configure python shell options
        let options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'], // unbuffered output
        };

        // Add any additional arguments if provided
        if (body.args) {
            options.args = body.args;
        }

        // Initialize execution state
        const executionId = createExecutionId();
        const state = {
            id: executionId,
            status: 'RUNNING',
            startTime: new Date().toISOString(),
            output: [],
            errors: []
        };

        // Start Python script execution in background
        const backgroundProcess = async () => {
            try {
                const pyshell = new PythonShell(scriptPath, options);

                await new Promise((resolve, reject) => {
                    pyshell.on('message', async (message) => {
                        state.output.push(message);
                        console.log('Python Output:', message);
                        await saveExecutionState(executionId, state);
                    });

                    pyshell.on('stderr', async (stderr) => {
                        state.errors.push(stderr);
                        console.error('Python Error:', stderr);
                        await saveExecutionState(executionId, state);
                    });

                    pyshell.end(async (err) => {
                        if (err) {
                            state.status = 'FAILED';
                            state.errors.push(err.message);
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });

                // Read and process the news file after scraping is complete
                const newsJsonPath = path.join(__dirname, '../news.json');
                let newsItems = [];
                try {
                    const newsData = await fs.readFile(newsJsonPath, 'utf8');
                    newsItems = JSON.parse(newsData);
                } catch (fileError) {
                    console.log('No news.json file found or no new articles to add');
                    state.output.push('No new articles to add to database');
                    state.status = 'COMPLETED';
                    state.endTime = new Date().toISOString();
                    await saveExecutionState(executionId, state);
                    return;
                }

                try {
                    // Process news items
                    const { newCount, skipCount } = await processNewsItems(newsItems, category, state);

                    const successMessage = `Operation completed: ${newCount} new articles added, ${skipCount} duplicates skipped`;
                    console.log(successMessage);
                    state.output.push(successMessage);
                    state.status = 'COMPLETED';
                    state.endTime = new Date().toISOString();

                    // Disable logging after we're done
                    sequelize.options.logging = false;
                } catch (dbError) {
                    state.status = 'FAILED';
                    const errorDetail = dbError.original ?
                        `${dbError.message} (SQL: ${dbError.original.message})` :
                        dbError.message;
                    state.errors.push(`Database operation failed: ${errorDetail}`);
                    console.error('Database error:', errorDetail);
                }

                await saveExecutionState(executionId, state);
            } catch (error) {
                state.status = 'FAILED';
                state.errors.push(`Background process error: ${error.message}`);
                await saveExecutionState(executionId, state);
            }
        };

        // Start the background process without waiting for it
        backgroundProcess().catch(error => {
            console.error('Background process error:', error);
        });

        // Return immediately with the execution ID
        return {
            statusCode: 202, // Accepted
            body: JSON.stringify({
                message: 'Script execution started',
                executionId: executionId,
                status: 'RUNNING'
            }, null, 2)
        };
    } catch (error) {
        console.error('Execution error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to start script execution',
                error: error.message
            }, null, 2)
        };
    }
};

module.exports.status = async (event) => {
    try {
        const executionId = event.pathParameters?.executionId;
        if (!executionId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Execution ID is required'
                })
            };
        }

        const logsDir = path.join(__dirname, '../logs');
        const statePath = path.join(logsDir, `${executionId}.json`);

        try {
            const stateData = await fs.readFile(statePath, 'utf8');
            const state = JSON.parse(stateData);

            return {
                statusCode: 200,
                body: JSON.stringify(state, null, 2)
            };
        } catch (error) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Execution not found',
                    executionId
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error fetching execution status',
                error: error.message
            })
        };
    }
};
