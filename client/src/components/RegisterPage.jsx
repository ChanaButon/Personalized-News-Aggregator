import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/RegisterPage.css'

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferencesNews, setPreferencesNews] = useState('');
  const [preferencesTech, setPreferencesTech] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Convert preferences into arrays
    const preferences = {
      news: preferencesNews.split(',').map(item => item.trim()), // Split by commas
      technology: preferencesTech.split(',').map(item => item.trim()), // Split by commas
    };

    try {
      const response = await axios.post('http://localhost:3001/register', {
        name,
        email,
        password,
        preferences
      });

      localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user info
      navigate('/news'); // Redirect to news page
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          className="register-input name-input"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="register-input email-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          className="register-input password-input"
        />
        <textarea
          value={preferencesNews}
          onChange={(e) => setPreferencesNews(e.target.value)}
          placeholder="Enter your news preferences (comma separated)"
          className="preferences-input news-input"
        />
        <textarea
          value={preferencesTech}
          onChange={(e) => setPreferencesTech(e.target.value)}
          placeholder="Enter your technology preferences (comma separated)"
          className="preferences-input tech-input"
        />

        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="register-button">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
