# Agentic AI Platform

A comprehensive production-ready Agentic AI system built with **LangGraph**, **OpenRouter**, **FAISS**, and **MCP (Model Context Protocol)**. This platform demonstrates advanced agent capabilities including human-in-the-loop workflows, persistent memory, safety guardrails, and full observability.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (React + Tailwind Dashboard)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Guardrails Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Input Valid. │  │ Output Valid.│  │ Rate Limiter (10/min)│  │
│  │ - PII Detect │  │ - Hallucinat.│  │ - Exponential Backoff│  │
│  │ - Toxicity   │  │ - Data Leak  │  │ - Retry Logic        │  │
│  │ - Injection  │  │ - Format     │  │ - Rollback           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LangGraph StateGraph                           │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  START   │───▶│  Agent   │───▶│  Tools   │───▶│  Memory  │  │
│  │          │    │  (LLM)   │    │  (MCP)   │    │  Update  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│        │               │               │               │        │
│        │               ▼               ▼               ▼        │
│        │         ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│        │         │  Human   │    │Checkpoint│    │  Output  │  │
│        │         │  Review  │    │  Save    │    │  Valid.  │  │
│        │         └──────────┘    └──────────┘    └──────────┘  │
│        │               │               │               │        │
│        └───────────────┴───────────────┴───────────────┘        │
│                            │                                     │
│                            ▼                                     │
│                       ┌──────────┐                               │
│                       │   END    │                               │
│                       └──────────┘                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   Memory Systems        │    │   Observability         │
│  ┌───────────────────┐  │    │  ┌───────────────────┐  │
│  │ Short-term Memory │  │    │  │ LangSmith/Langfuse│  │
│  │ (Session State)   │  │    │  │ Distributed Trace │  │
│  └───────────────────┘  │    │  └───────────────────┘  │
│  ┌───────────────────┐  │    │  ┌───────────────────┐  │
│  │ Long-term Memory  │  │    │  │ Metrics Dashboard │  │
│  │ (FAISS Vectors)   │  │    │  │ Logging System    │  │
│  └───────────────────┘  │    │  └───────────────────┘  │
└─────────────────────────┘    └─────────────────────────┘
```

## 📋 Table of Contents

1. [Core Concepts](#core-concepts)
2. [Human-in-the-Loop](#human-in-the-loop)
3. [Checkpointing](#checkpointing)
4. [FAISS Vector Database](#faiss-vector-database)
5. [ReAct Pattern](#react-pattern)
6. [Tool Calling with MCP](#tool-calling-with-mcp)
7. [Memory Systems](#memory-systems)
8. [Guardrails](#guardrails)
9. [Observability](#observability)
10. [Evaluation Harness](#evaluation-harness)
11. [System Flow](#system-flow)
12. [Technology Stack](#technology-stack)

---

## 🎯 Core Concepts

This platform implements a sophisticated agentic AI system that goes beyond simple LLM interactions. It combines multiple advanced patterns to create a safe, observable, and reliable autonomous agent.

### Key Principles

- **Safety First**: Multiple layers of validation and human oversight
- **Persistence**: Long-term memory and checkpointing for state recovery
- **Observability**: Full tracing and monitoring for production debugging
- **Reliability**: Retry logic, rollback capabilities, and error recovery
- **Extensibility**: Modular architecture with MCP tool protocol

---

## 👤 Human-in-the-Loop

### What is it?

Human-in-the-loop (HITL) is a safety mechanism where the agent pauses execution and requests human approval before performing high-risk or irreversible actions.

### Why it matters

Autonomous agents can make mistakes. HITL ensures that critical decisions—especially those involving external systems, data modifications, or financial transactions—require explicit human approval.

### Implementation

```typescript
// Example: Agent requests approval before database write
{
  id: 'action_123',
  action: 'database_write',
  description: 'Write user preferences to database',
  risk: 'medium',  // low | medium | high | critical
  timestamp: Date.now(),
  details: {
    table: 'user_prefs',
    operation: 'UPSERT',
    records: '3'
  }
}
```

### Risk Levels

- **Low**: Informational actions (e.g., sending emails, logging)
- **Medium**: Data modifications (e.g., database writes, file updates)
- **High**: Destructive operations (e.g., file deletion, data export)
- **Critical**: External integrations (e.g., payment APIs, system changes)

### Workflow

1. Agent identifies action requiring approval
2. System creates confirmation request with full context
3. Human reviews action details and risk level
4. Human approves or rejects the action
5. Agent continues based on decision
6. Decision is logged for audit trail

### Benefits

- **Prevents costly mistakes** before they happen
- **Builds trust** through transparency
- **Audit trail** for compliance and debugging
- **Gradual autonomy** as confidence grows

---

## 💾 Checkpointing

### What is it?

Checkpointing is the process of saving the agent's state at key points during execution, allowing for rollback and recovery if something goes wrong.

### Why it matters

Long-running agent tasks can fail at any point. Without checkpoints, you'd have to restart from the beginning. Checkpoints enable:

- **Recovery**: Resume from the last successful state
- **Rollback**: Undo problematic actions
- **Debugging**: Inspect state at any point in execution
- **Time travel**: Replay execution from any checkpoint

### Implementation

```typescript
interface Checkpoint {
  id: string;
  state: {
    step: string;              // Current execution step
    messages_count: number;    // Conversation history length
    tools_called: number;      // Number of tool invocations
    // ... additional state
  };
  timestamp: number;
  canRollback: boolean;        // Whether this checkpoint is reversible
}

