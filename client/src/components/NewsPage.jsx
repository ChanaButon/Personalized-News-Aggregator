import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/styles.css';

const NewsPage = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [currentPreferences, setCurrentPreferences] = useState({
    news: [],
    technology: [],
  });
  const [updatedPreferences, setUpdatedPreferences] = useState({
    news: [],
    technology: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Handle sidebar state

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    console.log('User data:', userFromStorage);

    if (!userFromStorage) {
      setErrorMessage('User not logged in');
      setIsLoading(false);
      return;
    }

    setUserData(userFromStorage);
    setCurrentPreferences(userFromStorage.preferences);

    async function fetchNewsArticles() {
      try {
        console.log('Fetching news for user:', userFromStorage._id);
        const response = await axios.get(`http://localhost:3002/process-news?userId=${userFromStorage._id}`);
        console.log('News fetched:', response.data);
        if (response.data.news) {
          setNewsArticles(response.data.news);
        } else {
          setErrorMessage('No news available.');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setErrorMessage('Error fetching news');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNewsArticles();
  }, []);

  const handlePreferenceChange = (category, event) => {
    setUpdatedPreferences({
      ...updatedPreferences,
      [category]: event.target.value.split(',').map(item => item.trim()),
    });
  };

  const handlePreferencesUpdate = async () => {
    try {
      console.log('Updating preferences for user:', userData._id);
      const response = await axios.put('http://localhost:3001/preferences', {
        userId: userData._id,
        preferences: updatedPreferences,
      });

      if (response.data.message === 'Preferences updated successfully') {
        setCurrentPreferences(updatedPreferences);
        alert('Preferences updated successfully');

        // Send email notification
        try {
          await axios.post('http://localhost:3003/send-updates', {
            userEmail: userData.email,
            preferences: Object.values(updatedPreferences).flat(),
          });
          console.log('Email sent successfully.');
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          alert('Preferences updated but failed to send email notification.');
        }
      } else {
        setErrorMessage('Error updating preferences');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setErrorMessage('Error updating preferences');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (errorMessage) return <p>{errorMessage}</p>;

  return (
    <div className="news-page">
      <h1>Latest News</h1>
      {newsArticles.length === 0 ? (
        <p>No news available.</p>
      ) : (
        newsArticles.map((article, index) => (
          <div key={index} className="news-article">
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <a href={article.link} target="_blank" rel="noopener noreferrer">Read More</a>
          </div>
        ))
      )}

      <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? 'Close User Info' : 'Open User Info'}
      </button>

      {isSidebarOpen && userData && (
        <div className="sidebar">
          <h2>User Information</h2>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Role:</strong> {userData.role}</p>

          <h3>Current Preferences</h3>
          <p><strong>News Categories:</strong> {currentPreferences.news.join(', ')}</p>
          <p><strong>Technology Topics:</strong> {currentPreferences.technology.join(', ')}</p>

          <h3>Update Preferences</h3>
          <div>
            <label>
              News Categories (comma separated):
              <input
                type="text"
                value={updatedPreferences.news.join(', ')}
                onChange={(e) => handlePreferenceChange('news', e)}
              />
            </label>
          </div>
          <div>
            <label>
              Technology Topics (comma separated):
              <input
                type="text"
                value={updatedPreferences.technology.join(', ')}
                onChange={(e) => handlePreferenceChange('technology', e)}
              />
            </label>
          </div>
          <button onClick={handlePreferencesUpdate}>Update Preferences</button>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
