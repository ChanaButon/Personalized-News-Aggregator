import React, { useState } from 'react';
import axios from 'axios';

const SendUpdatesPage = () => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendUpdates = async (e) => {
    e.preventDefault();

    // ממיר את ההעדפות למערך
    const preferencesArray = preferences.split(',').map(pref => pref.trim());

    try {
      const response = await axios.post('http://localhost:3003/send-updates', {
        userEmail: email,
        preferences: preferencesArray
      });

      setSuccessMessage('Updates sent successfully!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to send updates. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="send-updates">
      <h2>Send News Updates</h2>
      <form onSubmit={handleSendUpdates}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="Enter your preferences (comma separated)"
        />
        <button type="submit" className="btn btn-primary">Send Updates</button>
      </form>
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default SendUpdatesPage;
