import { useState } from "react";
import "@/App.css";
import axios from "axios";
import { Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [workflowInput, setWorkflowInput] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!workflowInput.trim()) {
      setError("Please enter a workflow description");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await axios.post(`${API}/analyze-workflow`, {
        workflow_description: workflowInput,
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.response?.data?.detail || "Failed to analyze workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0]">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-[#1E293B]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              WorkflowAI ⚡
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">AI Debugger & Optimizer</p>
          </div>
          <div className="text-sm text-slate-400">
            Built by <span className="text-slate-300 font-medium">Emergent Team</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Input Section */}
        <div className="bg-[#1E293B] rounded-2xl shadow-2xl shadow-black/20 p-8 mb-8 border border-slate-700/50">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Describe Your Workflow</h2>
          <textarea
            value={workflowInput}
            onChange={(e) => setWorkflowInput(e.target.value)}
            placeholder="Example: User fills form → data saved → email sent → update CRM → no error handling"
            className="w-full h-40 bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            disabled={loading}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing workflow...
              </>
            ) : (
              <>
                🚀 Analyze Workflow
              </>
            )}
          </button>
        </div>

        {/* Output Sections */}
        {analysis && (
          <div className="space-y-6 animate-fadeIn">
            {/* Issues & Risks */}
            <OutputCard
              title="Issues & Risks"
              icon="⚠️"
              accentColor="border-l-red-500"
              bgAccent="bg-red-500/5"
              items={analysis.issues_risks}
            />

            {/* Optimization Suggestions */}
            <OutputCard
              title="Optimization Suggestions"
              icon="⚡"
              accentColor="border-l-blue-500"
              bgAccent="bg-blue-500/5"
              items={analysis.optimization_suggestions}
            />

            {/* Cost & Efficiency Insights */}
            <OutputCard
              title="Cost & Efficiency Insights"
              icon="💰"
              accentColor="border-l-yellow-500"
              bgAccent="bg-yellow-500/5"
              items={analysis.cost_efficiency_insights}
            />

            {/* Improved Workflow */}
            <div className="bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 border border-slate-700/50 border-l-4 border-l-green-500 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🧠</span>
                <h3 className="text-lg font-semibold text-slate-100">Improved Workflow</h3>
              </div>
              <div className="space-y-3">
                {analysis.improved_workflow.map((step, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-7 h-7 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-semibold border border-green-500/30">
                      {index + 1}
                    </span>
                    <p className="text-slate-300 flex-1 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 border border-slate-700/50 border-l-4 border-l-purple-500 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-lg font-semibold text-slate-100">Complexity Analysis</h3>
              </div>
              <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 font-medium">
                {analysis.complexity_analysis}
              </div>
            </div>

            {/* Advanced Engineering Suggestions */}
            <OutputCard
              title="Advanced Engineering Suggestions"
              icon="🔧"
              accentColor="border-l-cyan-500"
              bgAccent="bg-cyan-500/5"
              items={analysis.advanced_suggestions}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20 py-6 text-center text-slate-400 text-sm">
        ⚡ Built using AI + System Design Thinking
      </footer>
    </div>
  );
}

// Reusable Output Card Component
function OutputCard({ title, icon, accentColor, bgAccent, items }) {
  return (
    <div className={`bg-[#1E293B] rounded-2xl shadow-xl shadow-black/10 p-6 border border-slate-700/50 border-l-4 ${accentColor} ${bgAccent}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 items-start">
            <span className="text-slate-500 mt-1.5 flex-shrink-0">•</span>
            <span className="text-slate-300 flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
