import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../api/auth.api";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordApi({ email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-primary mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            If an account exists for <span className="font-medium text-gray-700">{email}</span>, a reset link has been sent.
          </p>
          <Link to="/login" className="text-primary text-sm hover:underline">← Back to login</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
          <h1 className="text-xl font-bold text-primary mb-1">Forgot Password</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required placeholder="you@campus.edu"
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light font-semibold disabled:opacity-60 transition-colors">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            <Link to="/login" className="hover:underline">← Back to login</Link>
          </p>
        </div>
      </div>
    </>
  );
}
