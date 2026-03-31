import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4" data-testid="forgot-password-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            WorkflowAI
          </h1>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-8 border border-slate-700/50 shadow-2xl shadow-black/20">
          {sent ? (
            <div className="text-center" data-testid="forgot-password-success">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">Check Your Email</h2>
              <p className="text-slate-400 text-sm mb-6">If an account exists for that email, we've sent password reset instructions.</p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">Reset Password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email to receive a reset link.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    data-testid="forgot-email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  data-testid="forgot-submit-button"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-slate-400 hover:text-slate-300 inline-flex items-center gap-1">
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
