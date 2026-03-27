import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
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

  const saveName = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setSavingName(true);
    try {
      const { data } = await api.patch("/auth/profile", { name: name.trim() });
      setUser(data);
      setEditingName(false);
      toast.success("Name updated");
    } catch { toast.error("Failed to update name"); }
    finally { setSavingName(false); }
  };

  if (!user) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-md mx-auto">

          {/* Back button */}
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            ← Back to Feed
          </Link>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-xl font-bold text-primary mb-6">Your Profile</h1>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="relative">
                <Avatar user={user} size="lg" />
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer bg-primary text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-light transition-colors">
                  {user.avatar ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                </label>
                {user.avatar && (
                  <button onClick={removeAvatar}
                    className="border border-red-300 text-red-500 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition-colors">
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">Optional · Max 2MB · JPG, PNG · Auto-saves on upload</p>
            </div>

            {/* Info fields */}
            <div className="space-y-4 text-sm">

              {/* Name — editable */}
              <div className="border rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Name</p>
                {editingName ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <button onClick={saveName} disabled={savingName}
                      className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-light disabled:opacity-60">
                      {savingName ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditingName(false); setName(user.name); }}
                      className="text-gray-400 text-xs hover:text-gray-600 px-2">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{user.name}</span>
                    <button onClick={() => setEditingName(true)}
                      className="text-xs text-primary hover:underline">
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email — read only */}
              <div className="border rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <span className="font-medium text-gray-800">{user.email}</span>
              </div>

              {/* Role — read only */}
              <div className="border rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Role</p>
                <span className="capitalize font-medium text-gray-800">{user.role}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <Link to="/change-password"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
                🔒 Change Password
              </Link>
              <Link to="/"
                className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
