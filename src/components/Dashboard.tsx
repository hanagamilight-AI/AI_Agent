import { Bot, Brain, Shield, Eye, TestTube, Zap, GitBranch, Database, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const activityData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: Math.round(20 + Math.random() * 80),
  errors: Math.round(Math.random() * 5),
}));

const toolUsage = [
  { name: 'web_search', value: 35, color: '#8b5cf6' },
  { name: 'vector_search', value: 25, color: '#6366f1' },
  { name: 'code_executor', value: 18, color: '#10b981' },
  { name: 'database_query', value: 12, color: '#f59e0b' },
  { name: 'api_caller', value: 7, color: '#ef4444' },
  { name: 'file_reader', value: 3, color: '#06b6d4' },
];

export default function Dashboard() {
  const stats = [
    { label: 'Total Requests', value: '1,247', change: '+12.5%', up: true, icon: Activity, color: 'violet' },
    { label: 'Agent Sessions', value: '89', change: '+8.3%', up: true, icon: Bot, color: 'indigo' },
    { label: 'Tool Executions', value: '3,421', change: '+15.2%', up: true, icon: Zap, color: 'green' },
    { label: 'Guardrail Blocks', value: '23', change: '-5.1%', up: false, icon: Shield, color: 'orange' },
    { label: 'Memory Entries', value: '6,782', change: '+22.1%', up: true, icon: Brain, color: 'cyan' },
    { label: 'Eval Pass Rate', value: '94.2%', change: '+3.4%', up: true, icon: TestTube, color: 'emerald' },
  ];

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      green: 'bg-green-500/10 text-green-400 border-green-500/20',
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return map[color] || map.violet;
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-violet-400" />
          System Dashboard
        </h2>
        <p className="text-sm text-gray-400 mt-1">Production monitoring overview for the Agentic AI platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getColorClasses(stat.color)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Activity Chart */}
        <div className="col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Request Activity (24h)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="requests" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Requests" />
                <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tool Usage Pie */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Tool Usage Distribution</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={toolUsage} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                  {toolUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {toolUsage.map((tool) => (
              <div key={tool.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }}></div>
                <span className="text-[10px] text-gray-400">{tool.name} ({tool.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Architecture Overview</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
            <GitBranch className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">LangGraph</p>
            <p className="text-[10px] text-gray-400 mt-1">StateGraph + Checkpointing</p>
            <p className="text-[10px] text-green-400 mt-1">● Active</p>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
            <Bot className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">OpenRouter</p>
            <p className="text-[10px] text-gray-400 mt-1">Multi-model LLM Gateway</p>
            <p className="text-[10px] text-green-400 mt-1">● Connected</p>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
            <Brain className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">FAISS</p>
            <p className="text-[10px] text-gray-400 mt-1">Vector Database (768d)</p>
            <p className="text-[10px] text-green-400 mt-1">● 6 vectors indexed</p>
          </div>
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
            <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">MCP Protocol</p>
            <p className="text-[10px] text-gray-400 mt-1">6 Tools Registered</p>
            <p className="text-[10px] text-green-400 mt-1">● Server Running</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Agent Activity</h3>
        <div className="space-y-2">
          {[
            { time: '2m ago', event: 'Agent completed task', detail: 'ReAct loop: 3 iterations, 2 tool calls', status: 'success' },
            { time: '5m ago', event: 'Human approved action', detail: 'database_write to user_preferences', status: 'success' },
            { time: '8m ago', event: 'Guardrail triggered', detail: 'PII detected and redacted in input', status: 'warning' },
            { time: '12m ago', event: 'Tool execution error', detail: 'code_executor timeout, retry succeeded', status: 'error' },
            { time: '15m ago', event: 'Memory updated', detail: '2 entries added to FAISS long-term store', status: 'success' },
            { time: '20m ago', event: 'Checkpoint saved', detail: 'State at step=response_generation', status: 'success' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                item.status === 'success' ? 'bg-green-400' : item.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-gray-500 w-16 flex-shrink-0">{item.time}</span>
              <span className="text-sm text-gray-200 flex-1">{item.event}</span>
              <span className="text-xs text-gray-500">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
