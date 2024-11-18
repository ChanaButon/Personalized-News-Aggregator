import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { state } = useLocation();
  const { user } = state;
  const [preferences, setPreferences] = useState(user.preferences);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `http://localhost:3001/news`,
          { params: { preferences } } // Send preferences to the backend as query params
        );
        setNews(response.data);
      } catch (err) {
        console.error("Error fetching news:", err.message);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (preferences.news.length || preferences.technology.length) {
      fetchNews();
    }
  }, [preferences]);

  const handlePreferenceChange = (category, value) => {
    // Update the preferences locally
    setPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {user.name}</h2>

      <section style={{ margin: "1rem 0" }}>
        <h3>Your Preferences</h3>
        <pre>{JSON.stringify(preferences, null, 2)}</pre>

        {/* Example: Allow user to update preferences */}
        <button
          onClick={() =>
            handlePreferenceChange("news", [...preferences.news, "NewCategory"])
          }
        >
          Add News Category
        </button>
      </section>

      <section>
        <h3>News</h3>
        {loading && <p>Loading news...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && news.length === 0 && <p>No news available for your preferences.</p>}
        {news.map((article, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ddd",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h4>{article.title}</h4>
            <p>{article.summary}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
