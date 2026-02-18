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
    localStorage.removeItem('conversations');
    setCurrentPage('chat');
  };

  const handleSignupSuccess = (userData) => {
    console.log('Sign up successful');
    setUser(userData);
    setIsGuest(false);
    localStorage.removeItem('conversations');
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