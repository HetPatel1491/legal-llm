import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage';
import SigninPage from './SigninPage';
import SignupPage from './SignupPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    const lastPage = localStorage.getItem('lastPage');
    
    if (token && userData) {
      // User is logged in
      setUser(JSON.parse(userData));
      setIsGuest(false);
      
      // If they were in chat before reload, stay in chat
      if (lastPage === 'chat') {
        setCurrentPage('chat');
      } else {
        // Otherwise go to landing
        setCurrentPage('landing');
      }
    } else {
      // Not logged in - always go to landing
      setCurrentPage('landing');
    }
    
    setIsLoading(false);
  }, []);

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem('lastPage', currentPage);
  }, [currentPage]);

  const handleGuestStart = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.removeItem('conversations');
    setCurrentPage('chat');
  };

  const handleSigninSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
    // Don't clear conversations - keep them!
    setCurrentPage('chat');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
    // Don't clear conversations - keep them!
    setCurrentPage('chat');
  };

  const handleBackToHome = () => {
  // DON'T remove conversations - keep them!
  // localStorage.removeItem('conversations');  // ← COMMENT THIS OUT
  setCurrentPage('landing');
  setUser(null);
  setIsGuest(false);
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

  const handleGoToSignin = () => {
    setCurrentPage('signin');
  };

  const handleGoToSignup = () => {
    setCurrentPage('signup');
  };

  if (isLoading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage 
          onSignIn={handleGoToSignin}
          onSignUp={handleGoToSignup}
          onGuest={handleGuestStart}
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
          onBackToHome={handleGoToSignin}
          onGoToSignup={handleGoToSignup}
          onSigninSuccess={handleSigninSuccess}
        />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage 
          onBackToHome={handleGoToSignin}
          onGoToSignin={handleGoToSignin}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
    </div>
  );
}

export default App;