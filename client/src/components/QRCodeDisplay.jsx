import { useRef, useCallback, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

const LOGO_PATH = "/onlylogo.png";

export default function QRCodeDisplay({ url, fgColor = "#1e3a5f", bgColor = "#ffffff", includeLogo = true }) {
  const containerRef = useRef(null);
  const [logoSrc, setLogoSrc] = useState(includeLogo ? LOGO_PATH : null);

  useEffect(() => {
    if (!includeLogo) return;
    fetch(LOGO_PATH)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoSrc(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, [includeLogo]);

  const getCanvas = useCallback(() => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector("canvas");
  }, []);

  const getCanvasDataUrl = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return null;
    try {
      return canvas.toDataURL("image/png");
    } catch {
      toast.error("Could not read QR code. Try reloading.");
      return null;
    }
  }, [getCanvas]);

  const SCALE = 3;

  const getHighResDataUrl = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return null;
    try {
      const big = document.createElement("canvas");
      big.width = canvas.width * SCALE;
      big.height = canvas.height * SCALE;
      const ctx = big.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, big.width, big.height);
      return big.toDataURL("image/png");
    } catch {
      return getCanvasDataUrl();
    }
  }, [getCanvas, getCanvasDataUrl]);

  const downloadPNG = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const scale = 3;
    const cw = canvas.width;
    const ch = canvas.height;
    const padding = 30 * scale;
    const canvasOut = document.createElement("canvas");
    canvasOut.width = cw * scale + padding * 2;
    canvasOut.height = ch * scale + padding * 2 + 40 * scale;

    const ctx = canvasOut.getContext("2d");
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasOut.width, canvasOut.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, cw * scale, ch * scale, padding, padding + 20 * scale, cw * scale, ch * scale);

    ctx.fillStyle = fgColor;
    ctx.font = `bold ${14 * scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("Scan to submit a suggestion", canvasOut.width / 2, 18 * scale);

    try {
      const link = document.createElement("a");
      link.download = "voxcampus-qr.png";
      link.href = canvasOut.toDataURL("image/png");
      link.click();
      toast.success("QR code downloaded");
    } catch {
      toast.error("Download failed. Try using Print instead.");
    }
  }, [fgColor, bgColor, getCanvas]);

  const openPrintWindow = useCallback(() => {
    const dataUrl = getHighResDataUrl();
    if (!dataUrl) return;
    const win = window.open("", "_blank", "width=800,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Code</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            display: flex; align-items: center; justify-content: center;
            background: #e5e7eb; min-height: 100vh; padding: 24px;
          }
          .paper {
            width: 210mm; min-height: 297mm; background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 40px;
          }
          img { width: 70%; max-width: 500px; height: auto; }
          @media print {
            body { background: none; padding: 0; }
            .paper { box-shadow: none; width: 100%; min-height: 100vh; padding: 20px; }
            img { width: 60%; }
          }
        </style>
      </head>
      <body>
        <div class="paper">
          <img src="${dataUrl}" alt="QR Code" />
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); };
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  }, [getHighResDataUrl]);

  if (!url) return <p className="text-gray-400">Loading QR code...</p>;

  return (
    <div className="text-center">
      <div ref={containerRef} className="inline-block p-4 bg-white border rounded-xl shadow-sm print:shadow-none relative">
        <QRCodeCanvas
          value={url}
          size={280}
          fgColor={fgColor}
          bgColor={bgColor}
          imageSettings={
            includeLogo && logoSrc
              ? { src: logoSrc, x: undefined, y: undefined, height: 56, width: 56, excavate: true }
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
          onClick={openPrintWindow}
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