// Checkpoints are saved at key transitions
const checkpoints = [
  { step: 'initial_parse', messages_count: 1, tools_called: 0 },
  { step: 'tool_execution', messages_count: 3, tools_called: 2 },
  { step: 'memory_update', messages_count: 5, tools_called: 3 },
  { step: 'response_generation', messages_count: 6, tools_called: 3 }
];
```

### LangGraph Integration

LangGraph provides built-in checkpointing via `Checkpointer` implementations:

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Configure checkpointing
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")

# Use in graph execution
graph = StateGraph(AgentState)
graph.compile(checkpointer=checkpointer)
```

### Checkpoint Strategy

- **Save before** irreversible actions
- **Save after** successful tool executions
- **Save at** state transitions
- **Prune old** checkpoints to manage storage

---

## 🧠 FAISS Vector Database

### What is it?

FAISS (Facebook AI Similarity Search) is a high-performance vector database for efficient similarity search and clustering of dense vectors. It's used here for long-term memory storage.

### Why it matters

Traditional databases can't efficiently search by semantic meaning. FAISS enables:

- **Semantic search**: Find similar concepts, not just exact matches
- **Long-term memory**: Store and retrieve knowledge across sessions
- **Context retrieval**: Pull relevant information for current task
- **Knowledge base**: Build searchable document collections

### Implementation

```typescript
interface VectorEntry {
  id: string;
  content: string;              // Original text
  embedding: number[];          // 768-dimensional vector
  metadata: Record<string, any>; // Additional context
  timestamp: number;
  similarity?: number;          // Computed during search
}

// Example vector storage
{
  id: 'v1',
  content: 'User prefers concise responses with code examples',
  embedding: [0.12, 0.45, 0.78, ...],  // 768 dimensions
  metadata: { 
    type: 'preference', 
    source: 'session_001' 
  },
  timestamp: Date.now()
}
```

### Configuration

```python
import faiss

# Initialize FAISS index
dimension = 768  # OpenAI/Anthropic embedding size
index = faiss.IndexIVFPQ(
    dimension,     # Vector dimension
    100,           # Number of clusters (IVF)
    32,            # Number of sub-quantizers (PQ)
    8,             # Bits per sub-quantizer
    faiss.METRIC_INNER_PRODUCT
)

# Train and add vectors
index.train(training_vectors)
index.add(vectors)

# Search
distances, indices = index.search(query_vector, k=5)
```

### Use Cases

1. **User preferences**: Store interaction patterns
2. **Project context**: Remember technical details
3. **Conversation history**: Retrieve relevant past discussions
4. **Knowledge base**: Store documentation, code snippets, etc.

### Performance

- **768 dimensions**: Standard for modern embeddings
- **IVF100_PQ32**: Balanced speed/accuracy configuration
- **Sub-millisecond search**: Even with millions of vectors
- **Memory efficient**: Quantization reduces storage by ~90%

---

## 🔄 ReAct Pattern

### What is it?

