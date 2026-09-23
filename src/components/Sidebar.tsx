import { MessageSquare, Plus, X, Trash2, Settings, User } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  messages: any[];
  timestamp: number;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onClose,
}: SidebarProps) {
  return (
    <div className="w-[260px] bg-[#171717] flex flex-col h-full">
      {/* Top Section */}
      <div className="p-2 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          title="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
        <button
          onClick={onNewChat}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          title="New chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="text-xs text-gray-500 px-2 py-2 font-medium">Chats</div>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 transition-colors ${
              conv.id === activeConversationId
                ? 'bg-[#2a2a2a]'
                : 'hover:bg-[#212121]'
            }`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-200 truncate flex-1">
              {conv.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3a3a3a] rounded transition-all"
            >
              <Trash2 size={14} className="text-gray-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-2 border-t border-[#2a2a2a]">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm text-gray-300">User</span>
        </button>
      </div>
    </div>
  );
}
