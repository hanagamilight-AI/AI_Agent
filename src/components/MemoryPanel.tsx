import { useState } from 'react';
import { Brain, Database, Search, Clock, Plus, Trash2, Layers } from 'lucide-react';
import { generateVectorEntries } from '../simulation';

interface ShortTermItem {
  id: string;
  content: string;
  timestamp: number;
  ttl: number;
  relevance: number;
}

export default function MemoryPanel() {
  const [vectorEntries] = useState(generateVectorEntries());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof vectorEntries>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'short' | 'long' | 'search'>('long');

  const [shortTermItems] = useState<ShortTermItem[]>([
    { id: 'st1', content: 'User asked about LangGraph checkpointing', timestamp: Date.now() - 120000, ttl: 3600, relevance: 0.95 },
    { id: 'st2', content: 'Current model: claude-3.5-sonnet via OpenRouter', timestamp: Date.now() - 60000, ttl: 3600, relevance: 0.88 },
    { id: 'st3', content: 'Session started 15 minutes ago', timestamp: Date.now() - 900000, ttl: 3600, relevance: 0.72 },
    { id: 'st4', content: 'Last tool called: web_search', timestamp: Date.now() - 30000, ttl: 1800, relevance: 0.81 },
    { id: 'st5', content: 'User preference: concise responses', timestamp: Date.now() - 300000, ttl: 7200, relevance: 0.93 },
  ]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 800));
    
    // Simulate FAISS similarity search
    const results = vectorEntries
      .map(entry => ({
        ...entry,
        similarity: Math.random() * 0.4 + 0.6, // Simulated similarity
      }))
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 4);
    
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" />
          Memory & FAISS Vector Store
        </h2>
        <p className="text-sm text-gray-400 mt-1">Short-term session memory + Long-term FAISS vector database for persistent knowledge</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900/50 p-1 rounded-lg border border-gray-800 w-fit">
        {[
          { id: 'long', label: 'FAISS Vector Store', icon: Database },
          { id: 'short', label: 'Short-term Memory', icon: Clock },
          { id: 'search', label: 'Similarity Search', icon: Search },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'long' && (
          <div>
            {/* FAISS Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Vectors</p>
                <p className="text-xl font-bold text-white">{vectorEntries.length}</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500">Dimensions</p>
                <p className="text-xl font-bold text-white">768</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500">Index Type</p>
                <p className="text-xl font-bold text-white">IVF100_PQ</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500">Avg Similarity</p>
                <p className="text-xl font-bold text-green-400">0.87</p>
              </div>
            </div>

            {/* Vector Entries */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                Stored Vectors
              </h3>
              <div className="space-y-2">
                {vectorEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200">{entry.content}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-500">Type: {entry.metadata.type}</span>
                        <span className="text-[10px] text-gray-500">Source: {entry.metadata.source}</span>
                        <span className="text-[10px] text-gray-500">{Math.round((Date.now() - entry.timestamp) / 3600000)}h ago</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-500">Embedding:</span>
                        <code className="text-[10px] text-violet-400">[{entry.embedding.map(e => e.toFixed(2)).join(', ')}]</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'short' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Session State (Short-term)
              </h3>
              <span className="text-xs text-gray-500">TTL: 1 hour | Session: sess_abc123</span>
            </div>
            <div className="space-y-2">
              {shortTermItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{item.content}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500">
                        Expires in: {Math.round(item.ttl - (Date.now() - item.timestamp) / 1000)}s
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.relevance * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-500">{(item.relevance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">FAISS Similarity Search</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter query for semantic search..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Results (Top-K = 4)</h3>
                <div className="space-y-2">
                  {searchResults.map((result, i) => (
                    <div key={result.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{result.content}</p>
                        <span className="text-[10px] text-gray-500">Type: {result.metadata.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-400">{((result.similarity || 0) * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-gray-500">similarity</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
