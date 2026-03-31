import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Loader2, AlertTriangle, Zap, DollarSign, Brain,
  BarChart3, Wrench, Activity, LogOut, ArrowLeft, GitCompare,
  CheckCircle2, XCircle
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const MODEL_COLORS = {
  claude: { accent: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  gpt: { accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  gemini: { accent: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

function CompactCard({ title, icon: Icon, iconColor, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 4).map((item, i) => (
          <li key={i} className="flex gap-2 items-start text-xs">
            <span className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 ${iconColor.replace('text-', 'bg-')}`} />
            <span className="text-[#94A3B8] flex-1 leading-relaxed">{item}</span>
          </li>
        ))}
        {items.length > 4 && (
          <li className="text-xs text-[#64748B] pl-3">+{items.length - 4} more</li>
        )}
      </ul>
    </div>
  );
}

function ModelColumn({ result, colors }) {
  if (result.status === "error") {
    return (
      <div className={`bg-[#1E293B] rounded-lg border ${colors.border} p-5 flex-1 min-w-0`}>
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-sm font-semibold ${colors.accent}`}>{result.label}</span>
          <XCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-md p-3">
          Analysis failed: {result.error?.substring(0, 100)}
        </div>
      </div>
    );
  }

  const d = result.data || {};
  return (
    <div className={`bg-[#1E293B] rounded-lg border ${colors.border} p-5 flex-1 min-w-0 animate-slideUp`}>
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
          {result.label}
        </span>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>

      <CompactCard title="Issues & Risks" icon={AlertTriangle} iconColor="text-rose-400" items={d.issues_risks} />
      <CompactCard title="Optimizations" icon={Zap} iconColor="text-blue-400" items={d.optimization_suggestions} />
      <CompactCard title="Cost & Efficiency" icon={DollarSign} iconColor="text-amber-400" items={d.cost_efficiency_insights} />

      {d.improved_workflow && d.improved_workflow.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Improved Workflow</span>
          </div>
          <div className="space-y-1">
            {d.improved_workflow.slice(0, 5).map((step, i) => (
              <div key={i} className="flex gap-2 items-start text-xs">
                <span className="flex-shrink-0 w-4 h-4 bg-emerald-500/10 text-emerald-400 rounded text-[10px] flex items-center justify-center font-semibold border border-emerald-500/20">
                  {i + 1}
                </span>
                <span className="text-[#94A3B8] flex-1 leading-relaxed">{step}</span>
              </div>
            ))}
            {d.improved_workflow.length > 5 && (
              <div className="text-xs text-[#64748B] pl-6">+{d.improved_workflow.length - 5} more steps</div>
            )}
          </div>
        </div>
      )}

      {d.complexity_analysis && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Complexity</span>
          </div>
          <div className="px-2.5 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded text-violet-300 text-xs">
            {d.complexity_analysis}
          </div>
        </div>
      )}

      <CompactCard title="Advanced" icon={Wrench} iconColor="text-cyan-400" items={d.advanced_suggestions} />
    </div>
  );
}

export default function ComparePage() {
  const { user, logout } = useAuth();
  const [workflowInput, setWorkflowInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  const handleCompare = async () => {
    if (!workflowInput.trim()) {
      setError("Please enter a workflow description");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    setProgress("Running all 3 models in parallel...");

    try {
      const { data } = await axios.post(`${API}/compare-models`, {
        workflow_description: workflowInput
      }, { withCredentials: true });
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.detail || "Comparison failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const successCount = results ? results.filter(r => r.status === "success").length : 0;

  return (
    <div className="min-h-screen bg-[#0F172A]" data-testid="compare-page">
      {/* Header */}
      <header className="border-b border-[#334155] bg-[#0F172A] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-[#F8FAFC]">WorkflowAI</h1>
                <p className="text-[10px] text-[#64748B] uppercase tracking-widest">Compare Models</p>
              </div>
            </Link>
            <Link to="/" className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5" data-testid="back-to-dashboard">
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8] hidden sm:block">{user?.name || user?.email}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3 py-1.5 rounded-md transition-colors">
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Input */}
        <div className="bg-[#1E293B] rounded-lg p-6 mb-6 border border-[#334155]">
          <div className="flex items-center gap-2.5 mb-4">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-[#F8FAFC] tracking-tight">Compare All AI Models</h2>
          </div>
          <p className="text-[#94A3B8] text-sm mb-4">
            Run the same workflow through Claude Sonnet 4.5, GPT-5.2, and Gemini 3 Flash simultaneously. Compare insights side-by-side.
          </p>
          <textarea
            data-testid="compare-workflow-input"
            value={workflowInput}
            onChange={e => setWorkflowInput(e.target.value)}
            placeholder="Describe your workflow... e.g., User submits form -> validate -> save to DB -> send email -> update dashboard"
            className="w-full h-28 bg-[#020617] border border-[#334155] rounded-md px-4 py-3 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none font-mono text-sm"
            disabled={loading}
          />

          {error && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-sm" data-testid="compare-error">
              {error}
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <button
              data-testid="compare-button"
              onClick={handleCompare}
              disabled={loading}
              className={`px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-2 text-sm ${loading ? 'glow-pulse' : ''}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
              {loading ? "Comparing..." : "Compare All Models"}
            </button>
            {loading && (
              <span className="text-xs text-[#94A3B8] animate-pulse">{progress}</span>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div data-testid="compare-results">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">Results</h3>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {successCount}/{results.length} models completed
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {results.map(result => (
                <ModelColumn
                  key={result.model}
                  result={result}
                  colors={MODEL_COLORS[result.model] || MODEL_COLORS.claude}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#334155] mt-16 py-5 text-center text-[#64748B] text-xs">
        WorkflowAI &mdash; Compare AI Models Side-by-Side
      </footer>
    </div>
  );
}
