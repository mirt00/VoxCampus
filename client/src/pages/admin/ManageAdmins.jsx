import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdmins, createAdmin, deactivateAdmin } from "../../api/admin.api";
import AdminNavbar from "../../components/AdminNavbar";
import toast from "react-hot-toast";

export default function ManageAdmins() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });

  const { data: admins = [] } = useQuery({ queryKey: ["admins"], queryFn: () => getAdmins().then((r) => r.data) });

  const { mutate: addAdmin } = useMutation({
    mutationFn: () => createAdmin(form),
    onSuccess: () => { toast.success("Admin created"); qc.invalidateQueries({ queryKey: ["admins"] }); setForm({ name: "", email: "", password: "", role: "admin" }); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: removeAdmin } = useMutation({
    mutationFn: deactivateAdmin,
    onSuccess: () => { toast.success("Admin deactivated"); qc.invalidateQueries({ queryKey: ["admins"] }); },
  });

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-primary">Manage Admins</h1>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Create Admin</h2>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Name" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Email" type="email" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input placeholder="Password" type="password" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <button onClick={() => addAdmin()} className="mt-3 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-light">
              Create Admin
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 text-gray-600">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a._id} className="border-t">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3 capitalize">{a.role}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {a.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.isActive && (
                        <button onClick={() => removeAdmin(a._id)} className="text-red-500 text-xs hover:underline">
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
