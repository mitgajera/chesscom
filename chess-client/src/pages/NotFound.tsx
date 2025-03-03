import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'; // Assuming you have a CSS file for styles

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="home-link">Go to Home</Link>
    </div>
  );
};

export default NotFound;
