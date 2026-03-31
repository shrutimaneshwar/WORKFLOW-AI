import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader2, Mail, ArrowLeft, Activity, CheckCircle2 } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

function formatApiError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(" ");
  return String(detail);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] auth-bg flex items-center justify-center px-6" data-testid="forgot-password-page">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-xl font-bold tracking-tight text-[#F8FAFC]">WorkflowAI</span>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          {sent ? (
            <div className="text-center animate-fadeIn" data-testid="forgot-password-success">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-2 tracking-tight">Check your email</h2>
              <p className="text-[#94A3B8] text-sm mb-6">If an account exists for that email, we've sent reset instructions.</p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-1 tracking-tight">Reset password</h2>
              <p className="text-[#94A3B8] text-sm mb-5">Enter your email to receive a reset link.</p>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    data-testid="forgot-email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#020617] border border-[#334155] rounded-md pl-10 pr-4 py-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  data-testid="forgot-submit-button"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] inline-flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
