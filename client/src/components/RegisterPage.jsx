import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    preferences: { news: [], technology: [] },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: [...formData.preferences[name], value],
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/register", formData);
      alert("User registered successfully!");
      console.log(response.data);
      setFormData({
        name: "",
        email: "",
        password: "",
        preferences: { news: [], technology: [] },
      });
    } catch (error) {
      console.error("Error registering user:", error.message);
      setError(error.response?.data?.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div>
          <h4>Preferences</h4>
          <label>
            <input
              type="checkbox"
              name="news"
              value="Technology"
              onChange={handlePreferencesChange}
            />
            Technology News
          </label>
          <label>
            <input
              type="checkbox"
              name="news"
              value="Sports"
              onChange={handlePreferencesChange}
            />
            Sports News
          </label>
          <label>
            <input
              type="checkbox"
              name="technology"
              value="AI"
              onChange={handlePreferencesChange}
            />
            AI Topics
          </label>
          <label>
            <input
              type="checkbox"
              name="technology"
              value="Web Development"
              onChange={handlePreferencesChange}
            />
            Web Development
          </label>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RegisterPage;
