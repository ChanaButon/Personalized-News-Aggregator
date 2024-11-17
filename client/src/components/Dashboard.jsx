// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { state } = useLocation();
  const { user } = state;
  const [preferences, setPreferences] = useState(user.preferences);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      // Call your backend to fetch news based on preferences
      // Example: `http://localhost:3001/news?preferences=${preferences}`
    };
    fetchNews();
  }, [preferences]);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <h3>Your Preferences</h3>
      <pre>{JSON.stringify(preferences, null, 2)}</pre>
      <h3>News</h3>
      {news.map((article, idx) => (
        <div key={idx}>
          <h4>{article.title}</h4>
          <p>{article.summary}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
