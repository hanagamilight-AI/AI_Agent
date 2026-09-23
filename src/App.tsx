import { useState } from 'react';
import { FileCode, FolderOpen, Copy, Check, ChevronRight, ChevronDown, Terminal, BookOpen, GitBranch, Cpu, Database, Shield, Eye, TestTube, Settings } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { pythonFiles, categories, CodeFile } from './data/pythonFiles';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(pythonFiles[0]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core', 'memory', 'safety', 'observability', 'evaluation', 'config']));
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'code' | 'architecture' | 'setup'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCategory = (catId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(catId)) next.delete(catId);
    else next.add(catId);
    setExpandedCategories(next);
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'core': return Cpu;
      case 'memory': return Database;
      case 'safety': return Shield;
      case 'observability': return Eye;
      case 'evaluation': return TestTube;
      case 'config': return Settings;
      default: return FileCode;
    }
  };

  const getCategoryColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.color || 'gray';
  };

  return (
    <div className="h-screen bg-[#0d1117] text-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Agentic AI Platform</h1>
              <p className="text-[10px] text-gray-500">Python • LangGraph • OpenRouter • FAISS • MCP</p>
            </div>
          </div>
          <div className="h-6 w-px bg-[#30363d] mx-2"></div>
          <nav className="flex gap-1">
            {[
              { id: 'code', label: 'Source Code', icon: FileCode },
              { id: 'architecture', label: 'Architecture', icon: GitBranch },
              { id: 'setup', label: 'Setup Guide', icon: BookOpen },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeView === tab.id
                      ? 'bg-[#1f6feb] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-[#21262d] px-2 py-1 rounded">Python 3.11+</span>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            {pythonFiles.length} files
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-3 py-2 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="font-medium">agentic-ai-platform/</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {categories.map(cat => {
              const Icon = getCategoryIcon(cat.id);
              const files = pythonFiles.filter(f => f.category === cat.id);
              const isExpanded = expandedCategories.has(cat.id);

              return (
                <div key={cat.id} className="mb-1">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span className="ml-auto text-[10px] text-gray-600">{files.length}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-2">
                      {files.map(file => (
                        <button
                          key={file.id}
                          onClick={() => { setSelectedFile(file); setActiveView('code'); }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors ${
                            selectedFile.id === file.id && activeView === 'code'
                              ? 'bg-[#1f6feb]/20 text-blue-300'
                              : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                          }`}
                        >
                          <FileCode className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-[#30363d]">
            <div className="text-[10px] text-gray-600 space-y-1">
              <p>🐍 Python 3.11+</p>
              <p>🔗 LangGraph + OpenRouter</p>
              <p>🧠 FAISS Vector Store</p>
              <p>🔧 MCP Tool Protocol</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'code' && (
            <>
              {/* File Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">{selectedFile.path}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedFile.description}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md text-xs text-gray-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Code Display */}
              <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                  language={selectedFile.language === 'text' || selectedFile.language === 'bash' ? 'bash' : selectedFile.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: '#0d1117',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    height: '100%',
                    overflow: 'auto',
                  }}
                  showLineNumbers
                  lineNumberStyle={{ color: '#484f58', fontSize: '12px', paddingRight: '1rem' }}
                >
                  {selectedFile.content}
                </SyntaxHighlighter>
              </div>
            </>
          )}

          {activeView === 'architecture' && <ArchitectureView />}
          {activeView === 'setup' && <SetupView />}
        </main>
      </div>
    </div>
  );
}

function ArchitectureView() {
  return (
    <div className="flex-1 overflow-auto p-8">
      <h2 className="text-2xl font-bold text-white mb-2">System Architecture</h2>
      <p className="text-gray-400 mb-8">Complete agentic AI pipeline with all components</p>

      {/* Architecture Diagram */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 mb-8">
        <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE (CLI / API)                         │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GUARDRAILS LAYER (guardrails.py)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ PII Detection│  │ Toxicity     │  │ Injection    │  │ Rate Limiter  │  │
│  │ & Redaction  │  │ Filter       │  │ Prevention   │  │ (10/min)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MEMORY RETRIEVAL (memory.py + faiss_store.py)            │
│  ┌────────────────────────┐       ┌────────────────────────────────────┐   │
│  │  Short-term Memory     │       │  Long-term Memory (FAISS)          │   │
│  │  - Session state       │       │  - 1536-dim embeddings             │   │
│  │  - TTL: 1 hour         │       │  - IVF100_PQ32 index               │   │
│  │  - Last N turns        │       │  - Semantic similarity search      │   │
│  └────────────────────────┘       └────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH STATEGRAPH (graph.py)                           │
│                                                                              │
│   START ──▶ input_node ──▶ agent_node ──▶ should_use_tools?                 │
│                                  ▲              │                            │
│                                  │         ┌────┴────┐                       │
│                                  │        Yes        No                      │
│                                  │         │          │                      │
│                                  │    tool_node    output_node ──▶ END       │
│                                  │         │                                  │
│                                  │   needs_approval?                          │
│                                  │      │       │                             │
│                                  │    High     Low                            │
│                                  │      │       │                             │
│                              ┌───┘  human_node │                             │
│                              │   (HITL)        │                             │
│                              └─────────────────┘                             │
│                                                                              │
│   Checkpoints saved at every state transition                                │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MCP TOOL CALLING (tools.py)                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │web_search  │ │code_exec   │ │file_reader │ │db_query ⚠️ │              │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘              │
│  ┌────────────┐ ┌────────────┐                                             │
│  │api_caller⚠️│ │vector_srch │    ⚠️ = Requires Human Approval            │
│  └────────────┘ └────────────┘                                             │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              OUTPUT GUARDRAILS + MEMORY UPDATE + CHECKPOINT                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Hallucination│  │ Data Leak    │  │ Store to     │  │ Save State    │  │
│  │ Detection    │  │ Prevention   │  │ FAISS        │  │ (SQLite)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY (observability.py)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Langfuse     │  │ LangSmith    │  │ Structured   │  │ Metrics       │  │
│  │ Tracing      │  │ Tracing      │  │ Logging      │  │ Collection    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
`}</pre>
      </div>

      {/* Concept Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: 'Human-in-the-Loop',
            icon: '👤',
            color: 'blue',
            description: 'High-risk tool calls (database_query, api_caller, code_executor) require human approval before execution. The graph interrupts at the human_node, pausing execution until approval.',
          },
          {
            title: 'Checkpointing',
            icon: '💾',
            color: 'green',
            description: 'Every state transition is saved to SQLite via LangGraph\'s AsyncSqliteSaver. Enables rollback, recovery, and debugging. Checkpoints include full agent state.',
          },
          {
            title: 'FAISS Vector Database',
            icon: '🧠',
            color: 'cyan',
            description: '1536-dimensional embeddings stored in FAISS with IVF100_PQ32 indexing. Supports semantic similarity search for long-term memory retrieval across sessions.',
          },
          {
            title: 'ReAct Pattern',
            icon: '🔄',
            color: 'violet',
            description: 'Thought → Action → Observation loop implemented in the agent_node. The LLM reasons about what to do, calls tools, observes results, and iterates until the task is complete.',
          },
          {
            title: 'MCP Tool Calling',
            icon: '🔧',
            color: 'orange',
            description: '6 tools registered via Model Context Protocol. Standardized JSON-RPC interface for tool discovery and invocation. Risk-based approval routing.',
          },
          {
            title: 'Dual Memory',
            icon: '🗂️',
            color: 'emerald',
            description: 'Short-term: In-memory session state with TTL expiration. Long-term: FAISS vector store for persistent semantic knowledge. Both retrieved and combined for context.',
          },
          {
            title: 'Guardrails',
            icon: '🛡️',
            color: 'red',
            description: 'Input: PII redaction, toxicity filter, prompt injection detection, length limits. Output: hallucination markers, data leak prevention. Rate limiting via token bucket.',
          },
          {
            title: 'Observability',
            icon: '👁️',
            color: 'yellow',
            description: 'Langfuse + LangSmith distributed tracing. Every agent run is traced with spans for each step. Structured JSON logging. Metrics collection for dashboards.',
          },
          {
            title: 'Evaluation Harness',
            icon: '🧪',
            color: 'pink',
            description: 'Golden dataset with 8+ test cases. LLM-as-judge scoring (GPT-4o). Regression detection comparing current vs baseline. CI/CD integration ready.',
          },
        ].map((card, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{card.icon}</span>
              <h3 className="text-sm font-bold text-white">{card.title}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupView() {
  return (
    <div className="flex-1 overflow-auto p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Setup Guide</h2>
      <p className="text-gray-400 mb-8">Get the Agentic AI Platform running locally</p>

      <div className="max-w-3xl space-y-6">
        {/* Prerequisites */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Prerequisites
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Python 3.11 or higher</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> pip or uv package manager</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> OpenRouter API key</li>
            <li className="flex items-center gap-2"><span className="text-yellow-400">○</span> Langfuse account (optional, for tracing)</li>
            <li className="flex items-center gap-2"><span className="text-yellow-400">○</span> LangSmith account (optional, for tracing)</li>
          </ul>
        </div>

        {/* Installation */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">2.</span> Installation
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Clone and navigate to the project:</p>
              <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`git clone <repo-url>
cd agentic-ai-platform`}
              </pre>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Create virtual environment:</p>
              <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\\Scripts\\activate  # Windows`}
              </pre>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Install dependencies:</p>
              <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`pip install -r requirements.txt`}
              </pre>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">3.</span> Configuration
          </h3>
          <div className="space-y-3">
            <p className="text-xs text-gray-500 mb-1">Copy the example env file and fill in your keys:</p>
            <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`cp .env.example .env
# Edit .env with your API keys`}
            </pre>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-yellow-400 font-medium">⚠️ Required: Set OPENROUTER_API_KEY in .env</p>
              <p className="text-xs text-gray-400 mt-1">Get your key at: https://openrouter.ai/keys</p>
            </div>
          </div>
        </div>

        {/* Running */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">4.</span> Running the Agent
          </h3>
          <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`python main.py`}
          </pre>
          <p className="text-xs text-gray-400 mt-3">
            This starts the interactive CLI. Type your queries and the agent will process them through the full pipeline.
          </p>
        </div>

        {/* Running Evaluations */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">5.</span> Running Evaluations
          </h3>
          <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`# Run the evaluation harness
python -c "
import asyncio
from config import Settings
from agent import AgenticAI
from evaluation import EvaluationHarness

async def run_eval():
    settings = Settings()
    # ... initialize agent ...
    harness = EvaluationHarness(agent, settings.openrouter_api_key)
    report = await harness.run_evaluation()
    harness.save_report(report, 'eval_report.json')

asyncio.run(run_eval())
"`}
          </pre>
        </div>

        {/* Project Structure */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">6.</span> Project Structure
          </h3>
          <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-300 font-mono">
{`agentic-ai-platform/
├── main.py              # Entry point
├── agent.py             # Core agent orchestration
├── graph.py             # LangGraph StateGraph
├── tools.py             # MCP tool definitions
├── memory.py            # Short-term + long-term memory
├── faiss_store.py       # FAISS vector database
├── guardrails.py        # Input/output validation
├── checkpointer.py      # Checkpoint management
├── observability.py     # Langfuse/LangSmith tracing
├── evaluation.py        # Evaluation harness
├── config.py            # Configuration
├── requirements.txt     # Dependencies
├── .env.example         # Environment template
└── data/
    ├── faiss_index/     # FAISS vector store
    ├── checkpoints.db   # SQLite checkpoints
    └── golden_dataset.json`}
          </pre>
        </div>
      </div>
    </div>
  );
}
