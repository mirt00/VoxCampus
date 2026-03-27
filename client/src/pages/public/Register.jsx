import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      setUser(data.user);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center p-12 text-white">
        <div className="text-6xl mb-6">🎓</div>
        <h1 className="text-4xl font-bold mb-3">VoxCampus</h1>
        <p className="text-blue-200 text-center text-lg max-w-sm">
          Join your campus community. Your feedback drives real change.
        </p>
        <div className="mt-10 bg-white/10 rounded-xl p-6 w-full max-w-xs">
          <p className="text-sm text-blue-100 italic">
            "The new library seating was added after students suggested it here. VoxCampus works."
          </p>
          <p className="text-xs text-blue-300 mt-3">— Student, Batch 2024</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">🎓</span>
            <h1 className="text-2xl font-bold text-primary mt-2">VoxCampus</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create an account</h2>
          <p className="text-gray-500 text-sm mb-8">Sign up to post with your identity or stay anonymous — your choice.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required placeholder="Your name"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required placeholder="you@campus.edu"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required placeholder="Min 6 characters" minLength={6}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              💡 After signing up, you can choose to post suggestions anonymously — your name will never be shown unless you allow it.
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors font-semibold disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            <Link to="/" className="hover:underline">← Back to feed</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
