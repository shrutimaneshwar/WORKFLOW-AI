import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertTriangle, Zap, DollarSign, Brain, BarChart3, Wrench, ArrowLeft, Activity } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

function OutputCard({ title, icon: Icon, iconColor, items, staggerClass }) {
  return (
    <div className={`bg-[#1E293B] rounded-lg p-5 border border-[#334155] animate-slideUp ${staggerClass}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${iconColor.replace('text-', 'bg-').replace('400', '500/10')} border ${iconColor.replace('text-', 'border-').replace('400', '500/20')}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 items-start text-sm">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${iconColor.replace('text-', 'bg-')}`} />
            <span className="text-[#94A3B8] flex-1 leading-relaxed">{item}</span>
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4" data-testid="shared-error">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-2 tracking-tight">Not Found</h2>
          <p className="text-[#94A3B8] text-sm mb-4">{error}</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Go to WorkflowAI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]" data-testid="shared-page">
      <header className="border-b border-[#334155] bg-[#0F172A] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#F8FAFC]">WorkflowAI</h1>
              <p className="text-[10px] text-[#64748B] uppercase tracking-widest">Shared Analysis</p>
            </div>
          </div>
          <Link to="/login" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {analysis.workflow_description && (
          <div className="bg-[#1E293B] rounded-lg p-5 mb-6 border border-[#334155]">
            <h2 className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wide">Workflow Description</h2>
            <p className="text-[#F8FAFC] text-sm font-mono leading-relaxed">{analysis.workflow_description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OutputCard title="Issues & Risks" icon={AlertTriangle} iconColor="text-rose-400" items={analysis.issues_risks || []} staggerClass="stagger-1" />
          <OutputCard title="Optimizations" icon={Zap} iconColor="text-blue-400" items={analysis.optimization_suggestions || []} staggerClass="stagger-2" />
          <OutputCard title="Cost & Efficiency" icon={DollarSign} iconColor="text-amber-400" items={analysis.cost_efficiency_insights || []} staggerClass="stagger-3" />

          <div className="md:col-span-2 lg:col-span-2 bg-[#1E293B] rounded-lg p-5 border border-[#334155] animate-slideUp stagger-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                <Brain className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">Improved Workflow</h3>
            </div>
            <div className="space-y-2.5">
              {(analysis.improved_workflow || []).map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-md flex items-center justify-center text-xs font-semibold border border-emerald-500/20">
                    {i + 1}
                  </span>
                  <p className="text-[#94A3B8] flex-1 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-5 border border-[#334155] animate-slideUp stagger-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
                <BarChart3 className="w-4 h-4 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">Complexity</h3>
            </div>
            <div className="px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-md text-violet-300 text-sm leading-relaxed">
              {analysis.complexity_analysis}
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 animate-slideUp stagger-6">
            <OutputCard title="Advanced Engineering Suggestions" icon={Wrench} iconColor="text-cyan-400" items={analysis.advanced_suggestions || []} staggerClass="" />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#334155] mt-16 py-5 text-center text-[#64748B] text-xs">
        Powered by WorkflowAI &mdash; AI Debugger & Optimizer
      </footer>
    </div>
  );
}
