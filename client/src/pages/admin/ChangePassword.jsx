import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { changePasswordApi } from "../../api/auth.api";
import AdminNavbar from "../../components/AdminNavbar";
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

export default function ChangePassword() {
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({ mode: "onBlur" });
  const newPassword = watch("newPassword");

  const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const onSubmit = async ({ oldPassword, newPassword }) => {
    try {
      await changePasswordApi({ oldPassword, newPassword });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const inputClass = (err) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all pr-11 ${
      err ? "border-red-400 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-primary/30 focus:border-primary"
    }`;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary mb-5 transition-colors">
            ← Back to Dashboard
          </Link>

          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-2xl">🔐</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Change Password</h1>
          <p className="text-gray-400 text-sm mb-7">Enter your current password then set a new one.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Current password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input type={show.old ? "text" : "password"} placeholder="Your current password"
                  className={inputClass(errors.oldPassword)}
                  {...register("oldPassword", { required: "Current password is required" })}
                />
                <button type="button" onClick={() => toggle("old")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon open={show.old} />
                </button>
              </div>
              {errors.oldPassword && <p className="mt-1 text-xs text-red-500">⚠ {errors.oldPassword.message}</p>}
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input type={show.new ? "text" : "password"} placeholder="Min 8 characters"
                  className={inputClass(errors.newPassword)}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "At least 8 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                      message: "Must include uppercase, lowercase, number & special character",
                    },
                  })}
                />
                <button type="button" onClick={() => toggle("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon open={show.new} />
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-xs text-red-500">⚠ {errors.newPassword.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input type={show.confirm ? "text" : "password"} placeholder="Repeat new password"
                  className={inputClass(errors.confirm)}
                  {...register("confirm", {
                    required: "Please confirm your password",
                    validate: v => v === newPassword || "Passwords do not match",
                  })}
                />
                <button type="button" onClick={() => toggle("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon open={show.confirm} />
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-red-500">⚠ {errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-light transition-all disabled:opacity-60 active:scale-[0.98] shadow-sm shadow-primary/30 mt-2">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating...
                </span>
              ) : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
