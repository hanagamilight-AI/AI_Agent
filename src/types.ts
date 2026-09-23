export interface AgentState {
  id: string;
  messages: Message[];
  currentStep: string;
  status: 'idle' | 'running' | 'waiting_human' | 'completed' | 'error';
  checkpoint: Checkpoint | null;
  memory: MemoryState;
  guardrails: GuardrailState;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Checkpoint {
  id: string;
  state: Record<string, any>;
  timestamp: number;
  step: string;
  canRollback: boolean;
}

export interface MemoryState {
  shortTerm: MemoryItem[];
  longTerm: VectorEntry[];
  sessionId: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  ttl: number;
  relevance: number;
}

export interface VectorEntry {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: number;
  similarity?: number;
}

export interface GuardrailState {
  inputValidation: GuardrailRule[];
  outputValidation: GuardrailRule[];
  rateLimit: RateLimitConfig;
  confirmations: ConfirmationStep[];
}

export interface GuardrailRule {
  id: string;
  name: string;
  type: 'regex' | 'llm' | 'keyword' | 'toxicity' | 'pii';
  enabled: boolean;
  description: string;
  lastTriggered?: number;
}

export interface RateLimitConfig {
  maxActionsPerMinute: number;
  currentCount: number;
  windowStart: number;
  cooldownMs: number;
}

export interface ConfirmationStep {
  id: string;
  action: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  status: 'available' | 'running' | 'completed' | 'error';
  result?: any;
}

export interface TraceEntry {
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

export interface EvalResult {
  id: string;
  testCase: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  score: number;
  judgeReasoning: string;
  timestamp: number;
}

export interface ReActStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  timestamp: number;
  toolUsed?: string;
}
