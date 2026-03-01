import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Sidebar from './Sidebar';
import './ChatPage.css';

function ChatPage({ isGuest, onBackToHome, onSignIn, onSignUp }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responseFormat, setResponseFormat] = useState('detailed');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 0);
    }
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const loadConversations = async () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    const isGuestMode = isGuest;

    if (token && userData && !isGuestMode) {
      const user = JSON.parse(userData);
      try {
        const response = await fetch(
          `https://legal-llm-backend-production.up.railway.app/conversations/${user.id}`
        );
        const data = await response.json();

        if (data.success && data.conversations.length > 0) {
          setConversations(data.conversations);
          const mostRecent = data.conversations[0];
          setCurrentConversationId(mostRecent.id);
          setMessages(mostRecent.messages);
        } else {
          createNewConversation();
        }
      } catch (error) {
        console.log('Could not load from database, using localStorage');
        loadFromLocalStorage();
      }
    } else {
      const deviceId = localStorage.getItem('device_id');
      const savedQuestionCount = parseInt(localStorage.getItem(`guest_questions_${deviceId}`) || '0');
      setQuestionCount(savedQuestionCount);
      
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
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
  };

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
    
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        selectConversation(updatedConversations[0].id);
      } else {
        const newId = Date.now().toString();
        const newConversation = {
          id: newId,
          messages: [],
          createdAt: new Date().toISOString(),
        };
        setConversations([newConversation]);
        setCurrentConversationId(newId);
        setMessages([]);
        setQuestionCount(0);
        localStorage.setItem('conversations', JSON.stringify([newConversation]));
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
      alert('You have reached the 5 question limit on this device. Please sign in or sign up to continue asking questions!');
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
      const deviceId = localStorage.getItem('device_id');
      const currentCount = parseInt(localStorage.getItem(`guest_questions_${deviceId}`) || '0');
      const newCount = currentCount + 1;
      localStorage.setItem(`guest_questions_${deviceId}`, newCount);
      setQuestionCount(newCount);
    }

    try {
      // Create empty bot message placeholder
      let botMessage = { role: 'bot', content: '' };
      let updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      const url = `https://legal-llm-backend-production.up.railway.app/ask?question=${encodeURIComponent(userQuestion)}&format=${responseFormat}`;
      const eventSource = new EventSource(url);

      let fullAnswer = '';

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.done) {
            // Streaming finished
            eventSource.close();
            setLoading(false);
            
            // Final save to database if user is logged in
            const token = localStorage.getItem('access_token');
            const userData = localStorage.getItem('user');
            
            if (token && userData && !isGuest) {
              const user = JSON.parse(userData);
              
              const messagesToSave = [...newMessages, { role: 'bot', content: fullAnswer }].map(msg => ({
                question: msg.role === 'user' ? msg.content : '',
                answer: msg.role === 'bot' ? msg.content : ''
              }));

              fetch('https://legal-llm-backend-production.up.railway.app/conversations/save', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  conversation_id: currentConversationId,
                  messages: messagesToSave,
                  title: userQuestion.substring(0, 50) || 'Untitled',
                  user_id: user.id
                })
              }).catch(dbError => console.log('Note: Could not save to database, but chat saved locally'));
            }
          } else if (data.error) {
            // Error occurred
            eventSource.close();
            botMessage = { role: 'bot', content: `Error: ${data.error}` };
            updatedMessages = [...newMessages, botMessage];
            setMessages(updatedMessages);
            saveMessagesToConversation(updatedMessages);
          } else if (data.word) {
            // Stream word received
            fullAnswer += data.word;
            botMessage = { role: 'bot', content: fullAnswer };
            updatedMessages = [...newMessages, botMessage];
            setMessages(updatedMessages);
            saveMessagesToConversation(updatedMessages);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        const botMessage = { role: 'bot', content: 'Error: Connection failed' };
        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages);
        saveMessagesToConversation(updatedMessages);
        setLoading(false);
      };

    } catch (error) {
      const botMessage = { role: 'bot', content: `Error: ${error.message}` };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveMessagesToConversation(updatedMessages);
      setLoading(false);
    }
  };

  return (
    <div className={`chat-page-with-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-header">
            <button className="back-btn" onClick={onBackToHome}>← Back</button>
            <button className="menu-btn" onClick={toggleSidebar}>☰ Menu</button>
            <h1>⚖️ Legal AI</h1>
            {isGuest && <p className="guest-badge">Guest Mode ({questionCount}/5)</p>}
            
            {isGuest && (
              <div className="auth-buttons">
                <button className="header-btn sign-in-btn" onClick={onSignIn}>
                  Sign In
                </button>
                <button className="header-btn sign-up-btn" onClick={onSignUp}>
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <h2>⚖️ Welcome to Legal AI</h2>
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
            <select 
              value={responseFormat} 
              onChange={(e) => setResponseFormat(e.target.value)}
              className="format-selector"
              disabled={loading}
            >
              <option value="detailed">Detailed</option>
              <option value="bullets">Bullet Points</option>
              <option value="simple">Simple</option>
              <option value="qa">Q&A</option>
            </select>

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
            ⚠️ Legal AI is AI and can make mistakes. Please double-check the responses before using them as legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;