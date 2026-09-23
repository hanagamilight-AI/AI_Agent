import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface MessageComponentProps {
  message: Message;
}

export default function MessageComponent({ message }: MessageComponentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] bg-[#2a2a2a] rounded-2xl px-4 py-3">
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  // Check if this is a block code (has language class) or inline code
                  const isBlock = match || codeString.includes('\n');

                  if (isBlock && match) {
                    return (
                      <div className="relative group my-4">
                        <div className="absolute right-2 top-2 flex items-center gap-2 z-10">
                          <span className="text-xs text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded">
                            {match[1]}
                          </span>
                          <button
                            onClick={() => handleCopyCode(codeString)}
                            className="p-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === codeString ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.5rem',
                            backgroundColor: '#1a1a1a',
                            padding: '2.5rem 1rem 1rem 1rem',
                          }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-sm text-gray-200"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-4 last:mb-0 text-gray-100 leading-relaxed">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-xl font-bold text-white mb-3 mt-5">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-lg font-bold text-white mb-2 mt-4">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-4 space-y-1 text-gray-100">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-100">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-gray-100">{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-[#3a3a3a] pl-4 my-4 italic text-gray-300">
                      {children}
                    </blockquote>
                  );
                },
                a({ children, href }) {
                  return (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  );
                },
                strong({ children }) {
                  return <strong className="font-semibold text-white">{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic text-gray-200">{children}</em>;
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-[#3a3a3a] rounded">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border border-[#3a3a3a] px-4 py-2 bg-[#1a1a1a] text-left text-white font-semibold">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border border-[#3a3a3a] px-4 py-2 text-gray-200">
                      {children}
                    </td>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Streaming indicator */}
            {message.isStreaming && (
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
