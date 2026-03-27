import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPasswordApi(token, { password });
      toast.success("Password reset! Please login.");
      navigate("/admin/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="New password" required minLength={6}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light font-semibold">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
