import { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

const LOGO = "/onlylogo.png";

export default function QRCodeDisplay({ url, fgColor = "#1e3a5f", bgColor = "#ffffff", includeLogo = true }) {
  const canvasRef = useRef(null);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 30;
    const logoSize = 60;
    const canvasOut = document.createElement("canvas");
    canvasOut.width = canvas.width + padding * 2;
    canvasOut.height = canvas.height + padding * 2 + 40;

    const ctx = canvasOut.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasOut.width, canvasOut.height);

    ctx.drawImage(canvas, padding, padding + 20);

    ctx.fillStyle = fgColor;
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Scan to submit a suggestion", canvasOut.width / 2, 18);

    const link = document.createElement("a");
    link.download = "voxcampus-qr.png";
    link.href = canvasOut.toDataURL("image/png");
    link.click();
    toast.success("QR code downloaded");
  }, [fgColor, bgColor]);

  if (!url) return <p className="text-gray-400">Loading QR code...</p>;

  return (
    <div className="text-center">
      <div className="inline-block p-4 bg-white border rounded-xl shadow-sm print:shadow-none relative">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={280}
          fgColor={fgColor}
          bgColor={bgColor}
          imageSettings={
            includeLogo
              ? { src: LOGO, x: undefined, y: undefined, height: 56, width: 56, excavate: true }
              : undefined
          }
          level="H"
        />
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 print:hidden">
        <button
          onClick={downloadPNG}
          className="bg-primary text-white px-5 py-2 rounded-lg text-sm hover:bg-primary-light transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PNG
        </button>
        <button
          onClick={() => window.print()}
          className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print
        </button>
      </div>
    </div>
  );
}