ReAct (Reasoning + Acting) is a prompting pattern where the LLM alternates between reasoning about what to do and taking actions. It's the core reasoning loop of the agent.

### Why it matters

Simple prompt-response doesn't work for complex tasks. ReAct enables:

- **Multi-step reasoning**: Break down complex problems
- **Tool use**: Call external tools when needed
- **Self-correction**: Observe results and adjust approach
- **Transparency**: Show reasoning chain for debugging

### Implementation

```typescript
interface ReActStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  timestamp: number;
  toolUsed?: string;
}

// Example ReAct chain
const steps = [
  {
    type: 'thought',
    content: 'I need to analyze the user\'s request. Let me break this down...'
  },
  {
    type: 'action',
    content: 'Using web_search tool to gather relevant information',
    toolUsed: 'web_search'
  },
  {
    type: 'observation',
    content: 'Found 5 relevant results. Key information extracted...'
  },
  {
    type: 'thought',
    content: 'Based on search results, I should verify with vector store...'
  },
  // ... continues until task complete
];
```

### ReAct Loop

```
┌─────────────────────────────────────┐
│           User Query                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  THOUGHT: What do I need to do?     │
│  - Analyze request                  │
│  - Identify required information    │
│  - Plan approach                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ACTION: Execute tool               │
│  - web_search, code_executor, etc.  │
│  - Pass parameters                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  OBSERVATION: Tool result           │
│  - Parse output                     │
│  - Evaluate success                 │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Task done?   │
        └──────┬───────┘
               │
        ┌──────┴──────┐
        │             │
       No            Yes
        │             │
        ▼             ▼
    [Loop]     [Final Response]
```

### Benefits

- **Explainable**: See exactly how agent reached conclusion
- **Flexible**: Can use any combination of tools
- **Robust**: Can retry or change approach based on observations
- **Efficient**: Only calls tools when needed

---

## 🔧 Tool Calling with MCP

### What is it?

MCP (Model Context Protocol) is a standardized protocol for LLMs to interact with external tools and services. It defines how tools are discovered, invoked, and how results are returned.

### Why it matters

LLMs are limited to text generation. MCP enables them to:

- **Access real-time data**: Search the web, query databases
- **Execute code**: Run scripts, process data
- **Interact with APIs**: Call external services
- **Perform actions**: Modify files, send messages, etc.

### Implementation

```typescript
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  status: 'available' | 'running' | 'completed' | 'error';
}

// Available tools
const tools = [
  {
    id: 'web_search',
    name: 'web_search',
    description: 'Search the web for information',
    parameters: { 
      query: 'string', 
      max_results: 'number' 
    }
  },
  {
    id: 'code_executor',
    name: 'code_executor',
    description: 'Execute Python code in sandbox',
    parameters: { 
      code: 'string', 
      timeout: 'number' 
    }
  },
  {
    id: 'vector_search',
    name: 'vector_search',
    description: 'Search FAISS vector store',
    parameters: { 
      query: 'string', 
      k: 'number', 
      threshold: 'number' 
    }
  },
  // ... more tools
];
```

### MCP Request Format

```json
{
  "method": "tools/call",
  "params": {
    "name": "web_search",
    "arguments": {
      "query": "LangGraph checkpointing best practices",
      "max_results": 5
    }
  }
}
```

### MCP Response Format

```json
{
  "result": {
    "results": [
      {
        "title": "LangGraph Checkpointing Guide",
        "url": "https://...",
        "snippet": "..."
      }
    ],
    "count": 5
  }
}
```

### Tool Categories

1. **Information Retrieval**: web_search, vector_search, file_reader
2. **Code Execution**: code_executor, database_query
3. **External APIs**: api_caller, email_sender
4. **System Operations**: file_writer, process_manager

### Error Handling

```typescript
// Retry logic for failed tool calls
async function executeToolWithRetry(tool: ToolDefinition, params: any) {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await callTool(tool, params);
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        // Exponential backoff
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  throw lastError;
}
```

---

## 🧩 Memory Systems

### Overview

The platform implements a dual-memory architecture:

1. **Short-term Memory**: Session-scoped, ephemeral context
2. **Long-term Memory**: Persistent, vector-based knowledge store

### Short-term Memory

