import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferencesNews, setPreferencesNews] = useState('');
  const [preferencesTech, setPreferencesTech] = useState('');
 // const [role, setRole] = useState('user');  // ברירת מחדל היא 'user'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // ממיר את רשימות ההעדפות למערכים
    const preferences = {
      news: preferencesNews.split(',').map(item => item.trim()), // פיצול לפי פסיקים
      technology: preferencesTech.split(',').map(item => item.trim()), // פיצול לפי פסיקים
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
    <div className="register">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <textarea
          value={preferencesNews}
          onChange={(e) => setPreferencesNews(e.target.value)}
          placeholder="Enter your news preferences (comma separated)"
        />
        <textarea
          value={preferencesTech}
          onChange={(e) => setPreferencesTech(e.target.value)}
          placeholder="Enter your technology preferences (comma separated)"
        />

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
