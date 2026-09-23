import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { generateResponse, generateReActSteps, getOpenRouterModel } from '../simulation';
import { ReActStep } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  reactSteps?: ReActStep[];
  model?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: '🤖 Agentic AI Assistant initialized. Using LangGraph with OpenRouter (claude-3.5-sonnet). FAISS vector store loaded with 6 entries. MCP tools available: web_search, code_executor, file_reader, database_query, api_caller, vector_search.\n\nGuardrails active: PII detection, toxicity filter, rate limiting (10 actions/min). Observability: Langfuse tracing enabled.',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReact, setShowReact] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<ReActStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSteps]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowReact(true);
    setCurrentSteps([]);

    // Simulate ReAct steps
    const steps = generateReActSteps(input);
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setCurrentSteps(prev => [...prev, steps[i]]);
    }

    // Generate response
    await new Promise(r => setTimeout(r, 1000));
    const response = generateResponse(input);
    const model = getOpenRouterModel();
    
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      reactSteps: steps,
      model,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
    setShowReact(false);
    setCurrentSteps([]);
  };

  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      role: 'system',
      content: '🔄 Session reset. Checkpoint restored. Memory preserved in FAISS vector store.',
      timestamp: Date.now(),
    }]);
    setCurrentSteps([]);
    setShowReact(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Agent Chat — ReAct Pattern
          </h2>
          <p className="text-sm text-gray-400 mt-1">Interactive agent with ReAct reasoning, tool calling, and human-in-the-loop</p>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors">
          <RotateCcw className="w-4 h-4" /> Reset Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto rounded-xl bg-gray-900/50 border border-gray-800 p-4 mb-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role !== 'user' && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'system' ? 'bg-blue-500/20' : 'bg-violet-500/20'
                }`}>
                  {msg.role === 'system' ? <Bot className="w-4 h-4 text-blue-400" /> : <Bot className="w-4 h-4 text-violet-400" />}
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-violet-600 text-white' 
                  : msg.role === 'system'
                  ? 'bg-blue-500/10 border border-blue-500/20 text-blue-200'
                  : 'bg-gray-800 border border-gray-700 text-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.model && (
                  <p className="text-xs text-gray-500 mt-2">via {msg.model}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* ReAct Steps Visualization */}
          {showReact && currentSteps.length > 0 && (
            <div className="ml-11 border-l-2 border-violet-500/30 pl-4 space-y-2">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">ReAct Reasoning Chain</p>
              {currentSteps.map((step) => (
                <div key={step.id} className="flex items-start gap-2 animate-fade-in">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    step.type === 'thought' ? 'bg-amber-500/20 text-amber-400' :
                    step.type === 'action' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    <span className="text-[10px] font-bold">{step.type[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <span className={`text-xs font-medium ${
                      step.type === 'thought' ? 'text-amber-400' :
                      step.type === 'action' ? 'text-green-400' :
                      'text-blue-400'
                    }`}>{step.type.toUpperCase()}{step.toolUsed && ` → ${step.toolUsed}`}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && !showReact && (
            <div className="flex items-center gap-2 ml-11">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-sm text-gray-400">Agent is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the agent anything... (try: 'Search for AI papers and summarize findings')"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
}