**Purpose**: Maintain context within a single session

**Characteristics**:
- Stored in memory (fast access)
- TTL-based expiration (e.g., 1 hour)
- Relevance scoring for prioritization
- Session-specific

```typescript
interface ShortTermItem {
  id: string;
  content: string;
  timestamp: number;
  ttl: number;           // Time-to-live in seconds
  relevance: number;     // 0.0 - 1.0
}

// Example items
[
  {
    content: 'User asked about LangGraph checkpointing',
    timestamp: Date.now() - 120000,
    ttl: 3600,
    relevance: 0.95
  },
  {
    content: 'Current model: claude-3.5-sonnet via OpenRouter',
    timestamp: Date.now() - 60000,
    ttl: 3600,
    relevance: 0.88
  }
]
```

**Use Cases**:
- Current conversation context
- Recent tool call results
- Temporary working memory
- User preferences for session

### Long-term Memory

**Purpose**: Persistent knowledge across sessions

**Characteristics**:
- Stored in FAISS vector database
- Semantic search capability
- No expiration (permanent)
- Cross-session retrieval

```typescript
interface VectorEntry {
  id: string;
  content: string;
  embedding: number[];      // 768-dimensional vector
  metadata: Record<string, any>;
  timestamp: number;
}

// Example entries
[
  {
    content: 'User prefers concise responses with code examples',
    embedding: [0.12, 0.45, 0.78, ...],
    metadata: { 
      type: 'preference', 
      source: 'session_001' 
    }
  },
  {
    content: 'Project uses Python 3.11 with FastAPI backend',
    embedding: [0.34, 0.67, 0.12, ...],
    metadata: { 
      type: 'context', 
      source: 'session_001' 
    }
  }
]
```

**Use Cases**:
- User preferences and habits
- Project technical details
- Past conversation summaries
- Learned knowledge and facts

### Memory Flow

```
User Query
    │
    ├─▶ Short-term Memory
    │   └─▶ Recent context (last N messages)
    │   └─▶ Current session state
    │
    ├─▶ Long-term Memory (FAISS)
    │   └─▶ Semantic search for relevant knowledge
    │   └─▶ Retrieve similar past interactions
    │
    └─▶ Agent Processing
        └─▶ Combine both memory sources
        └─▶ Generate response
        └─▶ Update memories
            ├─▶ Add to short-term (immediate)
            └─▶ Add to long-term (if significant)
```

### Memory Management

**Writing**:
- Every interaction adds to short-term memory
- Significant insights promoted to long-term
- Metadata tracks source and context

**Reading**:
- Short-term: Direct access by timestamp
- Long-term: Semantic similarity search
- Combined: Merge and rank by relevance

**Cleanup**:
- Short-term: TTL expiration
- Long-term: Manual pruning or relevance decay
- Deduplication: Remove near-identical entries

---

## 🛡️ Guardrails

### Overview

Guardrails are safety mechanisms that validate inputs and outputs, prevent harmful actions, and ensure the agent operates within safe boundaries.

### Input Validation

**Purpose**: Filter and validate user inputs before processing

**Checks**:

1. **PII Detection**
   - Detect personally identifiable information
   - Redact or block sensitive data
   - Examples: emails, phone numbers, SSNs

2. **Toxicity Filter**
   - Block harmful, abusive, or toxic content
   - Prevent hate speech and harassment
   - Maintain safe interaction environment

3. **Prompt Injection**
   - Detect attempts to override system prompts
   - Block jailbreak attempts
   - Prevent unauthorized actions

4. **Length Limits**
   - Enforce maximum input length
   - Prevent resource exhaustion
   - Maintain response quality

```typescript
interface GuardrailRule {
  id: string;
  name: string;
  type: 'input' | 'output';
  category: string;
  enabled: boolean;
  description: string;
  triggeredCount: number;
}

// Example rules
[
  {
    name: 'PII Detection',
    type: 'input',
    category: 'privacy',
    enabled: true,
    description: 'Detect and redact personally identifiable information'
  },
  {
    name: 'Toxicity Filter',
    type: 'input',
    category: 'safety',
    enabled: true,
    description: 'Block harmful, abusive, or toxic content'
  }
]
```

### Output Validation

**Purpose**: Ensure agent responses are safe and correct

