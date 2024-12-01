// התקנת ספריות נדרשות
// npm install express nodemailer axios body-parser dotenv cors

const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // ייבוא חבילת CORS
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(bodyParser.json());
app.use(cors()); // מאפשר CORS עבור כל הדומיינים

// מגדיר את הטרנספורטר של Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // ניתן להחליף בשירות מייל אחר
  auth: {
    user: process.env.EMAIL_USER, // האימייל ממנו נשלחות ההודעות
    pass: process.env.EMAIL_PASS, // סיסמת האפליקציה
  },
});

// פונקציה לשליחת מייל
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// פונקציה להבאת חדשות ממקור חיצוני
async function fetchNews(query) {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    const response = await axios.get(`https://newsdata.io/api/1/news`, {
      params: {
        apikey: apiKey,
        q: query,
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

// מסלול לעדכון משתמשים לפי העדפותיהם
app.post('/send-updates', async (req, res) => {
  const { userEmail, preferences } = req.body;

  if (!userEmail || !preferences || preferences.length === 0) {
    return res.status(400).send('Missing userEmail or preferences');
  }

  try {
    let allNews = [];

    for (const preference of preferences) {
      const news = await fetchNews(preference);
      allNews = allNews.concat(news);
    }

    if (allNews.length === 0) {
      return res.status(200).send('No news updates available');
    }

    const newsSummary = allNews.map(
      (article) => `Title: ${article.title}\nLink: ${article.link}\n`
    ).join('\n');

    await sendEmail(
      userEmail,
      'Your News Updates',
      `Here are the latest updates based on your preferences:\n\n${newsSummary}`
    );

    res.status(200).send('Updates sent successfully');
  } catch (error) {
    console.error('Error sending updates:', error);
    res.status(500).send('Error sending updates');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
