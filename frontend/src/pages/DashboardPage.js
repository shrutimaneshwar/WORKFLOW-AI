import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Loader2, AlertTriangle, Zap, DollarSign, Brain,
  BarChart3, Wrench, Clock, Share2, Globe, GlobeLock, Trash2, ChevronDown, ChevronUp
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";
const FRONTEND_URL = process.env.REACT_APP_BACKEND_URL;

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

function HistoryItem({ item, onSelect, onDelete, onTogglePublic }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0F172A] rounded-xl border border-slate-700/50 p-4" data-testid={`history-item-${item.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(item.id)}>
          <p className="text-slate-200 text-sm font-medium truncate">{item.workflow_description}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(item.created_at).toLocaleDateString()}
            </span>
            {item.complexity_analysis && (
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {item.complexity_analysis.substring(0, 40)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onTogglePublic(item.id)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
            title={item.is_public ? "Make private" : "Make public"}
            data-testid={`toggle-public-${item.id}`}
          >
            {item.is_public ? <Globe className="w-4 h-4 text-green-400" /> : <GlobeLock className="w-4 h-4 text-slate-500" />}
          </button>
          {item.is_public && item.share_token && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${FRONTEND_URL}/shared/${item.share_token}`);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Copy share link"
              data-testid={`copy-share-${item.id}`}
            >
              <Share2 className="w-4 h-4 text-blue-400" />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete"
            data-testid={`delete-history-${item.id}`}
          >
            <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workflowInput, setWorkflowInput] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API}/workflow-history`, { withCredentials: true });
      setHistory(data);
      setHistoryLoaded(true);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const toggleHistory = () => {
    if (!historyLoaded) fetchHistory();
    setShowHistory(s => !s);
  };

  const handleAnalyze = async () => {
    if (!workflowInput.trim()) {
      setError("Please enter a workflow description");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const { data } = await axios.post(`${API}/analyze-workflow`, { workflow_description: workflowInput }, { withCredentials: true });
      setAnalysis(data);
      if (historyLoaded) fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryDetail = async (id) => {
    try {
      const { data } = await axios.get(`${API}/workflow-history/${id}`, { withCredentials: true });
      setAnalysis(data);
      setWorkflowInput(data.workflow_description || "");
    } catch (err) {
      console.error("Failed to load analysis:", err);
    }
  };

  const deleteHistory = async (id) => {
    try {
      await axios.delete(`${API}/workflow-history/${id}`, { withCredentials: true });
      setHistory(h => h.filter(x => x.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const togglePublic = async (id) => {
    try {
      const { data } = await axios.post(`${API}/workflow-history/${id}/toggle-public`, {}, { withCredentials: true });
      setHistory(h => h.map(x => x.id === id ? { ...x, is_public: data.is_public, share_token: data.share_token } : x));
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0]" data-testid="dashboard-page">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-[#1E293B]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              WorkflowAI
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">AI Debugger & Optimizer</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400" data-testid="user-display-name">
              {user?.name || user?.email}
            </span>
            <button
              data-testid="logout-button"
              onClick={logout}
              className="text-sm text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Input Section */}
        <div className="bg-[#1E293B] rounded-2xl shadow-2xl shadow-black/20 p-8 mb-8 border border-slate-700/50">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Describe Your Workflow</h2>
          <textarea
            data-testid="workflow-input"
            value={workflowInput}
            onChange={e => setWorkflowInput(e.target.value)}
            placeholder="Example: User fills form -> data saved -> email sent -> update CRM -> no error handling"
            className="w-full h-40 bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            disabled={loading}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" data-testid="analysis-error">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              data-testid="analyze-button"
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? "Analyzing..." : "Analyze Workflow"}
            </button>

            <button
              data-testid="toggle-history-button"
              onClick={toggleHistory}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              History
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 mb-8 border border-slate-700/50 animate-fadeIn" data-testid="history-panel">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Analysis History
            </h3>
            {history.length === 0 ? (
              <p className="text-slate-500 text-sm">No analyses yet. Run your first workflow analysis above.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {history.map(item => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onSelect={loadHistoryDetail}
                    onDelete={deleteHistory}
                    onTogglePublic={togglePublic}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Output Sections */}
        {analysis && (
          <div className="space-y-6 animate-fadeIn" data-testid="analysis-results">
            {analysis.share_token && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Share2 className="w-3 h-3" />
                Share token: <code className="bg-slate-800 px-2 py-0.5 rounded">{analysis.share_token}</code>
              </div>
            )}

            <OutputCard title="Issues & Risks" icon={AlertTriangle} accentBorder="border-l-red-500" accentBg="bg-red-500/5" items={analysis.issues_risks || []} />
            <OutputCard title="Optimization Suggestions" icon={Zap} accentBorder="border-l-blue-500" accentBg="bg-blue-500/5" items={analysis.optimization_suggestions || []} />
            <OutputCard title="Cost & Efficiency Insights" icon={DollarSign} accentBorder="border-l-yellow-500" accentBg="bg-yellow-500/5" items={analysis.cost_efficiency_insights || []} />

            {/* Improved Workflow */}
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

            {/* Complexity Analysis */}
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
        )}
      </main>

      <footer className="border-t border-slate-700/50 mt-20 py-6 text-center text-slate-500 text-sm">
        WorkflowAI &mdash; Built with AI + System Design Thinking
      </footer>
    </div>
  );
}
