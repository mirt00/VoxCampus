import AdminNavbar from "../../components/AdminNavbar";
import QRCodeDisplay from "../../components/QRCodeDisplay";

export default function QRPage() {
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-primary mb-2">Campus QR Code</h1>
          <p className="text-gray-500 text-sm mb-6">
            Print and place around campus. Scanning opens the suggestion form directly.
          </p>
          <QRCodeDisplay />
        </div>
      </div>
    </>
  );
}