**Checks**:

1. **Hallucination Detection**
   - Check for factual inconsistencies
   - Verify claims against knowledge base
   - Flag uncertain statements

2. **Data Leak Prevention**
   - Prevent leaking system prompts
   - Block sensitive configuration data
   - Protect internal implementation details

3. **Format Validation**
   - Ensure output matches expected schema
   - Validate JSON structure
   - Check required fields

### Action Confirmation

**Purpose**: Require human approval for high-risk actions

**Flow**:
1. Agent identifies risky action
2. System creates confirmation request
3. Human reviews and approves/rejects
4. Agent proceeds based on decision

**Risk Classification**:
- **Low**: Informational, reversible
- **Medium**: Data modifications
- **High**: Destructive operations
- **Critical**: External integrations

### Rate Limiting

**Purpose**: Prevent abuse and resource exhaustion

**Configuration**:
```typescript
interface RateLimitConfig {
  maxActionsPerMinute: number;  // 10
  currentCount: number;         // 7
  windowMs: number;             // 60000 (1 minute)
  cooldownMs: number;           // 5000 (5 seconds)
}
```

**Behavior**:
- Track actions per time window
- Block when limit exceeded
- Exponential backoff on retries
- Separate limits per action type

### Retry/Rollback Logic

**Purpose**: Handle failures gracefully

**Retry Strategy**:
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt) * 1000;
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Rollback**:
- Restore from last checkpoint
- Undo partial changes
- Notify user of failure
- Log for debugging

### Guardrails Flow

```
User Input
    │
    ▼
┌─────────────────────┐
│ Input Guardrails    │
│ - PII Detection     │
│ - Toxicity Filter   │
│ - Injection Check   │
│ - Length Limit      │
└──────────┬──────────┘
           │
           ▼ (if passes)
    ┌──────────────┐
    │ Rate Limiter │
    └──────┬───────┘
           │
           ▼ (if under limit)
    ┌──────────────┐
    │ Agent Process│
    └──────┬───────┘
           │
           ▼
┌─────────────────────┐
│ Output Guardrails   │
│ - Hallucination     │
│ - Data Leak         │
│ - Format Validation │
└──────────┬──────────┘
           │
           ▼ (if passes)
    ┌──────────────┐
    │ Action Check │
    │ (if risky)   │
    └──────┬───────┘
           │
           ▼ (if approved or low-risk)
    ┌──────────────┐
    │   Response   │
    └──────────────┘
```

---

## 👁️ Observability

### Overview

Observability provides visibility into agent behavior through logging, distributed tracing, and monitoring dashboards. Essential for debugging, optimization, and production monitoring.

### Logging

**Purpose**: Record all agent activities for debugging and audit

**Log Levels**:
- **INFO**: Normal operations
- **WARN**: Potential issues, rate limits approaching
- **ERROR**: Failures, exceptions
- **DEBUG**: Detailed execution info

**Example Logs**:
```
[12:00:01] INFO  Agent initialized with LangGraph StateGraph
[12:00:02] INFO  Connected to OpenRouter API (claude-3.5-sonnet)
[12:00:02] INFO  FAISS index loaded: 6 vectors, 768 dimensions
[12:05:23] WARN  Rate limit approaching: 7/10 actions in current window
[12:08:42] ERROR Tool execution failed: code_executor timeout after 30s
[12:08:44] INFO  Retry attempt 1/3 for code_executor with backoff=2s
[12:08:46] INFO  Retry successful: code_executor completed in 1.8s
```

### Distributed Tracing

**Purpose**: Track execution flow across components

**Tools**: LangSmith, Langfuse

**Trace Types**:
1. **LLM Calls**: Model invocations, token usage, latency
2. **Tool Calls**: External tool executions, results
3. **Human Input**: Approval requests, decisions
4. **Checkpoints**: State saves, rollback points
5. **Guardrails**: Validation checks, blocks
6. **Memory**: Read/write operations

