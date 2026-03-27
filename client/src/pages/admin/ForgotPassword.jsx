import { useState } from "react";
import { forgotPasswordApi } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPasswordApi({ email });
      setSent(true);
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">📧</div>
        <h2 className="text-xl font-bold text-primary">Check your email</h2>
        <p className="text-gray-500 text-sm mt-2">If that email exists, a reset link was sent.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Your email" required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light font-semibold">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
