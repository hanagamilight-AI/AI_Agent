import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'New conversation', messages: [], timestamp: Date.now() }
  ]);
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New conversation',
      messages: [],
      timestamp: Date.now()
    };
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'New conversation',
        messages: [],
        timestamp: Date.now()
      };
      setConversations([newConv]);
      setActiveConversationId(newConv.id);
    } else {
      setConversations(filtered);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0].id);
      }
    }
  };

  const handleUpdateMessages = (conversationId: string, messages: Message[]) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        // Update title based on first user message
        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg 
          ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')
          : c.title;
        return { ...c, messages, title };
      }
      return c;
    }));
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="h-screen bg-[#212121] text-white flex overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          conversation={activeConversation}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onUpdateMessages={handleUpdateMessages}
        />
      </div>
    </div>
  );
}