```typescript
interface TraceEntry {
  id: string;
  timestamp: number;
  type: 'llm_call' | 'tool_call' | 'human_input' | 'checkpoint' | 'guardrail' | 'memory';
  name: string;
  duration?: number;
  status: 'success' | 'error' | 'pending';
  input?: any;
  output?: any;
  metadata?: Record<string, any>;
}

// Example trace
{
  id: 'tr1',
  timestamp: Date.now() - 30000,
  type: 'llm_call',
  name: 'OpenRouter: claude-3.5-sonnet',
  duration: 1240,
  status: 'success',
  input: { tokens: 450 },
  output: { tokens: 890 }
}
```

### Metrics Dashboard

**Key Metrics**:

1. **Performance**
   - LLM latency (avg, p95, p99)
   - Tool execution time
   - Total request duration
   - Token usage

2. **Reliability**
   - Success rate
   - Error rate
   - Retry count
   - Timeout frequency

3. **Usage**
   - Requests per hour
   - Tool call distribution
   - Memory operations
   - Guardrail triggers

4. **Cost**
   - Token consumption
   - API calls
   - Storage usage

**Visualization**:
- **Time series**: Latency, request volume over time
- **Distribution**: Tool usage, error types
- **Heatmaps**: Activity patterns
- **Gauges**: Rate limit usage, success rates

### LangSmith/Langfuse Integration

```python
from langsmith import Client

# Initialize client
client = Client(api_key="your-api-key")

# Trace agent execution
@traceable
def agent_step(query: str):
    # LLM call
    response = llm.invoke(query)
    
    # Tool call
    result = tool.execute(params)
    
    return response

# View traces in LangSmith UI
# - See full execution flow
# - Inspect inputs/outputs
# - Debug failures
# - Analyze performance
```

### Production Monitoring

**Alerts**:
- Error rate > 5%
- Latency > 5s
- Rate limit > 80%
- Memory usage > 90%

**Health Checks**:
- LLM API connectivity
- FAISS index health
- Database availability
- Tool server status

**Dashboards**:
- Real-time metrics
- Historical trends
- Error analysis
- Cost tracking

---

## 🧪 Evaluation Harness

### Overview

Evaluation harnesses systematically test agent behavior using predefined test cases, golden datasets, and LLM-as-judge scoring to catch regressions before deployment.

### Test Cases

**Purpose**: Define expected behavior for specific scenarios

**Structure**:
```typescript
interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Example test cases
[
  {
    id: 'tc1',
    name: 'Simple Q&A',
    input: 'What is the capital of France?',
    expectedOutput: 'Paris is the capital of France.',
    category: 'basic_knowledge',
    difficulty: 'easy'
  },
  {
    id: 'tc2',
    name: 'Tool Selection',
    input: 'Search for recent AI papers',
    expectedOutput: 'Uses web_search tool',
    category: 'tool_usage',
    difficulty: 'medium'
  }
]
```

### Golden Datasets

**Purpose**: Curated collection of high-quality test cases

**Characteristics**:
- Manually verified correct answers
- Cover diverse scenarios
- Include edge cases
- Version controlled

**Categories**:
1. **Basic Knowledge**: Factual questions
2. **Tool Usage**: Correct tool selection
3. **Multi-step Reasoning**: Complex problem solving
4. **Guardrail Compliance**: Safety checks
5. **Memory Retrieval**: Context recall
6. **Error Recovery**: Handling failures

```typescript
interface GoldenDataset {
  version: string;
  testCases: TestCase[];
  createdAt: number;
  description: string;
}

// Example dataset
{
  version: 'gd_2024_01_15',
  testCases: [...],  // 42 test cases
  createdAt: Date.now(),
  description: 'Comprehensive evaluation dataset'
}
```

### LLM-as-Judge Scoring

**Purpose**: Automatically evaluate agent outputs using another LLM

**How it works**:
1. Agent produces output for test input
2. Judge LLM compares to expected output
3. Judge provides score (0.0 - 1.0) and reasoning
4. Results aggregated for analysis

```typescript
interface EvalResult {
  id: string;
  testCase: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  score: number;           // 0.0 - 1.0
  judgeReasoning: string;
  timestamp: number;
}

// Example result
{
  testCase: 'Simple Q&A',
  input: 'What is the capital of France?',
  expectedOutput: 'Paris is the capital of France.',
  actualOutput: 'The capital of France is Paris.',
  score: 0.95,
  judgeReasoning: 'Correct answer with minor phrasing difference. Semantically equivalent.',
  timestamp: Date.now()
}
```

