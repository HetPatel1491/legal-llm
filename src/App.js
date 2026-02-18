import React, { useState } from 'react';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage';
import SigninPage from './SigninPage';
import SignupPage from './SignupPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);

  const handleGuestStart = () => {
    setIsGuest(true);
    setUser(null);
    // Clear previous conversations when starting as guest
    localStorage.removeItem('conversations');
    setCurrentPage('chat');
  };

  const handleSigninSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
    // Clear previous conversations when signing in
    localStorage.removeItem('conversations');
    setCurrentPage('chat');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
    // Clear previous conversations when signing up
    localStorage.removeItem('conversations');
    setCurrentPage('chat');
  };

  const handleBackToHome = () => {
    // Clear conversations and go back to landing
    localStorage.removeItem('conversations');
    setCurrentPage('landing');
    setUser(null);
    setIsGuest(false);
  };

  const handleGoToSignin = () => {
    setCurrentPage('signin');
  };

  const handleGoToSignup = () => {
    setCurrentPage('signup');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage 
          onGuestStart={handleGuestStart}
          onSigninClick={handleGoToSignin}
          onSignupClick={handleGoToSignup}
        />
      )}
      
      {currentPage === 'chat' && (
        <ChatPage 
          isGuest={isGuest}
          onBackToHome={handleBackToHome}
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
    </div>
  );
}

export default App;