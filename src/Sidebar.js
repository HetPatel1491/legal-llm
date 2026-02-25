import React from 'react';
import './Sidebar.css';

function Sidebar({ 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation, 
  onDeleteConversation 
}) {
  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2>⚖️ Legal LLM</h2>
        <button className="new-chat-btn" onClick={onNewConversation}>
          + New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <p className="no-conversations">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                currentConversationId === conv.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-preview">
                <p className="conversation-title">
                  {conv.messages[0]?.content.substring(0, 30)}...
                </p>
                <p className="conversation-date">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </p>
              </div>
             <button
  className="delete-btn"
  onClick={(e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        fetch(`https://legal-llm-backend-production.up.railway.app/conversations/${conv.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: user.id
          })
        }).then(res => res.json())
          .then(data => {
            if (data.success) {
              console.log('Deleted from database');
              // ONLY delete from UI AFTER database confirms
              onDeleteConversation(conv.id);
            } else {
              alert('Failed to delete. Please try again.');
            }
          })
          .catch(err => {
            console.log('Delete error:', err);
            alert('Error deleting conversation');
          });
      } else {
        // If not logged in, just delete locally
        onDeleteConversation(conv.id);
      }
    }
  }}
>
  ✕
</button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>Help people understand law</p>
      </div>
    </div>
  );
}

export default Sidebar;