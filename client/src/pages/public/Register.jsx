import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerApi } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
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

export default function Register() {
  const { setUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", faculty: "", phone: "" },
  });

  const password = watch("password");

  // Already logged in
  if (!authLoading && user) return <Navigate to="/feed" replace />;

  const inputClass = (hasError) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
      hasError ? "border-red-400 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-primary/30 focus:border-primary bg-white"
    }`;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: res } = await registerApi(data);
      setUser(res.user);
      toast.success("🎉 Welcome to VoxCampus!", { duration: 3000 });
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-primary to-primary-light flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*130}px`, height: `${(i+1)*130}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="text-7xl mb-5">🎓</div>
          <h1 className="text-4xl font-extrabold mb-3">VoxCampus</h1>
          <p className="text-blue-200 text-lg max-w-xs leading-relaxed">
            Your voice shapes our campus. Join and make a difference.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {[
              "Post suggestions anonymously or with your name",
              "Vote on ideas that matter to you",
              "Track campus action on your feedback",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                <span className="text-accent text-lg">✓</span>
                <span className="text-sm text-blue-100">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🎓</span>
            <h1 className="text-2xl font-extrabold text-primary mt-2">VoxCampus</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-400 text-sm mb-7">Join your campus community today.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              {/* Full Name */}
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

              {/* Email */}
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

              {/* Password */}
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

              {/* Faculty + Phone — side by side on sm+ */}
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
                💡 You can post suggestions anonymously — your name is never shown unless you choose to.
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

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link to="/" className="text-primary font-semibold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
