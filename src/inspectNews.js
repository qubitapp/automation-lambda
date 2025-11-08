const fs = require('fs').promises;
const path = require('path');

async function inspectNewsJson() {
    try {
        const newsJsonPath = path.join(__dirname, '../news.json');
        const newsData = await fs.readFile(newsJsonPath, 'utf8');
        const newsItems = JSON.parse(newsData);

        console.log('Number of news items:', newsItems.length);
        if (newsItems.length > 0) {
            console.log('\nStructure of first news item:');
            console.log(JSON.stringify(newsItems[0], null, 2));
            console.log('\nAvailable fields:', Object.keys(newsItems[0]).join(', '));
        }
    } catch (error) {
        console.error('Error reading news.json:', error);
    }
}

inspectNewsJson();
