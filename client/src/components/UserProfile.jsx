import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import  '../css/UserProfile.css';


const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:3001/update-user', {
        name, email, password, preferences
      });
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Update user info in localStorage
      setIsEditing(false); // Close edit form
    } catch (err) {
      setError('Failed to update user information');
    }
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      {/* Hamburger Button */}
      <button className="hamburger-menu" onClick={handleEditToggle}>
        &#9776; {/* 3 horizontal bars (hamburger icon) */}
      </button>

      {/* Display user info or show edit form */}
      {!isEditing ? (
        <div>
          <p>Name: {name}</p>
          <p>Email: {email}</p>
          <p>Preferences: {preferences}</p>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
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

export default UserProfile;
