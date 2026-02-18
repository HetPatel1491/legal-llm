import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Sidebar from './Sidebar';
import './ChatPage.css';

function ChatPage({ isGuest, onBackToHome }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const convs = JSON.parse(savedConversations);
      setConversations(convs);
      if (convs.length > 0) {
        const mostRecent = convs[0];
        setCurrentConversationId(mostRecent.id);
        setMessages(mostRecent.messages);
        if (isGuest) {
          setQuestionCount(mostRecent.messages.filter(m => m.role === 'user').length);
        }
      }
    } else {
      createNewConversation();
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newId);
    setMessages([]);
    setQuestionCount(0);
  };

  const selectConversation = (id) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setMessages(conversation.messages);
      if (isGuest) {
        setQuestionCount(conversation.messages.filter(m => m.role === 'user').length);
      }
    }
    setSidebarOpen(false);
  };

  const deleteConversation = (id) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    
    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        selectConversation(updatedConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const saveMessagesToConversation = (newMessages) => {
    setConversations(
      conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: newMessages }
          : conv
      )
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (isGuest && questionCount >= 5) {
      alert('You have reached the 5 question limit for guests. Please sign up to continue!');
      return;
    }

    const userQuestion = input;
    const userMessage = { role: 'user', content: userQuestion };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessagesToConversation(newMessages);
    setInput('');
    setLoading(true);

    if (isGuest) {
      setQuestionCount(questionCount + 1);
    }

    try {
      const response = await fetch('https://legal-llm-backend-production.up.railway.app/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();

      let botMessage;
      if (data.success) {
        botMessage = { role: 'bot', content: data.answer };
      } else {
        botMessage = { role: 'bot', content: `Error: ${data.error}` };
      }

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveMessagesToConversation(updatedMessages);
    } catch (error) {
      const botMessage = { role: 'bot', content: `Error: ${error.message}` };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveMessagesToConversation(updatedMessages);
    }

    setLoading(false);
  };

  return (
    <div className={`chat-page-with-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
      />

      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <button className="back-btn" onClick={onBackToHome}>← Back</button>
            <button className="menu-btn" onClick={toggleSidebar}>☰ Menu</button>
            <h1>⚖️ Legal AI Assistant - v1.0</h1>
            {isGuest && <p className="guest-badge">Guest Mode ({questionCount}/5)</p>}
            
            {isGuest && (
              <div className="auth-buttons">
                <button className="header-btn sign-in-btn" onClick={() => alert('Sign In page coming next')}>
                  Sign In
                </button>
                <button className="header-btn sign-up-btn" onClick={() => alert('Sign Up page coming next')}>
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <h2>⚖️ Welcome to Legal LLM</h2>
                <p>Ask any legal question and get instant answers</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && <div className="message bot loading">
              <div className="message-content">
                <div className="thinking">Thinking...</div>
              </div>
            </div>}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a legal question..."
              disabled={loading}
            />
            <button onClick={handleSendMessage} disabled={loading}>
              Send
            </button>
          </div>

          <div className="disclaimer">
            ⚠️ Legal LLM is AI and can make mistakes. Please double-check the responses before using them as legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;