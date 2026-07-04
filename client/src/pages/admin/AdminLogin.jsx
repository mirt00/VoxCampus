import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

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

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: "onBlur" });

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-primary-dark to-gray-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* College logo circle */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg border-2 border-white/80 flex items-center justify-center overflow-hidden">
            <img
              src="/onlylogo.png"
              alt="College Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Glassmorphism card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-1">VoxCampus</h1>
            <p className="text-sm text-blue-200/60">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
              <input type="email" placeholder="admin@campus.edu"
                className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? "border-red-400 focus:ring-red-200 bg-red-500/10" : "focus:ring-primary/30 focus:border-primary/50"
                }`}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">⚠ {errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-300">Password</label>
                <Link to="/admin/forgot-password" className="text-xs text-blue-300 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Your password"
                  className={`w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all pr-11 ${
                    errors.password ? "border-red-400 focus:ring-red-200 bg-red-500/10" : "focus:ring-primary/30 focus:border-primary/50"
                  }`}
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">⚠ {errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-accent text-gray-950 py-3 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-all disabled:opacity-60 active:scale-[0.98] shadow-lg shadow-accent/25 mt-2">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Not an admin?{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
