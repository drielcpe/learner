"use client";

import { useState } from "react";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

export default function ScanPage() {
  const [result, setResult] = useState("");

  const startScan = async () => {
    const perm = await BarcodeScanner.requestPermissions();

    if (perm.camera !== "granted") {
      alert("Camera permission denied");
      return;
    }

    const { barcodes } = await BarcodeScanner.scan();

    if (barcodes.length > 0) {
      setResult(barcodes[0].rawValue || "");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={startScan}
        className="px-6 py-3 bg-black text-white rounded"
      >
        Scan QR
      </button>

      {result && (
        <p className="mt-4 text-lg font-semibold">Scanned: {result}</p>
      )}
    </div>
  );
}
