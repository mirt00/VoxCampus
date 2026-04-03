import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const FACULTIES = ["BCA", "CSIT", "BBM", "BBA", "BBS", "+2", "B.Ed"];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    faculty: user?.faculty || "",
    phone: user?.phone || "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      toast.success("Profile photo updated");
    } catch { toast.error("Failed to update photo"); }
    finally { setUploading(false); }
  };

  const removeAvatar = async () => {
    try {
      const { data } = await api.patch("/auth/avatar", { avatar: null });
      setUser(data);
      toast.success("Photo removed");
    } catch { toast.error("Failed to remove photo"); }
  };

  const saveProfile = async () => {
    if (!form.name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", form);
      setUser(data);
      setEditing(false);
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (!user) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to view your profile.</p>
          <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Login</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            ← Back to Feed
          </Link>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header banner */}
            <div className="h-20 bg-gradient-to-r from-primary to-primary-light" />

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-primary flex items-center justify-center shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <span className="text-white text-xs">...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <label className="cursor-pointer bg-primary text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-light transition-colors">
                    {user.avatar ? "Change" : "Upload Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                  </label>
                  {user.avatar && (
                    <button onClick={removeAvatar} className="border border-red-300 text-red-500 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name + role */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <span className="text-xs capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.role}</span>
              </div>

              {/* Fields */}
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.name} onChange={set("name")} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Faculty</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.faculty} onChange={set("faculty")}>
                      <option value="">Select faculty</option>
                      {FACULTIES.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input type="tel" placeholder="e.g. 98XXXXXXXX"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.phone} onChange={set("phone")} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveProfile} disabled={saving}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-60">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Email", value: user.email },
                    { label: "Faculty", value: user.faculty || "—" },
                    { label: "Phone", value: user.phone || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">{value}</span>
                    </div>
                  ))}
                  <button onClick={() => setEditing(true)}
                    className="w-full mt-3 border border-primary text-primary py-2 rounded-lg text-sm hover:bg-primary/5 transition-colors font-medium">
                    ✏️ Edit Profile
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <Link to="/change-password"
                  className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
                  🔒 Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
