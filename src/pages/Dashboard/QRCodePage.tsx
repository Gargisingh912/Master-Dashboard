import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../hooks/useAuth";

const QRCodePage: React.FC = () => {
  const { org } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);

  if (!org?.id) {
    return <p style={{ padding: 24, color: "#7B9EC4" }}>Loading organization info...</p>;
  }

  const orderUrl = `${window.location.origin}/order/${org.id}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${org.name || "menu"}-qr-code.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#F0F6FF" }}>
        Your Menu QR Code
      </h1>
      <p style={{ color: "#7B9EC4", fontSize: 13, marginBottom: 24 }}>
        Print this and place it on tables. Customers scan it to view your menu and place orders directly.
      </p>

      <div
        ref={qrRef}
        style={{ display: "inline-block", padding: 24, background: "#fff", borderRadius: 16 }}
      >
        <QRCodeCanvas value={orderUrl} size={260} level="M" includeMargin />
      </div>

      <p style={{ fontSize: 12, color: "#7B9EC4", marginTop: 16, wordBreak: "break-all" }}>
        {orderUrl}
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <button onClick={handleDownload} style={primaryBtn}>
          Download PNG
        </button>
        <button onClick={handlePrint} style={secondaryBtn}>
          Print
        </button>
      </div>
    </div>
  );
};

const primaryBtn: React.CSSProperties = {
  background: "#818CF8",
  color: "#000",
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "transparent",
  border: "1px solid #1C2B42",
  color: "#7B9EC4",
};

export default QRCodePage;