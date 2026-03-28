import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { forgotPasswordApi } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function AdminForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: "onBlur" });

  const onSubmit = async ({ email }) => {
    try {
      await forgotPasswordApi({ email });
      setSentEmail(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  if (sent) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📧</div>
        <h2 className="text-xl font-extrabold text-gray-800 mb-2">Check your inbox</h2>
        <p className="text-gray-400 text-sm mb-1">Reset link sent to</p>
        <p className="font-semibold text-primary mb-6">{sentEmail}</p>
        <p className="text-xs text-gray-400 mb-6">
          Click the link in the email to reset your password. The link expires in 1 hour.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setSent(false)}
            className="w-full border-2 border-primary text-primary py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors">
            Try another email
          </button>
          <Link to="/admin/login"
            className="w-full text-center text-sm text-gray-400 hover:text-primary transition-colors py-2">
            ← Back to admin login
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">V</div>
          <div>
            <p className="font-bold text-gray-800 text-sm">VoxCampus</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>

        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-2xl">🔑</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot Password?</h1>
        <p className="text-gray-400 text-sm mb-7">
          Enter your admin email and we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
            <input type="email" placeholder="admin@campus.edu"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.email ? "border-red-400 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-primary/30 focus:border-primary"
              }`}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">⚠ {errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-light transition-all disabled:opacity-60 active:scale-[0.98] shadow-sm shadow-primary/30">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Sending...
              </span>
            ) : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link to="/admin/login" className="hover:text-primary transition-colors">← Back to admin login</Link>
        </p>
      </div>
    </div>
  );
}
