import React from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import LoginPage from '../src/components/LoginPage';
import RegisterPage from '../src/components/RegisterPage';

import HomePage from '../src/components/HomePage';
import NewsPage from '../src/components/NewsPage';
import ErrorBoundary from './ErrorBoundary'; // Import the Error Boundary


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" />} />
  
        <Route
          path="/news"
          element={
            <ErrorBoundary>
              <NewsPage /> {/* Wrap NewsPage with the ErrorBoundary */}
            </ErrorBoundary>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
