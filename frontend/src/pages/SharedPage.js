import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertTriangle, Zap, DollarSign, Brain, BarChart3, Wrench, ArrowLeft } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

function OutputCard({ title, icon: Icon, accentBorder, accentBg, items }) {
  return (
    <div className={`bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 border border-slate-700/50 border-l-4 ${accentBorder} ${accentBg}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="text-slate-500 mt-1.5 flex-shrink-0">&#8226;</span>
            <span className="text-slate-300 flex-1 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SharedPage() {
  const { shareToken } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/shared/${shareToken}`)
      .then(res => setAnalysis(res.data))
      .catch(err => setError(err.response?.data?.detail || "Analysis not found"))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4" data-testid="shared-error">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Not Found</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Go to WorkflowAI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0]" data-testid="shared-page">
      <header className="border-b border-slate-700/50 bg-[#1E293B]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              WorkflowAI
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Shared Analysis</p>
          </div>
          <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {analysis.workflow_description && (
          <div className="bg-[#1E293B] rounded-2xl p-6 mb-8 border border-slate-700/50">
            <h2 className="text-sm font-medium text-slate-400 mb-2">Workflow Description</h2>
            <p className="text-slate-200 text-sm font-mono">{analysis.workflow_description}</p>
          </div>
        )}

        <div className="space-y-6">
          <OutputCard title="Issues & Risks" icon={AlertTriangle} accentBorder="border-l-red-500" accentBg="bg-red-500/5" items={analysis.issues_risks || []} />
          <OutputCard title="Optimization Suggestions" icon={Zap} accentBorder="border-l-blue-500" accentBg="bg-blue-500/5" items={analysis.optimization_suggestions || []} />
          <OutputCard title="Cost & Efficiency Insights" icon={DollarSign} accentBorder="border-l-yellow-500" accentBg="bg-yellow-500/5" items={analysis.cost_efficiency_insights || []} />

          <div className="bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 border border-slate-700/50 border-l-4 border-l-green-500 bg-green-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-100">Improved Workflow</h3>
            </div>
            <div className="space-y-3">
              {(analysis.improved_workflow || []).map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-semibold border border-green-500/30">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 flex-1 pt-0.5 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 border border-slate-700/50 border-l-4 border-l-purple-500 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-slate-100">Complexity Analysis</h3>
            </div>
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 font-medium text-sm">
              {analysis.complexity_analysis}
            </div>
          </div>

          <OutputCard title="Advanced Engineering Suggestions" icon={Wrench} accentBorder="border-l-cyan-500" accentBg="bg-cyan-500/5" items={analysis.advanced_suggestions || []} />
        </div>
      </main>

      <footer className="border-t border-slate-700/50 mt-20 py-6 text-center text-slate-500 text-sm">
        WorkflowAI &mdash; Built with AI + System Design Thinking
      </footer>
    </div>
  );
}
