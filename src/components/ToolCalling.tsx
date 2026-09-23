import { useState } from 'react';
import { Zap, Play, CheckCircle2, XCircle, Loader2, Server, ArrowRight } from 'lucide-react';
import { AVAILABLE_TOOLS } from '../simulation';

interface ToolExecution {
  id: string;
  toolId: string;
  toolName: string;
  input: Record<string, any>;
  output?: any;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  timestamp: number;
}

export default function ToolCalling() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [executions, setExecutions] = useState<ToolExecution[]>([
    { id: 'ex1', toolId: 't1', toolName: 'web_search', input: { query: 'LangGraph checkpointing best practices', max_results: 5 }, output: { results: [{ title: 'LangGraph Checkpointing Guide', url: 'https://...' }], count: 5 }, status: 'success', duration: 890, timestamp: Date.now() - 120000 },
    { id: 'ex2', toolId: 't6', toolName: 'vector_search', input: { query: 'agent memory patterns', k: 3, threshold: 0.8 }, output: { results: 3, avg_similarity: 0.89 }, status: 'success', duration: 340, timestamp: Date.now() - 90000 },
    { id: 'ex3', toolId: 't2', toolName: 'code_executor', input: { code: 'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())', timeout: 30 }, output: { error: 'File not found: data.csv' }, status: 'error', duration: 2400, timestamp: Date.now() - 60000 },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteTool = async (toolId: string) => {
    setIsExecuting(true);
    const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
    if (!tool) return;

    const execution: ToolExecution = {
      id: `ex${Date.now()}`,
      toolId,
      toolName: tool.name,
      input: { query: 'sample query', timeout: 30 },
      status: 'running',
      timestamp: Date.now(),
    };
    setExecutions(prev => [execution, ...prev]);

    await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000));

    const success = Math.random() > 0.3;
    setExecutions(prev => prev.map(e => 
      e.id === execution.id 
        ? { 
            ...e, 
            status: success ? 'success' : 'error',
            duration: Math.round(500 + Math.random() * 2000),
            output: success 
              ? { results: Math.floor(Math.random() * 10) + 1, message: 'Tool executed successfully' }
              : { error: 'Simulated error: timeout or invalid input' }
          }
        : e
    ));
    setIsExecuting(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-400" />
          MCP Tool Calling
        </h2>
        <p className="text-sm text-gray-400 mt-1">Model Context Protocol — Agent tools with execution tracking and retry logic</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-auto">
        {/* Available Tools */}
        <div className="col-span-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-green-400" />
            MCP Tools ({AVAILABLE_TOOLS.length})
          </h3>
          <div className="space-y-2">
            {AVAILABLE_TOOLS.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTool === tool.id
                    ? 'bg-violet-500/10 border-violet-500/30'
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white">{tool.name}</p>
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                </div>
                <p className="text-xs text-gray-400">{tool.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(tool.parameters).map(([key, type]) => (
                    <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      {key}: {type as string}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Execution */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Execute Panel */}
          {selectedTool && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Execute Tool</h3>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">MCP Request Format:</p>
                <pre className="text-xs text-green-400 font-mono">
{`{
  "method": "tools/call",
  "params": {
    "name": "${AVAILABLE_TOOLS.find(t => t.id === selectedTool)?.name}",
    "arguments": { "query": "...", "timeout": 30 }
  }
}`}
                </pre>
              </div>
              <button
                onClick={() => handleExecuteTool(selectedTool)}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isExecuting ? 'Executing...' : 'Execute via MCP'}
              </button>
            </div>
          )}

          {/* Execution History */}
          <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl p-4 overflow-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Execution History</h3>
            <div className="space-y-2">
              {executions.map((exec) => (
                <div key={exec.id} className="p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {exec.status === 'running' && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
                      {exec.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      {exec.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                      <span className="text-sm font-medium text-white">{exec.toolName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {exec.duration && (
                        <span className="text-xs text-gray-500">{exec.duration}ms</span>
                      )}
                      <span className="text-xs text-gray-500">{Math.round((Date.now() - exec.timestamp) / 1000)}s ago</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Input</p>
                      <pre className="text-[11px] text-gray-400 font-mono bg-gray-900/50 rounded p-2 overflow-auto max-h-20">
                        {JSON.stringify(exec.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Output</p>
                      <pre className={`text-[11px] font-mono bg-gray-900/50 rounded p-2 overflow-auto max-h-20 ${
                        exec.status === 'error' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {exec.output ? JSON.stringify(exec.output, null, 2) : 'Pending...'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
