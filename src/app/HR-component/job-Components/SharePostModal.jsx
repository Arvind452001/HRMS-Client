
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { SiIndeed } from "react-icons/si";

import { useState } from "react";
import { Briefcase, X } from "lucide-react";

export default function SharePostModal({ isOpen, onClose, shareUrl }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Share This Post
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Icons */}
        <div className="mt-6 flex justify-center gap-5">
          
          <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-90">
            <FaLinkedinIn size={16} />
          </div>

          <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition">
            <FaInstagram size={16} />
          </div>

          <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#2E6EB5] text-white hover:opacity-90">
            <Briefcase size={16} />
          </div>

          <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#003A9B] text-white hover:opacity-90">
            <SiIndeed size={16} />
          </div>
        </div>

        {/* Copy Link Section (Added) */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full rounded-md border px-2 py-1 text-xs text-gray-600"
            />
            <button
              onClick={handleCopy}
              className="rounded-md bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Button */}
        <div className="mt-6 flex justify-center">
          <button className="w-28 rounded-md bg-sky-600 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}