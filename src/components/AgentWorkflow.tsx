import { useState } from 'react';
import { GitBranch, Play, Pause, SkipForward, RotateCcw, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'start' | 'agent' | 'tool' | 'condition' | 'human' | 'end';
  x: number;
  y: number;
  status: 'idle' | 'active' | 'completed' | 'error';
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  conditional?: boolean;
}

const nodes: GraphNode[] = [
  { id: 'start', label: 'START', type: 'start', x: 50, y: 200, status: 'completed' },
  { id: 'input', label: 'Input Validation', type: 'condition', x: 180, y: 200, status: 'completed' },
  { id: 'agent', label: 'Agent (LLM)', type: 'agent', x: 330, y: 200, status: 'active' },
  { id: 'tool_check', label: 'Tool Needed?', type: 'condition', x: 480, y: 200, status: 'idle' },
  { id: 'tools', label: 'MCP Tools', type: 'tool', x: 480, y: 80, status: 'idle' },
  { id: 'human', label: 'Human Review', type: 'human', x: 480, y: 320, status: 'idle' },
  { id: 'memory', label: 'Memory Update', type: 'tool', x: 630, y: 200, status: 'idle' },
  { id: 'checkpoint', label: 'Checkpoint', type: 'condition', x: 750, y: 200, status: 'idle' },
  { id: 'output', label: 'Output Guardrails', type: 'condition', x: 870, y: 200, status: 'idle' },
  { id: 'end', label: 'END', type: 'end', x: 990, y: 200, status: 'idle' },
];

const edges: GraphEdge[] = [
  { from: 'start', to: 'input' },
  { from: 'input', to: 'agent' },
  { from: 'agent', to: 'tool_check' },
  { from: 'tool_check', to: 'tools', label: 'Yes', conditional: true },
  { from: 'tool_check', to: 'memory', label: 'No', conditional: true },
  { from: 'tools', to: 'human', label: 'Needs Approval', conditional: true },
  { from: 'tools', to: 'agent', label: 'Result', conditional: true },
  { from: 'human', to: 'agent', label: 'Approved', conditional: true },
  { from: 'memory', to: 'checkpoint' },
  { from: 'checkpoint', to: 'output' },
  { from: 'output', to: 'end' },
];

export default function AgentWorkflow() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeNode, setActiveNode] = useState('agent');
  const [executionLog, setExecutionLog] = useState<string[]>([
    '[00:00] Graph initialized with StateGraph',
    '[00:01] Checkpointer: SqliteSaver connected',
    '[00:02] Memory store: InMemoryStore ready',
    '[00:03] Agent node: claude-3.5-sonnet via OpenRouter',
    '[00:04] MCP Server connected: 6 tools available',
    '[00:05] Guardrails middleware: active',
    '[00:06] Waiting for user input...',
  ]);

  const handleRun = () => {
    setIsRunning(true);
    const sequence = ['start', 'input', 'agent', 'tool_check', 'tools', 'human', 'memory', 'checkpoint', 'output', 'end'];
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setActiveNode(sequence[i]);
        setExecutionLog(prev => [...prev, `[00:${String(7 + i).padStart(2, '0')}] Executing node: ${sequence[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1200);
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.id === activeNode && isRunning) return 'ring-2 ring-violet-400 bg-violet-500/20 border-violet-400';
    if (node.status === 'completed') return 'bg-green-500/10 border-green-500/50';
    if (node.status === 'active') return 'bg-violet-500/10 border-violet-500/50';
    if (node.status === 'error') return 'bg-red-500/10 border-red-500/50';
    return 'bg-gray-800/50 border-gray-700';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'start': return '▶';
      case 'end': return '■';
      case 'agent': return '🤖';
      case 'tool': return '🔧';
      case 'condition': return '◇';
      case 'human': return '👤';
      default: return '●';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-violet-400" />
            LangGraph Workflow
          </h2>
          <p className="text-sm text-gray-400 mt-1">StateGraph with conditional edges, checkpoints, and human-in-the-loop</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Play className="w-4 h-4" /> Run Graph
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
            <Pause className="w-4 h-4" /> Pause
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl p-6 overflow-auto">
        <div className="relative min-w-[1050px] h-[400px]">
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((edge, i) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x + 55}
                    y1={fromNode.y + 20}
                    x2={toNode.x + 55}
                    y2={toNode.y + 20}
                    stroke={edge.conditional ? '#8b5cf6' : '#4b5563'}
                    strokeWidth={edge.conditional ? 1.5 : 2}
                    strokeDasharray={edge.conditional ? '5,5' : 'none'}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(fromNode.x + toNode.x) / 2 + 55}
                      y={(fromNode.y + toNode.y) / 2 + 10}
                      fill="#9ca3af"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-[110px] h-[40px] rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300 ${getNodeColor(node)} ${
                node.id === activeNode && isRunning ? 'scale-110 shadow-lg shadow-violet-500/20' : ''
              }`}
              style={{ left: node.x, top: node.y }}
            >
              <span>{getTypeIcon(node.type)}</span>
              <span className="text-gray-200 truncate">{node.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Log */}
      <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4 max-h-48 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Execution Log
        </h3>
        <div className="space-y-1 font-mono text-xs">
          {executionLog.map((log, i) => (
            <div key={i} className={`${i === executionLog.length - 1 ? 'text-violet-300' : 'text-gray-500'}`}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50"></span> Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-500/20 border border-violet-500/50"></span> Active</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-800 border border-gray-700"></span> Idle</span>
        <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-dashed border-violet-500"></span> Conditional Edge</span>
        <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-gray-500"></span> Direct Edge</span>
      </div>
    </div>
  );
}
