const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3503; // Dapr port for pub/sub
const daprPortUser = process.env.DAPR_HTTP_PORT_USER || 3500;
const userServiceAppId = 'user-service';
const daprPortNotification = process.env.DAPR_HTTP_PORT_NOTIFICATION || 3502;
const notificationServiceAppId = 'notification-service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint to fetch news and send email to user
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

        // Fetch user email
        console.log('Fetching user email...');
        const userEmail = await getUserEmail(userId);
        console.log('User email fetched:', userEmail);

        // Fetch news articles based on user preferences
        console.log('Fetching news articles...');
        const newsArticles = await fetchNewsArticles(userPreferences);
        console.log(`Fetched ${newsArticles.length} news articles`);

        // AI summarized news
        console.log('Generating summaries for news articles...');
        const summarizedNews = await generateSummaries(newsArticles);
        console.log('Summarized news generated:', summarizedNews);

        // Send email to user
        console.log('Sending email...');
        await sendEmail(userEmail, summarizedNews);
        console.log('Email request published successfully:', { email: userEmail, newsCount: summarizedNews.length });

        res.status(200).send('News processed and email sent successfully');
    } catch (error) {
        console.error('Error processing news and sending email:', error.message);
        res.status(500).send('Error processing news and sending email');
    }
});

// Function to send email of the news to the user
async function sendEmail(email, news) {
    try {
        console.log('Sending email with news data:', { email, news });
        const response = await axios.post(`http://notification-service-dapr:${daprPortNotification}/v1.0/invoke/${notificationServiceAppId}/method/send-email`, {
            email,
            news
        });
        console.log('Email sent successfully');
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error sending email:', error.response.status, error.response.data);
        } else {
            console.error('Error sending email:', error.message);
        }
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
        const response = await axios.get(`http://user-service-dapr:${daprPortUser}/v1.0/invoke/${userServiceAppId}/method/preferences`, {
            params: { userId }
        });
        console.log('User preferences response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user preferences:', error.message);
        throw error;
    }
}

// Fetch user email using Dapr service invocation
async function getUserEmail(userId) {
    try {
        console.log(`Fetching email for userId: ${userId}`);
        const response = await axios.get(`http://user-service-dapr:${daprPortUser}/v1.0/invoke/${userServiceAppId}/method/user/email/`, {
            params: { userId }
        });
        console.log('User email response:', response.data);
        return response.data.email;
    } catch (error) {
        if (error.response) {
            console.error('Error fetching user email:', error.response.status, error.response.data);
        } else {
            console.error('Error fetching user email:', error.message);
        }
        throw error;
    }
}

// Function to generate AI summaries
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

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`News Aggregator service listening on port ${port}`);
});
