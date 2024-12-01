import React from 'react';
import { Link } from 'react-router-dom';
import '../css/HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to the News Aggregator</h1>
      <div className="button-group">
        <Link to="/login" className="btn primary">Login</Link>
        <Link to="/register" className="btn secondary">Register</Link>
      </div>
    </div>
  );
}

export default HomePage;
