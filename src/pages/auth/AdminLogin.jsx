import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ShieldCheck,
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import AuthShell from "../../components/layout/AuthShell";
import { useLoginMutation } from "../../hooks/useAuth";

const DarkInput = ({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  showToggle,
  type = "text",
  autoFocus,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
            focused ? "text-cyan-400" : "text-slate-500"
          }`}
        >
          <Icon size={15} />
        </div>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 text-sm text-white bg-slate-950/40 border rounded-xl outline-none transition-all duration-300 placeholder:text-slate-500 ${
            focused
              ? "border-cyan-400/60 ring-2 ring-cyan-400/20 bg-slate-950/60"
              : "border-white/10 hover:border-white/20"
          }`}
          {...rest}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        userId: userId.trim(),
        password,
      });

      const token = response?.data?.token ?? response?.token;
      const user = response?.data?.user ?? response?.user;

      if (!token) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      login(token, "admin", user);
      navigate("/adminDash");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid credentials. Please try again.",
      );
    }
  };

  const submitting = loginMutation.isPending;

  return (
    <AuthShell
      icon={ShieldCheck}
      roleLabel="Admin"
      title="Welcome back"
      subtitle="Sign in to access your EV business dashboard."
      bullets={[
        "Approve and manage dealer accounts",
        "Track orders, billing & dispatch",
        "Register vehicles across the network",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <DarkInput
          icon={User}
          label="User ID"
          placeholder="Enter your user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoFocus
          autoComplete="username"
          required
        />

        <div>
          <DarkInput
            icon={Lock}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showToggle
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-400 text-[11px] bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 animate-shake">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-400 font-bold text-[9px]">!</span>
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group relative w-full py-3 rounded-xl font-bold text-sm text-slate-900 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                Login
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </>
            )}
          </span>
        </button>
      </form>
    </AuthShell>
  );
};

export default AdminLogin;
