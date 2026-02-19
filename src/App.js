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

  // Check if user is already logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsGuest(false);
      setCurrentPage('chat');
    }
  }, []);

  const handleGuestStart = () => {
    console.log('Guest button clicked');
    setIsGuest(true);
    setUser(null);
    localStorage.removeItem('conversations');
    setCurrentPage('chat');
  };

  const handleSigninSuccess = (userData) => {
    console.log('Sign in successful');
    setUser(userData);
    setIsGuest(false);
    setCurrentPage('chat');
  };

  const handleSignupSuccess = (userData) => {
    console.log('Sign up successful');
    setUser(userData);
    setIsGuest(false);
    setCurrentPage('chat');
  };

  const handleBackToHome = () => {
    console.log('Back to home');
    localStorage.removeItem('conversations');
    setCurrentPage('landing');
    setUser(null);
    setIsGuest(false);
  };

  const handleGoToSignin = () => {
    console.log('Going to sign in');
    setCurrentPage('signin');
  };

  const handleGoToSignup = () => {
    console.log('Going to sign up');
    setCurrentPage('signup');
  };

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