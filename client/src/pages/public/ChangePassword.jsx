import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordApi } from "../../api/auth.api";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await changePasswordApi({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      toast.success("Password changed successfully");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
          <h1 className="text-xl font-bold text-primary mb-1">Change Password</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your current password then set a new one.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" required placeholder="••••••••"
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required placeholder="Min 6 characters"
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" required placeholder="Repeat new password"
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light font-semibold disabled:opacity-60 transition-colors">
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
