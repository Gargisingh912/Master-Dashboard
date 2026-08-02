import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../hooks/useAuth";
import { uuidToBase62 } from "../../utils/helpers";
import { QrCode, X, Download, Share2 } from "lucide-react";

export default function QrKpiWidget() {
  const { org } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!org?.id) return null;

  const slug = (org.name || "menu").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const shortId = uuidToBase62(org.id);
  const orderUrl = `${window.location.origin}/order/${slug}/${shortId}`;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${org.name || "menu"}-qr-code.png`;
    link.click();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${org.name} Menu`,
          text: `Check out the menu for ${org.name} and place your order!`,
          url: orderUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(orderUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      {/* Widget View */}
      <div 
        onClick={() => setIsFullscreen(true)}
        className="bento-glass p-6 cursor-pointer group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <QrCode size={80} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-400 text-white rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <QrCode size={24} />
          </div>
          
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Table Ordering
          </h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
            QR Menu
          </p>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            Tap to view, download, or share your QR Code
          </p>
        </div>
      </div>

      {/* Fullscreen Overlay View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          />
          
          <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100/50 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">
                Your Table QR Code
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customers can scan this to view your menu and place orders.
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div 
                ref={qrRef}
                className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100"
              >
                <QRCodeCanvas value={orderUrl} size={220} level="M" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors shadow-lg shadow-brand-500/30"
              >
                <Download size={18} />
                Download
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors shadow-lg border border-gray-200/50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
            
            <p className="text-center text-[10px] text-gray-400 mt-6 break-all px-4">
              {orderUrl}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
