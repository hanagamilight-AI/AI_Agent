import { useState } from 'react';
import { TestTube, Play, CheckCircle2, XCircle, Star, BarChart3, Target, TrendingUp } from 'lucide-react';
import { generateEvalResults } from '../simulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Evaluation() {
  const [results] = useState(generateEvalResults());
  const [isRunning, setIsRunning] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const passCount = results.filter(r => r.score >= 0.8).length;

  const radarData = [
    { metric: 'Accuracy', score: 0.91 },
    { metric: 'Tool Use', score: 0.88 },
    { metric: 'Reasoning', score: 0.85 },
    { metric: 'Safety', score: 0.96 },
    { metric: 'Memory', score: 0.82 },
    { metric: 'Recovery', score: 0.89 },
  ];

  const scoreDistribution = [
    { range: '0.0-0.4', count: 0 },
    { range: '0.4-0.6', count: 0 },
    { range: '0.6-0.8', count: 1 },
    { range: '0.8-0.9', count: 3 },
    { range: '0.9-1.0', count: 2 },
  ];

  const handleRunEval = async () => {
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsRunning(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TestTube className="w-5 h-5 text-violet-400" />
            Evaluation Harness
          </h2>
          <p className="text-sm text-gray-400 mt-1">Test cases, golden datasets, and LLM-as-judge scoring for regression detection</p>
        </div>
        <button
          onClick={handleRunEval}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Evaluation'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Avg Score</p>
          <p className="text-xl font-bold text-green-400">{(avgScore * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Pass Rate (≥0.8)</p>
          <p className="text-xl font-bold text-white">{passCount}/{results.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Test Cases</p>
          <p className="text-xl font-bold text-violet-400">{results.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Judge Model</p>
          <p className="text-xl font-bold text-white text-sm">GPT-4o</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-auto">
        {/* Test Results */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Test Results (Golden Dataset)
          </h3>
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => setActiveTest(activeTest === result.id ? null : result.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeTest === result.id
                    ? 'bg-violet-500/5 border-violet-500/30'
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.score >= 0.8 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-medium text-white">{result.testCase}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span className={`text-sm font-bold ${
                        result.score >= 0.9 ? 'text-green-400' : result.score >= 0.8 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(result.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-800/30 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500">Input</p>
                    <p className="text-xs text-gray-300 truncate">{result.input}</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500">Expected</p>
                    <p className="text-xs text-gray-300 truncate">{result.expectedOutput}</p>
                  </div>
                </div>
                
                {activeTest === result.id && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="bg-gray-800/30 rounded-lg p-2 mb-2">
                      <p className="text-[10px] text-gray-500">Actual Output</p>
                      <p className="text-xs text-gray-300">{result.actualOutput}</p>
                    </div>
                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-2">
                      <p className="text-[10px] text-violet-400 font-medium mb-1">LLM Judge Reasoning</p>
                      <p className="text-xs text-gray-300">{result.judgeReasoning}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Capability Radar
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fontSize: 8, fill: '#6b7280' }} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              Score Distribution
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Regression Check</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                <span className="text-xs text-green-400">No regressions detected</span>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div className="p-2 bg-gray-800/30 rounded-lg">
                <p className="text-[10px] text-gray-500">Last comparison</p>
                <p className="text-xs text-gray-300">v2.3.1 vs v2.3.0: +2.1% avg improvement</p>
              </div>
              <div className="p-2 bg-gray-800/30 rounded-lg">
                <p className="text-[10px] text-gray-500">Golden dataset version</p>
                <p className="text-xs text-gray-300">gd_2024_01_15 (42 test cases)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
