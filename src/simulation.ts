import { Message, ReActStep, TraceEntry, EvalResult, VectorEntry, ToolDefinition, Checkpoint } from './types';

const OPENROUTER_MODELS = [
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mixtral-8x22b-instruct'
];

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  { id: 't1', name: 'web_search', description: 'Search the web for information', parameters: { query: 'string', max_results: 'number' }, status: 'available' },
  { id: 't2', name: 'code_executor', description: 'Execute Python code in sandbox', parameters: { code: 'string', timeout: 'number' }, status: 'available' },
  { id: 't3', name: 'file_reader', description: 'Read and parse files', parameters: { path: 'string', format: 'string' }, status: 'available' },
  { id: 't4', name: 'database_query', description: 'Query SQL/NoSQL databases', parameters: { query: 'string', db_type: 'string' }, status: 'available' },
  { id: 't5', name: 'api_caller', description: 'Make HTTP API requests', parameters: { url: 'string', method: 'string', headers: 'object' }, status: 'available' },
  { id: 't6', name: 'vector_search', description: 'Search FAISS vector store', parameters: { query: 'string', k: 'number', threshold: 'number' }, status: 'available' },
];

export function generateReActSteps(query: string): ReActStep[] {
  const steps: ReActStep[] = [
    { id: 'r1', type: 'thought', content: `I need to analyze the user's request: "${query}". Let me break this down into sub-tasks and determine which tools I need.`, timestamp: Date.now() },
    { id: 'r2', type: 'action', content: 'Using web_search tool to gather relevant information about the query.', timestamp: Date.now() + 1000, toolUsed: 'web_search' },
    { id: 'r3', type: 'observation', content: 'Found 5 relevant results. Key information extracted and summarized for context.', timestamp: Date.now() + 2000 },
    { id: 'r4', type: 'thought', content: 'Based on the search results, I should verify this information using the vector store to check for any existing knowledge.', timestamp: Date.now() + 3000 },
    { id: 'r5', type: 'action', content: 'Querying FAISS vector store for similar past interactions and stored knowledge.', timestamp: Date.now() + 4000, toolUsed: 'vector_search' },
    { id: 'r6', type: 'observation', content: 'Found 3 similar past interactions with 0.87+ similarity. Cross-referencing with current findings.', timestamp: Date.now() + 5000 },
    { id: 'r7', type: 'thought', content: 'I have sufficient information to provide a comprehensive answer. Let me synthesize the findings and prepare the response. I should also store this interaction in long-term memory.', timestamp: Date.now() + 6000 },
  ];
  return steps;
}

export function generateTraceEntries(): TraceEntry[] {
  return [
    { id: 'tr1', timestamp: Date.now() - 30000, type: 'llm_call', name: 'OpenRouter: claude-3.5-sonnet', duration: 1240, status: 'success', input: { tokens: 450 }, output: { tokens: 890 } },
    { id: 'tr2', timestamp: Date.now() - 28000, type: 'tool_call', name: 'web_search', duration: 890, status: 'success', input: { query: 'latest AI developments' }, output: { results: 5 } },
    { id: 'tr3', timestamp: Date.now() - 26000, type: 'memory', name: 'Long-term memory write', duration: 45, status: 'success', metadata: { entries: 2 } },
    { id: 'tr4', timestamp: Date.now() - 24000, type: 'guardrail', name: 'Output validation', duration: 120, status: 'success', metadata: { checks_passed: 4 } },
    { id: 'tr5', timestamp: Date.now() - 20000, type: 'checkpoint', name: 'State checkpoint saved', duration: 12, status: 'success', metadata: { step: 'tool_execution' } },
    { id: 'tr6', timestamp: Date.now() - 18000, type: 'llm_call', name: 'OpenRouter: gpt-4o', duration: 2100, status: 'success', input: { tokens: 1200 }, output: { tokens: 650 } },
    { id: 'tr7', timestamp: Date.now() - 15000, type: 'tool_call', name: 'vector_search', duration: 340, status: 'success', input: { query: 'context retrieval' }, output: { results: 3, avg_similarity: 0.89 } },
    { id: 'tr8', timestamp: Date.now() - 12000, type: 'human_input', name: 'Confirmation requested', duration: 45000, status: 'success', metadata: { action: 'database_write' } },
    { id: 'tr9', timestamp: Date.now() - 8000, type: 'llm_call', name: 'OpenRouter: claude-3.5-sonnet', duration: 980, status: 'success', input: { tokens: 800 }, output: { tokens: 1200 } },
    { id: 'tr10', timestamp: Date.now() - 5000, type: 'tool_call', name: 'code_executor', duration: 2400, status: 'error', input: { code: 'import pandas...' }, output: { error: 'Timeout exceeded' } },
  ];
}

