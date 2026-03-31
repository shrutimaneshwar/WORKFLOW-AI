import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, UserPlus, Mail, Lock, User, Activity } from "lucide-react";

function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] auth-bg flex" data-testid="register-page">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#F8FAFC]">WorkflowAI</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-[#F8FAFC] leading-tight mb-4">
            Start optimizing<br />your workflows today
          </h2>
          <p className="text-[#94A3B8] text-base leading-relaxed">
            Join thousands of engineers using AI-powered analysis to find issues, reduce costs, and ship better automations.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-xl font-bold tracking-tight text-[#F8FAFC]">WorkflowAI</span>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-5 tracking-tight">Create your account</h2>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-sm" data-testid="register-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5 uppercase tracking-wide">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    data-testid="register-name-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#020617] border border-[#334155] rounded-md pl-10 pr-4 py-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    data-testid="register-email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#020617] border border-[#334155] rounded-md pl-10 pr-4 py-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    data-testid="register-password-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#020617] border border-[#334155] rounded-md pl-10 pr-4 py-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              </div>

              <button
                data-testid="register-submit-button"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-[#94A3B8]">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors" data-testid="go-to-login">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
