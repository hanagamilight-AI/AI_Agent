import { useState } from 'react';
import { Eye, Activity, Clock, Cpu, HardDrive, Wifi, AlertCircle } from 'lucide-react';
import { generateTraceEntries } from '../simulation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const latencyData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i * 3}m`,
  llm: Math.round(800 + Math.random() * 1500),
  tools: Math.round(200 + Math.random() * 800),
  total: Math.round(1200 + Math.random() * 2000),
}));

const tokenData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}h`,
  input: Math.round(200 + Math.random() * 800),
  output: Math.round(300 + Math.random() * 1000),
}));

export default function Observability() {
  const [traces] = useState(generateTraceEntries());
  const [activeView, setActiveView] = useState<'traces' | 'metrics' | 'logs'>('traces');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'llm_call': return 'text-violet-400 bg-violet-500/10';
      case 'tool_call': return 'text-green-400 bg-green-500/10';
      case 'human_input': return 'text-blue-400 bg-blue-500/10';
      case 'checkpoint': return 'text-amber-400 bg-amber-500/10';
      case 'guardrail': return 'text-orange-400 bg-orange-500/10';
      case 'memory': return 'text-cyan-400 bg-cyan-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-violet-400" />
          Observability — Langfuse Tracing
        </h2>
        <p className="text-sm text-gray-400 mt-1">Logging, distributed tracing, and production monitoring dashboard</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] text-gray-500">LLM Latency</span>
          </div>
          <p className="text-lg font-bold text-white">1.24s</p>
          <p className="text-[10px] text-green-400">↓ 12% from avg</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] text-gray-500">Success Rate</span>
          </div>
          <p className="text-lg font-bold text-white">97.3%</p>
          <p className="text-[10px] text-green-400">↑ 2.1% this week</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-gray-500">Tokens Used</span>
          </div>
          <p className="text-lg font-bold text-white">45.2K</p>
          <p className="text-[10px] text-gray-400">Today</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-gray-500">Tool Calls</span>
          </div>
          <p className="text-lg font-bold text-white">128</p>
          <p className="text-[10px] text-gray-400">Last 24h</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] text-gray-500">Errors</span>
          </div>
          <p className="text-lg font-bold text-white">3</p>
          <p className="text-[10px] text-red-400">↑ 1 from yesterday</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900/50 p-1 rounded-lg border border-gray-800 w-fit">
        {[
          { id: 'traces', label: 'Traces', icon: Activity },
          { id: 'metrics', label: 'Metrics', icon: Clock },
          { id: 'logs', label: 'Logs', icon: HardDrive },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
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
        {activeView === 'traces' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Distributed Traces (LangSmith/Langfuse)</h3>
            <div className="space-y-1">
              {traces.map((trace) => (
                <div key={trace.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getTypeColor(trace.type)}`}>
                    {trace.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-200 flex-1">{trace.name}</span>
                  {trace.duration && (
                    <span className="text-xs text-gray-500">{trace.duration}ms</span>
                  )}
                  <span className={`w-2 h-2 rounded-full ${
                    trace.status === 'success' ? 'bg-green-400' : trace.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></span>
                  <span className="text-[10px] text-gray-500">{Math.round((Date.now() - trace.timestamp) / 1000)}s ago</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'metrics' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Latency Over Time (ms)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="llm" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="LLM" />
                    <Area type="monotone" dataKey="tools" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Tools" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Token Usage (per 2h)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tokenData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="input" fill="#6366f1" radius={[2, 2, 0, 0]} name="Input Tokens" />
                    <Bar dataKey="output" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Output Tokens" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeView === 'logs' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">System Logs</h3>
            <div className="font-mono text-xs space-y-1 max-h-96 overflow-auto">
              {[
                { level: 'INFO', msg: 'Agent initialized with LangGraph StateGraph', time: '12:00:01' },
                { level: 'INFO', msg: 'Connected to OpenRouter API (claude-3.5-sonnet)', time: '12:00:02' },
                { level: 'INFO', msg: 'FAISS index loaded: 6 vectors, 768 dimensions', time: '12:00:02' },
                { level: 'INFO', msg: 'MCP server connected: 6 tools registered', time: '12:00:03' },
                { level: 'INFO', msg: 'Guardrails middleware initialized (8 rules)', time: '12:00:03' },
                { level: 'INFO', msg: 'Langfuse tracing enabled (project: agentic-ai-prod)', time: '12:00:04' },
                { level: 'WARN', msg: 'Rate limit approaching: 7/10 actions in current window', time: '12:05:23' },
                { level: 'INFO', msg: 'Checkpoint saved: step=memory_update, state_hash=a3f2b1', time: '12:06:15' },
                { level: 'ERROR', msg: 'Tool execution failed: code_executor timeout after 30s', time: '12:08:42' },
                { level: 'INFO', msg: 'Retry attempt 1/3 for code_executor with backoff=2s', time: '12:08:44' },
                { level: 'INFO', msg: 'Retry successful: code_executor completed in 1.8s', time: '12:08:46' },
                { level: 'INFO', msg: 'Human-in-the-loop: action approved (database_write)', time: '12:10:01' },
                { level: 'WARN', msg: 'PII detected in input, redacting before LLM call', time: '12:12:33' },
                { level: 'INFO', msg: 'Memory write: 2 entries added to FAISS long-term store', time: '12:14:05' },
                { level: 'INFO', msg: 'Session summary: 12 messages, 5 tool calls, 3 checkpoints', time: '12:15:00' },
              ].map((log, i) => (
                <div key={i} className={`flex gap-3 p-1.5 rounded ${
                  log.level === 'ERROR' ? 'bg-red-500/5' : log.level === 'WARN' ? 'bg-yellow-500/5' : ''
                }`}>
                  <span className="text-gray-600">{log.time}</span>
                  <span className={`w-12 ${
                    log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-green-400'
                  }`}>{log.level}</span>
                  <span className="text-gray-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
