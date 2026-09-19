import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Printer, Download, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Restaurant } from '../types/menu';

interface TableQrModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export const TableQrModal: React.FC<TableQrModalProps> = ({ restaurant, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Compute public URL - ONE QR CODE PER RESTAURANT: /menu/{restaurantId}
  const publicUrl = `${window.location.origin}/menu/${restaurant.id}`;

  useEffect(() => {
    QRCode.toDataURL(publicUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [publicUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${restaurant.id}-menu-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-stone-900 text-stone-100 rounded-3xl overflow-hidden shadow-2xl z-10 border border-stone-800 my-8">
        {/* Header */}
        <div className="bg-stone-950 p-5 sm:p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Restaurant Table QR Stand
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                One Universal QR Code • Duplicate for All Tables • View-Only
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Concept Banner */}
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-300">Single Universal QR Code:</span>
              Print 50 identical copies of this QR code for all tables in your restaurant. Customers scan with their phone camera to instantly browse your live digital menu with up-to-date pricing and availability.
            </div>
          </div>

          {/* Printable Acrylic Stand Card Preview */}
          <div
            id="printable-qr-stand"
            className="bg-white rounded-2xl p-6 text-center max-w-sm mx-auto shadow-2xl relative border-4 border-amber-500/40 text-stone-900"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-stone-900 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              TABLE STANDEE • SCAN TO BROWSE
            </div>

            <div className="flex flex-col items-center justify-center mb-2">
              {restaurant.logoUrl && (
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-full object-cover mb-1 border border-stone-300"
                />
              )}
              <h3 className="font-display text-lg font-black text-stone-950 leading-tight">
                {restaurant.name}
              </h3>
              <p className="text-[11px] text-stone-600 font-medium italic mt-0.5">
                {restaurant.tagline || 'Authentic Culinary Experience'}
              </p>
            </div>

            {/* QR Graphic Box */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 shadow-inner inline-block my-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Table QR Code" className="w-44 h-44 mx-auto" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-stone-400">
                  Generating QR...
                </div>
              )}
            </div>

            <p className="text-xs font-black text-stone-900 tracking-wide mt-1">
              📱 SCAN WITH PHONE CAMERA
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">
              Instant digital menu • No app download required
            </p>
          </div>

          {/* Public URL Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Public Restaurant Menu URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-amber-300 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Stand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
