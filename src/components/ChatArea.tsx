import { useState, useRef, useEffect } from 'react';
import { Send, Square, Menu, ChevronDown, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MessageComponent from './MessageComponent';

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

interface ChatAreaProps {
  conversation: Conversation | undefined;
  onToggleSidebar: () => void;
  onUpdateMessages?: (conversationId: string, messages: Message[]) => void;
}

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Great for most tasks' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Advanced reasoning' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable' },
];

export default function ChatArea({ conversation, onToggleSidebar, onUpdateMessages }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversation?.id]);

  // Sync messages back to parent
  useEffect(() => {
    if (conversation && onUpdateMessages) {
      onUpdateMessages(conversation.id, messages);
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Simulate AI response with streaming
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Simulate streaming response
    const response = generateAIResponse(input);
    let currentIndex = 0;
    const words = response.split(' ');

    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const currentContent = words.slice(0, currentIndex + 1).join(' ');
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: currentContent }
            : msg
        ));
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        ));
        setIsStreaming(false);
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const generateAIResponse = (query: string): string => {
    // Simulate different types of responses based on query
    if (query.toLowerCase().includes('code') || query.toLowerCase().includes('function')) {
      return `Here's an example implementation:

\`\`\`python
def process_data(data):
    """
    Process the input data and return results.
    """
    results = []
    for item in data:
        processed = transform(item)
        results.append(processed)
    return results

def transform(item):
    # Apply transformation logic
    return item * 2
\`\`\`

This code demonstrates a simple data processing pipeline. The \`process_data\` function iterates through the input data and applies the \`transform\` function to each item.

**Key features:**
- Clean separation of concerns
- Type hints for better IDE support
- Docstrings for documentation
- Efficient iteration pattern

Would you like me to explain any specific part in more detail?`;
    }

    if (query.toLowerCase().includes('explain') || query.toLowerCase().includes('what is')) {
      return `Great question! Let me break this down for you.

## Overview

This is a fundamental concept in computer science and software development. Understanding it will help you build better applications.

## Key Points

1. **Core Concept**: The basic idea revolves around organizing and managing data efficiently
2. **Implementation**: There are multiple ways to implement this, depending on your use case
3. **Best Practices**: Following established patterns will lead to more maintainable code

## Example

Here's a practical example:

\`\`\`javascript
class DataProcessor {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
  }

  process(input) {
    if (this.cache.has(input)) {
      return this.cache.get(input);
    }
    
    const result = this.transform(input);
    this.cache.set(input, result);
    return result;
  }

  transform(data) {
    // Transformation logic here
    return data;
  }
}
\`\`\`

## Summary

In summary, this approach provides:
- ✅ Better performance through caching
- ✅ Cleaner code organization
- ✅ Easier testing and maintenance

Let me know if you'd like me to elaborate on any of these points!`;
    }

    // Default conversational response
    return `I'd be happy to help you with that! 

Based on your question, here are some thoughts:

**Understanding the Context**

This is an interesting topic that involves several key considerations. Let me walk you through the main aspects.

**Key Considerations**

1. First, we need to understand the underlying principles
2. Then, we can look at practical implementations
3. Finally, we'll discuss best practices and common pitfalls

**Practical Example**

\`\`\`typescript
interface Config {
  apiKey: string;
  endpoint: string;
  timeout: number;
}

async function fetchData(config: Config): Promise<any> {
  const response = await fetch(config.endpoint, {
    headers: {
      'Authorization': \`Bearer \${config.apiKey}\`,
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(config.timeout)
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return response.json();
}
\`\`\`

This example shows a clean, type-safe approach to making API requests with proper error handling and timeout support.

**Next Steps**

Would you like me to:
- Explain any specific part in more detail?
- Show alternative approaches?
- Help you implement this in your project?

Feel free to ask follow-up questions!`;
  };

  const handleStop = () => {
    setIsStreaming(false);
    setMessages(prev => prev.map(msg =>
      msg.isStreaming ? { ...msg, isStreaming: false } : msg
    ));
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Select a conversation or start a new chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          {!conversation && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              <Menu size={18} />
            </button>
          )}
          
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">{selectedModel.name}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showModelSelector && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-[#2a2a2a] rounded-lg shadow-xl border border-[#3a3a3a] overflow-hidden z-50">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelSelector(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-[#3a3a3a] transition-colors ${
                      selectedModel.id === model.id ? 'bg-[#3a3a3a]' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-white">{model.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-8">How can I help you today?</h1>
            
            {/* Suggested Prompts */}
            <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
              {[
                { icon: '💡', title: 'Explain quantum computing', subtitle: 'in simple terms' },
                { icon: '✍️', title: 'Write a Python script', subtitle: 'to sort a list of numbers' },
                { icon: '🎨', title: 'Help me design', subtitle: 'a REST API for a blog' },
                { icon: '📊', title: 'Analyze the pros and cons', subtitle: 'of microservices' },
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(`${prompt.title} ${prompt.subtitle}`)}
                  className="flex flex-col items-start p-4 bg-[#2a2a2a] hover:bg-[#333333] border border-[#3a3a3a] rounded-xl text-left transition-colors group"
                >
                  <span className="text-2xl mb-2">{prompt.icon}</span>
                  <span className="text-sm font-medium text-white">{prompt.title}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{prompt.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[#2a2a2a] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant..."
              rows={1}
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 pr-12 resize-none focus:outline-none max-h-48"
              style={{ minHeight: '52px' }}
            />
            
            <div className="absolute right-2 bottom-2">
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="p-2 bg-white hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Square size={16} className="text-black" fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="p-2 bg-white hover:bg-gray-200 disabled:bg-[#3a3a3a] disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send size={16} className="text-black" />
                </button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
