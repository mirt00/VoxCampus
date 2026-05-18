import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { registerApi } from "../../api/auth.api";
import toast from "react-hot-toast";

const FACULTIES = ["BCA", "CSIT", "BBM", "BBA", "B.Ed"];

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special", ok: /[@$!%*?&]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score-1] : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map(c => (
          <span key={c.label} className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${c.ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {c.ok ? "✓" : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function Auth() {
  const { login, setUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/feed";
  const [tab, setTab] = useState("login");

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", faculty: "", phone: "" },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const password = watch("password");

  if (!authLoading && user) return <Navigate to="/feed" replace />;

  // ── Login handler ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register handler ──
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: res } = await registerApi(data);
      setUser(res.user);
      toast.success("Welcome to VoxCampus!");
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
      hasError ? "border-red-400 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-primary/30 focus:border-primary bg-white"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex w-5/12 flex-col items-center justify-center p-12 text-white relative overflow-hidden bg-gradient-to-br from-gray-950 via-primary-dark to-gray-950">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg border-2 border-white/80 flex items-center justify-center overflow-hidden mx-auto mb-6">
            <img src="/onlylogo.png" alt="KSC" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-white via-blue-200 to-accent bg-clip-text text-transparent">
            VoxCampus
          </h1>
          <p className="text-blue-200/70 text-lg max-w-xs mx-auto leading-relaxed">
            Your voice shapes our campus. Share suggestions, vote on ideas, and watch change happen.
          </p>
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {["Submit suggestions anonymously or with your name", "Vote on ideas you care about", "Track progress as campus acts on feedback"].map((t) => (
              <div key={t} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
                <span className="text-accent mt-0.5">✓</span>
                <span className="text-sm text-blue-100/80">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-white shadow border-2 border-white/80 flex items-center justify-center overflow-hidden mx-auto mb-4">
              <img src="/onlylogo.png" alt="KSC" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary">VoxCampus</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab("register")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* ── LOGIN TAB ── */}
            {tab === "login" && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-8">Login to post or vote on suggestions.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required placeholder="you@campus.edu"
                      className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required placeholder="••••••••"
                      className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors font-semibold disabled:opacity-60">
                    {loginLoading ? "Logging in..." : "Login"}
                  </button>
                </form>
              </>
            )}

            {/* ── REGISTER TAB ── */}
            {tab === "register" && (
              <>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create Account</h2>
                <p className="text-gray-400 text-sm mb-7">Join your campus community today.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" placeholder="e.g. Amrit Thapa"
                      className={inputClass(errors.name)}
                      {...register("name", {
                        required: "Full name is required",
                        minLength: { value: 3, message: "At least 3 characters" },
                        pattern: { value: /^[a-zA-Z\s]+$/, message: "Only alphabets allowed" },
                      })}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">⚠ {errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input type="email" placeholder="you@campus.edu"
                      className={inputClass(errors.email)}
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                      })}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">⚠ {errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters"
                        className={`${inputClass(errors.password)} pr-11`}
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 8, message: "At least 8 characters" },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                            message: "Must include uppercase, lowercase, number & special character",
                          },
                        })}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-500">⚠ {errors.password.message}</p>}
                    <PasswordStrength password={password} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Faculty <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select className={`${inputClass(errors.faculty)} appearance-none cursor-pointer pr-10`}
                          {...register("faculty", { required: "Please select your faculty" })}>
                          <option value="">Select faculty</option>
                          {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.faculty && <p className="mt-1 text-xs text-red-500">⚠ {errors.faculty.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <input type="tel" placeholder="98XXXXXXXX"
                        className={inputClass(errors.phone)}
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: { value: /^\d{10}$/, message: "Must be exactly 10 digits" },
                        })}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">⚠ {errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    You can post suggestions anonymously — your name is never shown unless you choose to.
                  </div>

                  <button type="submit" disabled={!isValid || submitting}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm
                               hover:bg-primary-light transition-all disabled:opacity-40 disabled:cursor-not-allowed
                               active:scale-[0.98] shadow-sm shadow-primary/30">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : "Create Account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
