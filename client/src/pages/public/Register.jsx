import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const FACULTIES = [
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Arts",
  "Faculty of Management",
  "Faculty of Education",
  "Faculty of Law",
  "Faculty of Medicine",
  "Faculty of Agriculture",
  "Other",
];

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    faculty: "", department: "", studentId: "", phone: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center p-12 text-white">
        <div className="text-6xl mb-6">🎓</div>
        <h1 className="text-4xl font-bold mb-3">VoxCampus</h1>
        <p className="text-blue-200 text-center text-lg max-w-sm">
          Join your campus community. Your feedback drives real change.
        </p>
        <div className="mt-10 bg-white/10 rounded-xl p-6 w-full max-w-xs">
          <p className="text-sm text-blue-100 italic">
            "The new library seating was added after students suggested it here."
          </p>
          <p className="text-xs text-blue-300 mt-3">— Student, Batch 2024</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6">
            <span className="text-4xl">🎓</span>
            <h1 className="text-2xl font-bold text-primary mt-2">VoxCampus</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create an account</h2>
          <p className="text-gray-500 text-sm mb-6">Sign up to post with your identity or stay anonymous.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
                <input type="text" required placeholder="Your full name"
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.name} onChange={set("name")} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
                <input type="email" required placeholder="you@campus.edu"
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.email} onChange={set("email")} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-400">*</span></label>
                <input type="password" required placeholder="Min 6 characters" minLength={6}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.password} onChange={set("password")} />
              </div>
            </div>

            {/* Optional details */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Additional Details (optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                  <select className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.faculty} onChange={set("faculty")}>
                    <option value="">Select faculty</option>
                    {FACULTIES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input type="text" placeholder="e.g. Computer Science"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.department} onChange={set("department")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input type="text" placeholder="e.g. 2021-CS-001"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.studentId} onChange={set("studentId")} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" placeholder="e.g. 98XXXXXXXX"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.phone} onChange={set("phone")} />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              💡 You can post suggestions anonymously — your name will never be shown unless you allow it.
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors font-semibold disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
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
