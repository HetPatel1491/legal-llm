import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './LandingPage';
import SigninPage from './SigninPage';
import SignupPage from './SignupPage';
import ChatPage from './ChatPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentPage('chat');
    }
  }, []);

  const handleSignIn = () => {
    setCurrentPage('signin');
  };

  const handleSignUp = () => {
    setCurrentPage('signup');
  };

  const handleGuest = () => {
    setCurrentPage('guest-chat');
  };

  const handleSigninSuccess = (userData) => {
    setUser(userData);
    setAccessToken(localStorage.getItem('access_token'));
    setCurrentPage('chat');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setAccessToken(localStorage.getItem('access_token'));
    setCurrentPage('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    setCurrentPage('landing');
  };

  const handleBackToHome = () => {
    setCurrentPage('landing');
  };

  const handleGoToSignin = () => {
    setCurrentPage('signin');
  };

  const handleGoToSignup = () => {
    setCurrentPage('signup');
  };

  return (
    <div className="app">
      {currentPage === 'landing' && (
        <LandingPage 
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onGuest={handleGuest}
        />
      )}

      {currentPage === 'signin' && (
        <SigninPage 
          onBackToHome={handleBackToHome}
          onGoToSignup={handleGoToSignup}
          onSigninSuccess={handleSigninSuccess}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage 
          onBackToHome={handleBackToHome}
          onGoToSignin={handleGoToSignin}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {currentPage === 'guest-chat' && (
        <ChatPage 
          isGuest={true}
          user={null}
          accessToken={null}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentPage === 'chat' && user && (
        <ChatPage 
          isGuest={false}
          user={user}
          accessToken={accessToken}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;