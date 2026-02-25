import React from 'react';
import './LandingPage.css';

function LandingPage({ onSignIn, onSignUp, onGuest }) {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-logo">⚖️ Legal AI</div>
        <div className="navbar-buttons">
          <button className="btn-secondary" onClick={onSignIn}>
            Sign In
          </button>
          <button className="btn-primary" onClick={onSignUp}>
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero">
        <h1>Your AI Legal Assistant</h1>
        <p>Get instant answers to your legal questions</p>
        
        {/* Features Grid */}
        <div className="features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Instant Answers</h3>
            <p>Get legal information in seconds</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Private & Secure</h3>
            <p>Your data is protected</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💚</div>
            <h3>Free Forever</h3>
            <p>Legal assistance for everyone</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button className="btn-primary" onClick={onSignUp}>
            Create Account
          </button>
          <button className="btn-secondary" onClick={onGuest}>
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Help people understand law. Free legal assistance for everyone.</p>
        <p>© 2026 Legal AI. All rights reserved.</p>
      </div>
    </div>
  );
}

export default LandingPage;