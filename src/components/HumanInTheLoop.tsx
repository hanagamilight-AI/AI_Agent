import { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, AlertTriangle, RotateCcw, Save, History } from 'lucide-react';
import { generateCheckpoints } from '../simulation';

interface PendingAction {
  id: string;
  action: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: Record<string, string>;
}

export default function HumanInTheLoop() {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([
    { id: 'pa1', action: 'database_write', description: 'Write user preferences to database', risk: 'medium', timestamp: Date.now() - 30000, details: { table: 'user_prefs', operation: 'UPSERT', records: '3' } },
    { id: 'pa2', action: 'api_external_call', description: 'Call external payment API', risk: 'critical', timestamp: Date.now() - 60000, details: { endpoint: '/api/v2/charge', amount: '$49.99', method: 'POST' } },
    { id: 'pa3', action: 'file_delete', description: 'Delete temporary processing files', risk: 'high', timestamp: Date.now() - 90000, details: { path: '/tmp/agent_cache/', files: '12', size: '45MB' } },
    { id: 'pa4', action: 'email_send', description: 'Send summary email to user', risk: 'low', timestamp: Date.now() - 120000, details: { to: 'user@example.com', subject: 'Analysis Complete', attachments: '2' } },
  ]);

  const [completedActions, setCompletedActions] = useState<Array<{ id: string; action: string; decision: 'approved' | 'rejected'; timestamp: number }>>([
    { id: 'ca1', action: 'code_execution', decision: 'approved', timestamp: Date.now() - 300000 },
    { id: 'ca2', action: 'data_export', decision: 'rejected', timestamp: Date.now() - 600000 },
    { id: 'ca3', action: 'model_switch', decision: 'approved', timestamp: Date.now() - 900000 },
  ]);

  const checkpoints = generateCheckpoints();

  const handleApprove = (id: string) => {
    const action = pendingActions.find(a => a.id === id);
    if (action) {
      setCompletedActions(prev => [{ id: action.id, action: action.action, decision: 'approved', timestamp: Date.now() }, ...prev]);
      setPendingActions(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleReject = (id: string) => {
    const action = pendingActions.find(a => a.id === id);
    if (action) {
      setCompletedActions(prev => [{ id: action.id, action: action.action, decision: 'rejected', timestamp: Date.now() }, ...prev]);
      setPendingActions(prev => prev.filter(a => a.id !== id));
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-violet-400" />
          Human-in-the-Loop & Checkpoints
        </h2>
        <p className="text-sm text-gray-400 mt-1">Review and approve/reject agent actions. Manage checkpoints for rollback capability.</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-auto">
        {/* Pending Actions */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Pending Actions ({pendingActions.length})
          </h3>
          <div className="space-y-3 overflow-auto flex-1">
            {pendingActions.map((action) => (
              <div key={action.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{action.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Action: <code className="text-violet-400">{action.action}</code></p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(action.risk)}`}>
                    {action.risk}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {Object.entries(action.details).map(([key, value]) => (
                    <div key={key} className="bg-gray-800/50 rounded px-2 py-1">
                      <p className="text-[10px] text-gray-500 uppercase">{key}</p>
                      <p className="text-xs text-gray-300">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(action.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-xs font-medium text-green-400 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(action.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-medium text-red-400 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingActions.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                All actions reviewed
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Checkpoints */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Save className="w-4 h-4 text-blue-400" />
              Checkpoints (LangGraph)
            </h3>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="space-y-2">
                {checkpoints.map((cp, i) => (
                  <div key={cp.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${i === checkpoints.length - 1 ? 'bg-violet-400' : 'bg-green-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-200">{cp.step}</p>
                      <p className="text-[10px] text-gray-500">Messages: {cp.state.messages_count} | Tools: {cp.state.tools_called}</p>
                    </div>
                    <span className="text-[10px] text-gray-500">{Math.round((Date.now() - cp.timestamp) / 1000)}s ago</span>
                    {cp.canRollback && (
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors" title="Rollback to this checkpoint">
                        <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision History */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              Decision History
            </h3>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 overflow-auto max-h-52">
              <div className="space-y-2">
                {completedActions.map((action) => (
                  <div key={action.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30">
                    {action.decision === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-gray-300">{action.action}</p>
                      <p className="text-[10px] text-gray-500">{Math.round((Date.now() - action.timestamp) / 60000)}m ago</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      action.decision === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {action.decision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
