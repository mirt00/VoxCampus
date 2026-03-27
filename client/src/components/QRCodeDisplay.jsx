import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axiosInstance";

export default function QRCodeDisplay() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    api.get("/qr/url").then((r) => setUrl(r.data.url));
  }, []);

  if (!url) return <p className="text-gray-400">Loading QR code...</p>;

  return (
    <div className="text-center">
      <div className="inline-block p-4 bg-white border rounded-xl shadow-sm print:shadow-none">
        <QRCodeSVG value={url} size={256} fgColor="#1e3a5f" />
      </div>
      <p className="text-xs text-gray-400 mt-3 break-all">{url}</p>
      <button
        onClick={() => window.print()}
        className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary-light transition-colors print:hidden"
      >
        Print QR Code
      </button>
    </div>
  );
}
