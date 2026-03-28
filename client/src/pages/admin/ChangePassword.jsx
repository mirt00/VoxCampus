import { useState } from "react";
import { Link } from "react-router-dom";
import { changePasswordApi } from "../../api/auth.api";
import AdminNavbar from "../../components/AdminNavbar";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePasswordApi(form);
      toast.success("Password changed successfully");
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-5 transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-primary mb-6">Change Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" placeholder="Current password" required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            />
            <input type="password" placeholder="New password" required minLength={6}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light font-semibold">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