**Judge Prompt**:
```
You are an expert evaluator. Compare the actual output to the expected output.

Input: {input}
Expected: {expectedOutput}
Actual: {actualOutput}

Score the actual output from 0.0 to 1.0:
- 1.0: Perfect match or semantically equivalent
- 0.8-0.9: Minor differences, still correct
- 0.6-0.7: Partially correct, missing details
- 0.4-0.5: Mostly incorrect
- 0.0-0.3: Completely wrong

Provide your score and reasoning.
```

### Evaluation Metrics

**Aggregate Metrics**:
- **Average Score**: Mean across all test cases
- **Pass Rate**: % of tests scoring ≥ 0.8
- **Failure Rate**: % of tests scoring < 0.6
- **Regression Detection**: Compare to previous version

**Capability Breakdown**:
```typescript
const capabilities = [
  { metric: 'Accuracy', score: 0.91 },
  { metric: 'Tool Use', score: 0.88 },
  { metric: 'Reasoning', score: 0.85 },
  { metric: 'Safety', score: 0.96 },
  { metric: 'Memory', score: 0.82 },
  { metric: 'Recovery', score: 0.89 }
];
```

### Regression Detection

**Purpose**: Catch performance degradation before deployment

**Process**:
1. Run evaluation on current version
2. Compare to baseline (previous version)
3. Flag significant drops (> 5% score decrease)
4. Block deployment if regressions detected

**Comparison**:
```typescript
interface RegressionReport {
  currentVersion: string;
  baselineVersion: string;
  avgScoreChange: number;      // +2.1%
  passRateChange: number;      // +1.5%
  regressions: string[];       // Test cases that got worse
  improvements: string[];      // Test cases that got better
}
```

### Continuous Evaluation

**CI/CD Integration**:
```yaml
# .github/workflows/eval.yml
name: Agent Evaluation

on: [push, pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Evaluation
        run: |
          npm run eval -- --dataset golden_dataset.json --output results.json
      
      - name: Check Regressions
        run: |
          npm run check-regressions -- --baseline baseline.json --current results.json
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: eval-results
          path: results.json
```

---

## 🔄 System Flow

### Complete Request Flow

```
1. User Input
   │
   ├─▶ Input Guardrails
   │   ├─ PII Detection
   │   ├─ Toxicity Filter
   │   ├─ Injection Check
   │   └─ Length Validation
   │
   ├─▶ Rate Limiter
   │   └─ Check: < 10 actions/min?
   │
   ├─▶ Memory Retrieval
   │   ├─ Short-term: Recent context
   │   └─ Long-term: FAISS semantic search
   │
   ├─▶ LangGraph Execution
   │   ├─ START
   │   ├─ Agent (LLM) - ReAct Loop
   │   │   ├─ Thought
   │   │   ├─ Action (Tool Call)
   │   │   ├─ Observation
   │   │   └─ Repeat until done
   │   ├─ Tool Execution (MCP)
   │   │   ├─ web_search
   │   │   ├─ code_executor
   │   │   ├─ vector_search
   │   │   └─ ...
   │   ├─ Human Review (if high-risk)
   │   ├─ Checkpoint Save
   │   └─ Memory Update
   │
   ├─▶ Output Guardrails
   │   ├─ Hallucination Check
   │   ├─ Data Leak Prevention
   │   └─ Format Validation
   │
   ├─▶ Observability
   │   ├─ Log all steps
   │   ├─ Create traces
   │   └─ Update metrics
   │
   └─▶ Response to User

2. Error Handling
   │
   ├─▶ Retry Logic
   │   ├─ Attempt 1: Immediate
   │   ├─ Attempt 2: 2s delay
   │   └─ Attempt 3: 4s delay
   │
   ├─▶ Rollback
   │   └─ Restore from checkpoint
   │
   └─▶ Fallback
       └─ Return error message
```

### State Management

```typescript
interface AgentState {
  // Conversation
  messages: Message[];
  currentStep: string;
  
  // Execution
  status: 'idle' | 'running' | 'waiting_human' | 'completed' | 'error';
  checkpoint: Checkpoint | null;
  
  // Memory
  memory: {
    shortTerm: MemoryItem[];
    longTerm: VectorEntry[];
    sessionId: string;
  };
  
  // Safety
  guardrails: {
    inputValidation: GuardrailRule[];
    outputValidation: GuardrailRule[];
    rateLimit: RateLimitConfig;
    confirmations: ConfirmationStep[];
  };
}
```

