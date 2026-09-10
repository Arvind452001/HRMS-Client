import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, X } from "lucide-react";

// Reusable document preview modal (images inline, PDFs embedded, else a download link).
// Rendered via a portal into document.body so it doesn't affect the parent's scroll.
// Props: url (file to preview), label (modal title), onClose.
export default function DocumentModal({ url, label = "Document", onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // PDFs served from a different origin (e.g. Cloudinary) don't reliably
  // fire iframe onLoad/onError — some browsers just render a blank page
  // silently instead of erroring, which is what made the preview look
  // like it "never loads". If the direct src hasn't finished loading
  // within a few seconds, fall back to Google's PDF viewer, which is far
  // more consistent at rendering PDFs inside an iframe.
  const [useViewerFallback, setUseViewerFallback] = useState(false);
  const loadTimeoutRef = useRef(null);

  const cleanUrl = url ? url.split("?")[0] : "";
  const isPdf = /\.pdf$/i.test(cleanUrl);
  const isImage = /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(cleanUrl);
  const isPreviewable = isImage || isPdf;

  const pdfViewerSrc = useViewerFallback
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url || "")}&embedded=true`
    : url;

  // Lock background scroll while the modal is open, and always restore it
  // on close/unmount — keeps the underlying form exactly where it was.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Resetting preview state when `url` changes is intentional here, not
  // derived render state; it also kicks off/clears the fallback timer below.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(isPreviewable);
    setFailed(false);
    setUseViewerFallback(false);
    clearTimeout(loadTimeoutRef.current);

    if (isPdf) {
      loadTimeoutRef.current = setTimeout(() => {
        setUseViewerFallback(true);
      }, 3500);
    }

    return () => clearTimeout(loadTimeoutRef.current);
  }, [url, isPreviewable, isPdf]);

  const handlePdfLoad = () => {
    clearTimeout(loadTimeoutRef.current);
    setIsLoading(false);
  };

  if (!url) return null;

  const modal = (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl w-full p-0 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-base-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4.5 w-4.5" />
            </span>
            <h3 className="font-semibold text-base truncate">{label}</h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn btn-ghost btn-sm gap-1.5"
              title="Download"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PREVIEW BODY */}
        <div className="relative bg-base-200/40 flex items-center justify-center min-h-[60vh] max-h-[75vh] overflow-auto p-4">
          {/* Loading spinner — shown until the preview has actually loaded */}
          {isLoading && !failed && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200/40 z-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}

          {isImage && !failed ? (
            <img
              src={url}
              alt={label}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setFailed(true);
              }}
              className={`max-w-full max-h-[68vh] object-contain rounded-lg shadow-sm transition-opacity ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          ) : isPdf && !failed ? (
            <iframe
              key={useViewerFallback ? "viewer-fallback" : "direct"}
              src={pdfViewerSrc}
              title={label}
              onLoad={handlePdfLoad}
              onError={() => {
                setIsLoading(false);
                setFailed(true);
              }}
              className={`w-full h-[68vh] rounded-lg bg-white transition-opacity ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-base-content/30" />
              <p className="text-sm text-base-content/60">
                {failed
                  ? "Couldn't load a preview for this file."
                  : "Preview isn't available for this file type."}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm gap-1.5"
              >
                <Download className="h-4 w-4" />
                Open / Download File
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );

  return createPortal(modal, document.body);
}
