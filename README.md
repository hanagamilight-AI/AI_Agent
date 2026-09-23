# Agentic AI Platform — Python Implementation

A comprehensive, production-ready Agentic AI system built entirely in **Python** with **LangGraph**, **OpenRouter**, **FAISS**, and **MCP (Model Context Protocol)**.

> This repository serves as both a **code browser** (React app) and the **complete Python source code** for the agentic AI platform. Browse all Python files in the interactive viewer, copy code, and understand the full architecture.

---

## 🏗️ Architecture Overview

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────┐
│            GUARDRAILS LAYER                      │
│  PII Detection │ Toxicity │ Injection │ Rate     │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            MEMORY RETRIEVAL                      │
│  Short-term (Session)  +  Long-term (FAISS)     │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          LANGGRAPH STATEGRAPH                    │
│  START → Input → Agent(ReAct) → Tools?          │
│                    ↑         │                   │
│                    │    ┌────┴────┐              │
│                    │   Yes      No               │
│                    │    │        │               │
│                    │  Tool    Output → END       │
│                    │    │                        │
│                    │  Approval?                   │
│                    │   │     │                   │
│                    │  High  Low                   │
│                    │   │     └──→ Agent          │
│                    └───┘                          │
│               Human-in-the-Loop                  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  Output Guardrails → Memory Update → Checkpoint │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  OBSERVABILITY: Langfuse + LangSmith + Logging  │
└─────────────────────────────────────────────────┘
```

---

## 📁 Python Files

| File | Description |
|------|-------------|
| `main.py` | Entry point — initializes all components and runs the CLI |
| `agent.py` | Core agent — orchestrates the full pipeline |
| `graph.py` | LangGraph StateGraph — ReAct loop with conditional edges |
| `tools.py` | MCP tool definitions — 6 tools with risk-based routing |
| `memory.py` | Dual memory — short-term (session) + long-term (FAISS) |
| `faiss_store.py` | FAISS vector database — 1536-dim embeddings, similarity search |
| `guardrails.py` | Safety system — PII, toxicity, injection, rate limiting |
| `checkpointer.py` | Checkpoint management — SQLite-backed state persistence |
| `observability.py` | Tracing — Langfuse/LangSmith integration, metrics |
| `evaluation.py` | Evaluation harness — golden dataset, LLM-as-judge |
| `config.py` | Configuration — pydantic-settings, env-based config |
| `requirements.txt` | Python dependencies |
| `.env.example` | Environment variable template |

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd agentic-ai-platform

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY

# 5. Run
python main.py
```

---

## 🧠 Key Concepts Implemented

### 1. Human-in-the-Loop (HITL)
High-risk tools (`database_query`, `api_caller`, `code_executor`) require human approval. The LangGraph interrupts at `human_node`, pausing execution until approved/rejected.

### 2. Checkpointing
Every state transition is saved via LangGraph's `AsyncSqliteSaver`. Enables rollback, recovery, and time-travel debugging.

### 3. FAISS Vector Database
1536-dimensional embeddings (OpenAI `text-embedding-3-small`) stored in FAISS with `IndexFlatIP`. Supports semantic similarity search for long-term memory.

### 4. ReAct Pattern
Thought → Action → Observation loop in `agent_node`. The LLM reasons, calls tools, observes results, and iterates (max 10 iterations).

### 5. MCP Tool Calling
6 tools registered via Model Context Protocol. Standardized JSON-RPC interface. Risk-based approval routing for dangerous operations.

### 6. Dual Memory
- **Short-term**: In-memory session state with TTL (1 hour default)
- **Long-term**: FAISS vector store for persistent semantic knowledge

### 7. Guardrails
- **Input**: PII redaction, toxicity filter, prompt injection detection, length limits
- **Output**: Hallucination markers, data leak prevention
- **Rate limiting**: Token bucket algorithm (10 actions/minute)

### 8. Observability
- Langfuse distributed tracing
- LangSmith integration
- Structured JSON logging
- Metrics collection (latency, tokens, errors)

### 9. Evaluation Harness
- Golden dataset with 8+ test cases
- LLM-as-judge scoring (GPT-4o)
- Regression detection (current vs baseline)
- Capability breakdown by category

---

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | LangGraph (StateGraph) |
| LLM Gateway | OpenRouter API |
| Vector DB | FAISS (faiss-cpu) |
| Tool Protocol | MCP (Model Context Protocol) |
| Checkpointing | SQLite + LangGraph Checkpointer |
| Observability | Langfuse + LangSmith |
| Configuration | pydantic-settings |
| Language | Python 3.11+ |

---

## 📊 Evaluation

Run the evaluation harness to test the agent:

```python
from evaluation import EvaluationHarness

harness = EvaluationHarness(agent, openrouter_api_key="...")
report = await harness.run_evaluation()

print(f"Pass Rate: {report.pass_rate:.1%}")
print(f"Avg Score: {report.avg_score:.2f}")
```

---

## 📝 License

MIT