---

## 🛠️ Technology Stack

### Core Framework

- **LangGraph**: State machine orchestration with checkpointing
- **React**: Frontend UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

### LLM Integration

- **OpenRouter**: Multi-model gateway
  - Claude 3.5 Sonnet (Anthropic)
  - GPT-4o (OpenAI)
  - Gemini Pro 1.5 (Google)
  - Llama 3.1 70B (Meta)
  - Mixtral 8x22B (Mistral)

### Vector Database

- **FAISS**: High-performance similarity search
  - 768-dimensional embeddings
  - IVF100_PQ32 index type
  - Sub-millisecond search

### Tool Protocol

- **MCP (Model Context Protocol)**: Standardized tool calling
  - 6 registered tools
  - JSON-RPC based
  - Error handling and retries

### Observability

- **LangSmith/Langfuse**: Distributed tracing
- **Recharts**: Metrics visualization
- **Custom logging**: Structured logs

### Safety

- **Guardrails**: Input/output validation
- **Rate limiting**: Token bucket algorithm
- **Human-in-the-loop**: Approval workflows
- **Checkpointing**: State persistence

---

## 📊 Performance Characteristics

### Latency

- **LLM calls**: 800ms - 2.5s (depending on model)
- **Tool execution**: 200ms - 3s (depending on tool)
- **Vector search**: < 10ms
- **Memory operations**: < 5ms
- **Guardrail checks**: < 50ms

### Throughput

- **Requests**: ~60/min (rate limited)
- **Tool calls**: ~30/min
- **Memory writes**: ~100/sec
- **Vector searches**: ~1000/sec

### Storage

- **Short-term memory**: ~1MB per session
- **Long-term memory**: ~1KB per vector entry
- **Checkpoints**: ~10KB per checkpoint
- **Logs**: ~1KB per request

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Evaluation

```bash
npm run eval
```

---

## 📝 Configuration

### Environment Variables

```bash
# OpenRouter API
OPENROUTER_API_KEY=your-key-here

# LangSmith
LANGSMITH_API_KEY=your-key-here
LANGSMITH_PROJECT=agentic-ai-prod

# FAISS
FAISS_INDEX_PATH=./data/faiss.index
FAISS_DIMENSIONS=768

# Rate Limiting
MAX_ACTIONS_PER_MINUTE=10
RATE_LIMIT_WINDOW_MS=60000
```

### LangGraph Configuration

```typescript
const graphConfig = {
  checkpointer: SqliteSaver.fromConnString("checkpoints.db"),
  memoryStore: InMemoryStore(),
  interruptBefore: ["human_review"],
  interruptAfter: ["tool_execution"]
};
```

---

## 🔒 Security Considerations

### Input Sanitization

- PII detection and redaction
- Prompt injection prevention
- Toxicity filtering
- Length limits

### Output Validation

- Hallucination detection
- Data leak prevention
- Format validation
- Content filtering

### Access Control

- API key management
- Rate limiting per user
- Action approval workflows
- Audit logging

### Data Protection

- Encrypted storage
- Secure API communication
- Minimal data retention
- Regular cleanup

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Agent not calling tools
- **Cause**: ReAct loop not triggering
- **Solution**: Check system prompt, verify tool descriptions

**Issue**: High latency
- **Cause**: Slow LLM response or tool execution
- **Solution**: Switch to faster model, optimize tool calls

**Issue**: Memory not persisting
- **Cause**: FAISS index not saving
- **Solution**: Check file permissions, verify save path

**Issue**: Guardrails too strict
- **Cause**: False positives in validation
- **Solution**: Tune thresholds, adjust rules

---

## 📚 Additional Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [OpenRouter API](https://openrouter.ai/docs)
- [FAISS Documentation](https://faiss.ai/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [LangSmith Guide](https://docs.smith.langchain.com/)

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- LangChain team for LangGraph
- Meta for FAISS
- Anthropic, OpenAI, Google for LLM models
- Model Context Protocol contributors

---

**Built with ❤️ for the agentic AI community**
