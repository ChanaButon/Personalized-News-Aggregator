import React from 'react';
import { Link } from 'react-router-dom';
import './css/Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome!</h1>
            <p>To continue, please select one of the options below:</p>
            <div className="button-container">
                <Link to="/register">
                    <button className="home-button register-button">Register</button>
                </Link>
                <Link to="/login">
                    <button className="home-button login-button">Login</button>
                </Link>
                <Link to="/dashboard">
                    <button className="home-button dashboard-button">Dashboard</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