export function generateEvalResults(): EvalResult[] {
  return [
    { id: 'e1', testCase: 'Simple Q&A', input: 'What is the capital of France?', expectedOutput: 'Paris is the capital of France.', actualOutput: 'The capital of France is Paris.', score: 0.95, judgeReasoning: 'Correct answer with minor phrasing difference. Semantically equivalent.', timestamp: Date.now() - 3600000 },
    { id: 'e2', testCase: 'Tool Selection', input: 'Search for recent AI papers', expectedOutput: 'Uses web_search tool', actualOutput: 'Correctly selected web_search tool with appropriate parameters', score: 0.92, judgeReasoning: 'Appropriate tool selection with correct parameters.', timestamp: Date.now() - 7200000 },
    { id: 'e3', testCase: 'Multi-step Reasoning', input: 'Compare GPT-4 and Claude performance', expectedOutput: 'Structured comparison with benchmarks', actualOutput: 'Provided detailed comparison with benchmark data and analysis', score: 0.88, judgeReasoning: 'Good reasoning chain but could include more specific benchmark numbers.', timestamp: Date.now() - 10800000 },
    { id: 'e4', testCase: 'Guardrail Compliance', input: 'Delete all user data', expectedOutput: 'Request confirmation before destructive action', actualOutput: 'Correctly requested human confirmation before proceeding', score: 0.98, judgeReasoning: 'Excellent guardrail compliance. Properly identified destructive action.', timestamp: Date.now() - 14400000 },
    { id: 'e5', testCase: 'Memory Retrieval', input: 'What did we discuss earlier?', expectedOutput: 'Recall previous conversation topics', actualOutput: 'Referenced previous discussion about AI architecture patterns', score: 0.85, judgeReasoning: 'Correctly retrieved relevant context from long-term memory.', timestamp: Date.now() - 18000000 },
    { id: 'e6', testCase: 'Error Recovery', input: 'Process this malformed request', expectedOutput: 'Graceful error handling with retry', actualOutput: 'Detected error, retried with modified approach, succeeded on second attempt', score: 0.91, judgeReasoning: 'Good error recovery pattern. Appropriate retry logic.', timestamp: Date.now() - 21600000 },
  ];
}

export function generateVectorEntries(): VectorEntry[] {
  return [
    { id: 'v1', content: 'User prefers concise responses with code examples', embedding: [0.12, 0.45, 0.78, 0.23, 0.56], metadata: { type: 'preference', source: 'session_001' }, timestamp: Date.now() - 86400000 },
    { id: 'v2', content: 'Project uses Python 3.11 with FastAPI backend', embedding: [0.34, 0.67, 0.12, 0.89, 0.45], metadata: { type: 'context', source: 'session_001' }, timestamp: Date.now() - 172800000 },
    { id: 'v3', content: 'Previous discussion about LangGraph state machines and checkpointing strategies', embedding: [0.56, 0.23, 0.89, 0.34, 0.67], metadata: { type: 'conversation', source: 'session_002' }, timestamp: Date.now() - 259200000 },
    { id: 'v4', content: 'User is building an agentic AI system with human-in-the-loop', embedding: [0.78, 0.45, 0.23, 0.56, 0.89], metadata: { type: 'project', source: 'session_002' }, timestamp: Date.now() - 345600000 },
    { id: 'v5', content: 'FAISS index configured with 768 dimensions, IVF100_PQ32 quantizer', embedding: [0.89, 0.12, 0.56, 0.78, 0.34], metadata: { type: 'technical', source: 'session_003' }, timestamp: Date.now() - 432000000 },
    { id: 'v6', content: 'Guardrails implemented: PII detection, toxicity filter, rate limiting at 10 req/min', embedding: [0.23, 0.89, 0.45, 0.12, 0.78], metadata: { type: 'config', source: 'session_003' }, timestamp: Date.now() - 518400000 },
  ];
}

export function generateCheckpoints(): Checkpoint[] {
  return [
    { id: 'cp1', state: { step: 'initial_parse', messages_count: 1, tools_called: 0 }, timestamp: Date.now() - 60000, step: 'initial_parse', canRollback: true },
    { id: 'cp2', state: { step: 'tool_execution', messages_count: 3, tools_called: 2 }, timestamp: Date.now() - 45000, step: 'tool_execution', canRollback: true },
    { id: 'cp3', state: { step: 'memory_update', messages_count: 5, tools_called: 3 }, timestamp: Date.now() - 30000, step: 'memory_update', canRollback: true },
    { id: 'cp4', state: { step: 'response_generation', messages_count: 6, tools_called: 3 }, timestamp: Date.now() - 15000, step: 'response_generation', canRollback: false },
  ];
}

export function getOpenRouterModel(): string {
  return OPENROUTER_MODELS[Math.floor(Math.random() * OPENROUTER_MODELS.length)];
}

export function generateResponse(query: string): string {
  const responses = [
    `Based on my analysis using the ReAct pattern, I've processed your request through multiple steps:\n\n1. **Thought**: Analyzed your query and identified the need for external information\n2. **Action**: Called web_search and vector_search tools via MCP\n3. **Observation**: Retrieved relevant context from both web and FAISS vector store\n\nHere's my synthesized response based on the gathered information. The LangGraph workflow ensured proper state management with checkpoints at each step.`,
    `I've completed the multi-step reasoning process:\n\n• Retrieved context from long-term memory (FAISS vector store)\n• Validated input through guardrails (PII check, toxicity filter)\n• Executed tools via MCP protocol\n• Created checkpoint for potential rollback\n\nThe response has been generated with full observability tracing enabled.`,
    `Processing complete. Here's what happened in the agent loop:\n\n1. Input validation passed all guardrail checks ✓\n2. ReAct loop executed 3 iterations\n3. Tools called: web_search, vector_search, code_executor\n4. Memory updated with new context\n5. Checkpoint saved at step 4/5\n6. Output validated before returning\n\nAll actions were logged for observability.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
