import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import api from "../../api/axiosInstance";

export default function QRPage() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    api.get("/qr/url").then((r) => setBaseUrl(r.data.url)).catch(() => {});
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-sm w-full">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-primary mb-6">Campus QR Code</h1>

          <QRCodeDisplay url={baseUrl} includeLogo={true} />
        </div>
      </div>
    </>
  );
}
