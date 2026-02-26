import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage';
import SigninPage from './SigninPage';
import SignupPage from './SignupPage';
import './App.css';

// Generate unique device ID
const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    // Create device ID
    const deviceId = getOrCreateDeviceId();
    
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    const lastPage = localStorage.getItem('lastPage');
    const wasGuest = localStorage.getItem('isGuest') === 'true';
    
    if (token && userData) {
      // User is logged in
      setUser(JSON.parse(userData));
      setIsGuest(false);
      localStorage.removeItem('isGuest');
      
      // If they were in chat before reload, stay in chat
      if (lastPage === 'chat') {
        setCurrentPage('chat');
      } else {
        setCurrentPage('landing');
      }
    } else if (wasGuest && lastPage === 'chat') {
      // Guest user was in chat - stay in chat
      setIsGuest(true);
      setUser(null);
      setCurrentPage('chat');
    } else {
      // Not logged in - go to landing
      setCurrentPage('landing');
    }
    
    setIsLoading(false);
  }, []);

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem('lastPage', currentPage);
  }, [currentPage]);

  const handleGuestStart = () => {
    const deviceId = getOrCreateDeviceId();
    localStorage.setItem('isGuest', 'true');
    setIsGuest(true);
    setUser(null);
    // Only initialize if not already set
    if (!localStorage.getItem(`guest_questions_${deviceId}`)) {
      localStorage.setItem(`guest_questions_${deviceId}`, '0');
    }
    setCurrentPage('chat');
  };

  const handleSigninSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
    // Clear device-based guest counter when signing in
    const deviceId = localStorage.getItem('device_id');
    localStorage.removeItem(`guest_questions_${deviceId}`);
    setCurrentPage('chat');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
    // Clear device-based guest counter when signing up
    const deviceId = localStorage.getItem('device_id');
    localStorage.removeItem(`guest_questions_${deviceId}`);
    setCurrentPage('chat');
  };

  const handleBackToHome = () => {
    localStorage.removeItem('conversations');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
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
          onSignIn={handleGoToSignin}
          onSignUp={handleGoToSignup}
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