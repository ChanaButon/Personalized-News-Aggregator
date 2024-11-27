const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3503; // Dapr port for pub/sub
const daprPubSubName = "news-pubsub"; // Pub/Sub component name defined in Dapr
const topicName = "news-topic"; // Topic for publishing news articles

const daprPortUser = process.env.DAPR_HTTP_PORT_USER || 3505;
const userServiceAppId = 'user_server';

const daprPortNotification = process.env.DAPR_HTTP_PORT_NOTIFICATION || 3502;
const notificationServiceAppId = 'notification-service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint to fetch news, summarize, and publish to RabbitMQ
app.get('/process-news', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        console.log('Missing userId in request');
        return res.status(400).send('User ID is required');
    }

    console.log(`Processing news for userId: ${userId}`);

    try {
        // Fetch user preferences
        console.log('Fetching user preferences...');
        const userPreferences = await getUserPreferences(userId);
        console.log('User preferences fetched:', userPreferences);

        // Fetch news articles based on user preferences
        console.log('Fetching news articles...');
        const newsArticles = await fetchNewsArticles(userPreferences);
        console.log(`Fetched ${newsArticles.length} news articles`);

        // Summarize news articles using AI
        console.log('Generating summaries for news articles...');
        const summarizedNews = await generateSummaries(newsArticles);
        console.log('Summarized news generated:', summarizedNews);

        // Publish summarized news to RabbitMQ via Dapr
        console.log('Publishing summarized news to RabbitMQ...');
        await publishNews(summarizedNews);
        console.log('Summarized news published successfully to RabbitMQ');

        res.status(200).send('News processed and published successfully');
    } catch (error) {
        console.error('Error processing news:', error.message);
        res.status(500).send('Error processing news');
    }
});

// Publish summarized news to RabbitMQ via Dapr
async function publishNews(news) {
    try {
        const publishUrl = `http://localhost:${daprPort}/v1.0/publish/${daprPubSubName}/${topicName}`;
        const response = await axios.post(publishUrl, { news });
        console.log('Published news to RabbitMQ via Dapr:', response.data);
    } catch (error) {
        console.error('Error publishing news to RabbitMQ:', error.message);
        throw error;
    }
}

// Fetch the latest news articles based on user preferences
async function fetchNewsArticles(preferences) {
    const apiKey = process.env.NEWS_API_KEY;
    const query = preferences.join(',');
    const apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${query}`;

    console.log('Fetching news from API with query:', query);
    try {
        const response = await axios.get(apiUrl);
        console.log('News data fetched from API:', response.data.results);
        return response.data.results;
    } catch (error) {
        console.error('Error fetching news:', error.message);
        throw error;
    }
}

// Fetch user preferences using Dapr service invocation
async function getUserPreferences(userId) {
    try {
        console.log(`Fetching preferences for userId: ${userId}`);
        const response = await axios.get(`http://user_server:3001/preferences`, { params: { userId } });

        console.log('User preferences response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user preferences:', error.message);
        throw error;
    }
}

// Generate AI summaries for news articles
async function generateSummaries(news) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Starting summary generation for news articles...');
    const summarizedNews = await Promise.all(news.map(async (article) => {
        const prompt = `Summarize the following news article in 2-3 concise sentences:
        Title: ${article.title}
        Content: ${article.content}`;

        console.log('Generating summary for article:', { title: article.title });
        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        console.log('Summary generated:', summary);
        return {
            ...article,
            summary,
        };
    }));

    console.log('All summaries generated successfully');
    return summarizedNews;
}

app.post('/test-ai', async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) {
        console.error('Missing prompt in request body');
        return res.status(400).send({ error: 'Prompt is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        res.status(200).send(result.response.text());
    } catch (error) {
        console.error('Error in /test-ai endpoint:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`News Aggregator service listening on port ${port}`);
});
