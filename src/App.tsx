import { useState } from 'react';
import { 
  Bot, Brain, Shield, Eye, TestTube, MessageSquare, 
  Database, GitBranch, Workflow, Zap 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import AgentWorkflow from './components/AgentWorkflow';
import HumanInTheLoop from './components/HumanInTheLoop';
import MemoryPanel from './components/MemoryPanel';
import ToolCalling from './components/ToolCalling';
import Guardrails from './components/Guardrails';
import Observability from './components/Observability';
import Evaluation from './components/Evaluation';
import ChatInterface from './components/ChatInterface';

const tabs = [
  { id: 'chat', label: 'Agent Chat', icon: MessageSquare },
  { id: 'workflow', label: 'LangGraph', icon: GitBranch },
  { id: 'hitl', label: 'Human-in-Loop', icon: Workflow },
  { id: 'memory', label: 'Memory & FAISS', icon: Brain },
  { id: 'tools', label: 'MCP Tools', icon: Zap },
  { id: 'guardrails', label: 'Guardrails', icon: Shield },
  { id: 'observability', label: 'Observability', icon: Eye },
  { id: 'evaluation', label: 'Evaluation', icon: TestTube },
  { id: 'dashboard', label: 'Dashboard', icon: Database },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat': return <ChatInterface />;
      case 'workflow': return <AgentWorkflow />;
      case 'hitl': return <HumanInTheLoop />;
      case 'memory': return <MemoryPanel />;
      case 'tools': return <ToolCalling />;
      case 'guardrails': return <Guardrails />;
      case 'observability': return <Observability />;
      case 'evaluation': return <Evaluation />;
      case 'dashboard': return <Dashboard />;
      default: return <ChatInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Agentic AI Platform</h1>
            <p className="text-xs text-gray-400">LangGraph • OpenRouter • FAISS • MCP</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Agent Active</span>
          </div>
          <div className="text-xs text-gray-400">
            Model: <span className="text-violet-400">claude-3.5-sonnet</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-56 bg-gray-900/50 border-r border-gray-800 p-3 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          <div className="mt-auto pt-4 border-t border-gray-800">
            <div className="px-3 py-2 text-xs text-gray-500">
              <p>Framework: LangGraph</p>
              <p>LLM: OpenRouter API</p>
              <p>Vector DB: FAISS</p>
              <p>Protocol: MCP</p>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
