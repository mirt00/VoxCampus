import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPasswordApi } from "../../api/auth.api";
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

export default function AdminResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState({ new: false, confirm: false });
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ mode: "onBlur" });
  const password = watch("password");

  const onSubmit = async ({ password, confirm }) => {
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    try {
      await resetPasswordApi(token, { password });
      toast.success("Password reset! Please login.");
      navigate("/admin/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Link may have expired.");
    }
  };

  const inputClass = (err) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all pr-11 ${
      err ? "border-red-400 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-primary/30 focus:border-primary"
    }`;

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

        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-2xl">🔒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Set New Password</h1>
        <p className="text-gray-400 text-sm mb-7">Choose a strong password for your admin account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input type={show.new ? "text" : "password"} placeholder="Min 8 characters"
                className={inputClass(errors.password)}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message: "Must include uppercase, lowercase, number & special character",
                  },
                })}
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon open={show.new} />
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">⚠ {errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <input type={show.confirm ? "text" : "password"} placeholder="Repeat new password"
                className={inputClass(errors.confirm)}
                {...register("confirm", {
                  required: "Please confirm your password",
                  validate: v => v === password || "Passwords do not match",
                })}
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon open={show.confirm} />
              </button>
            </div>
            {errors.confirm && <p className="mt-1 text-xs text-red-500">⚠ {errors.confirm.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-light transition-all disabled:opacity-60 active:scale-[0.98] shadow-sm shadow-primary/30">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Resetting...
              </span>
            ) : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link to="/admin/login" className="hover:text-primary transition-colors">← Back to admin login</Link>
        </p>
      </div>
    </div>
  );
}
