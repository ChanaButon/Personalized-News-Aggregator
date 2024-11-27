import React, { useEffect, useState } from 'react';
import axios from 'axios';
import  '../css/UserProfile.css';


const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user); // לראות אם המידע תקין


  // Fetching news based on user's preferences
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/process-news?userId=${user._id}`);
        setNews(response.data);
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPreferences(user.preferences ? user.preferences.join(', ') : '');
      fetchNews();
    }
  }, [user]);

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle updating user info
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3001/update-user/${user._id}`, {
        name, email, password, preferences: preferences.split(',').map((pref) => pref.trim())
      });
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Update user info in localStorage
      setIsEditing(false); // Close edit form
    } catch (err) {
      setError('Failed to update user information');
    }
  };

  return (
    <div className="news-page">
      <h2>News</h2>
      
      {/* Hamburger Button */}
      <button className="hamburger-menu" onClick={handleEditToggle}>
        &#9776; {/* 3 horizontal bars (hamburger icon) */}
      </button>

      {/* Display news */}
      {news.length === 0 ? (
        <p>Loading news...</p>
      ) : (
        <ul>
          {news.map((article, index) => (
            <li key={index}>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Edit form */}
      {isEditing && (
        <form onSubmit={handleUpdate}>
          <h3>Edit Your Profile</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter new email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Enter new preferences (comma separated)"
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">Update</button>
        </form>
      )}
    </div>
  );
};

export default NewsPage;
