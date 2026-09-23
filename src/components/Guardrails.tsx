import { useState } from 'react';
import { Shield, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2, Gauge, Lock, Eye } from 'lucide-react';

interface GuardrailRule {
  id: string;
  name: string;
  type: 'input' | 'output';
  category: string;
  enabled: boolean;
  description: string;
  triggeredCount: number;
  lastTriggered?: number;
}

export default function Guardrails() {
  const [rules, setRules] = useState<GuardrailRule[]>([
    { id: 'g1', name: 'PII Detection', type: 'input', category: 'privacy', enabled: true, description: 'Detect and redact personally identifiable information', triggeredCount: 12, lastTriggered: Date.now() - 3600000 },
    { id: 'g2', name: 'Toxicity Filter', type: 'input', category: 'safety', enabled: true, description: 'Block harmful, abusive, or toxic content', triggeredCount: 3, lastTriggered: Date.now() - 86400000 },
    { id: 'g3', name: 'Prompt Injection', type: 'input', category: 'security', enabled: true, description: 'Detect and prevent prompt injection attacks', triggeredCount: 7, lastTriggered: Date.now() - 7200000 },
    { id: 'g4', name: 'Output Hallucination', type: 'output', category: 'accuracy', enabled: true, description: 'Check for factual consistency and hallucination markers', triggeredCount: 5, lastTriggered: Date.now() - 14400000 },
    { id: 'g5', name: 'Sensitive Data Leak', type: 'output', category: 'privacy', enabled: true, description: 'Prevent leaking sensitive system information', triggeredCount: 2, lastTriggered: Date.now() - 172800000 },
    { id: 'g6', name: 'Format Validation', type: 'output', category: 'quality', enabled: true, description: 'Ensure output matches expected format/schema', triggeredCount: 8, lastTriggered: Date.now() - 5400000 },
    { id: 'g7', name: 'Keyword Blocklist', type: 'input', category: 'safety', enabled: false, description: 'Block messages containing banned keywords', triggeredCount: 0 },
    { id: 'g8', name: 'Length Limit', type: 'input', category: 'quality', enabled: true, description: 'Reject inputs exceeding maximum token length', triggeredCount: 15, lastTriggered: Date.now() - 1800000 },
  ]);

  const [rateLimit, setRateLimit] = useState({
    maxPerMinute: 10,
    currentCount: 7,
    windowMs: 60000,
    cooldownMs: 5000,
    lastReset: Date.now() - 30000,
  });

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const enabledCount = rules.filter(r => r.enabled).length;
  const totalTriggers = rules.reduce((sum, r) => sum + r.triggeredCount, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-400" />
          Guardrails & Safety
        </h2>
        <p className="text-sm text-gray-400 mt-1">Input/output validation, rate limiting, action confirmation, and retry/rollback logic</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Active Rules</p>
          <p className="text-xl font-bold text-green-400">{enabledCount}/{rules.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Total Triggers</p>
          <p className="text-xl font-bold text-yellow-400">{totalTriggers}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Rate Limit</p>
          <p className="text-xl font-bold text-white">{rateLimit.currentCount}/{rateLimit.maxPerMinute}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Blocked Today</p>
          <p className="text-xl font-bold text-red-400">4</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-auto">
        {/* Rules List */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Validation Rules</h3>
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className={`p-4 rounded-xl border transition-all ${
                rule.enabled 
                  ? 'bg-gray-900/50 border-gray-800' 
                  : 'bg-gray-900/20 border-gray-800/50 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      rule.type === 'input' ? 'bg-blue-500/10' : 'bg-orange-500/10'
                    }`}>
                      {rule.type === 'input' ? <Lock className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{rule.name}</p>
                      <p className="text-xs text-gray-400">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rule.type === 'input' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {rule.type}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1">Triggered: {rule.triggeredCount}x</p>
                    </div>
                    <button onClick={() => toggleRule(rule.id)} className="text-gray-400 hover:text-white transition-colors">
                      {rule.enabled ? (
                        <ToggleRight className="w-7 h-7 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limit & Retry */}
        <div className="flex flex-col gap-4">
          {/* Rate Limiter */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              Rate Limiter
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Actions this minute</span>
                  <span className="text-white">{rateLimit.currentCount}/{rateLimit.maxPerMinute}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      rateLimit.currentCount / rateLimit.maxPerMinute > 0.8 ? 'bg-red-500' : 'bg-violet-500'
                    }`}
                    style={{ width: `${(rateLimit.currentCount / rateLimit.maxPerMinute) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Window</p>
                  <p className="text-xs text-white">{rateLimit.windowMs / 1000}s</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Cooldown</p>
                  <p className="text-xs text-white">{rateLimit.cooldownMs / 1000}s</p>
                </div>
              </div>
            </div>
          </div>

          {/* Retry Logic */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Retry / Rollback
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xs text-gray-300">Max Retries</span>
                <span className="text-xs font-medium text-white">3</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xs text-gray-300">Backoff Strategy</span>
                <span className="text-xs font-medium text-white">Exponential</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xs text-gray-300">Rollback on Fail</span>
                <span className="text-xs font-medium text-green-400">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <span className="text-xs text-gray-300">Checkpoint Restore</span>
                <span className="text-xs font-medium text-green-400">Enabled</span>
              </div>
            </div>
          </div>

          {/* Confirmation Steps */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Confirmation Steps
            </h3>
            <div className="space-y-2">
              {['Destructive operations', 'External API calls', 'Data modifications', 'Model switching'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
