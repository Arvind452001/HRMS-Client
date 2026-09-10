import React from "react";
import BaseModal from "../../../components/BaseModal";
import { Download } from "lucide-react";

// Cloudinary URLs for PDFs (resource_type "raw") don't get a helpful
// extension by default in some upload configs, so fall back to the stored
// original filename to decide how to render the preview.
const isPdf = (candidate) => {
  const name = (candidate?.resumeFileName || candidate?.resumeUrl || "").toLowerCase();
  return name.endsWith(".pdf");
};

const isImage = (candidate) => {
  const name = (candidate?.resumeFileName || candidate?.resumeUrl || "").toLowerCase();
  return [".jpg", ".jpeg", ".png"].some((ext) => name.endsWith(ext));
};

export default function ResumePreviewModal({ candidate, onClose }) {
  if (!candidate) return null;

  const hasResume = Boolean(candidate.resumeUrl);
  const pdf = isPdf(candidate);
  const image = isImage(candidate);

  return (
    <BaseModal
      title={`${candidate.fullName || "Candidate"}'s Resume`}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button className="btn btn-outline btn-sm sm:btn-md" onClick={onClose}>
            Close
          </button>
          {hasResume && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn btn-primary btn-sm sm:btn-md gap-2"
            >
              <Download size={16} />
              Download
            </a>
          )}
        </>
      }
    >
      <div className="w-full h-[70vh] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        {!hasResume ? (
          <p className="text-sm text-gray-500">No resume/CV has been uploaded for this candidate.</p>
        ) : pdf ? (
          <iframe
            src={candidate.resumeUrl}
            title="Resume Preview"
            className="w-full h-full"
          />
        ) : image ? (
          <img
            src={candidate.resumeUrl}
            alt={`${candidate.fullName}'s resume`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          // Unknown file type — still try an iframe, most browsers/Cloudinary
          // will render PDFs even without a matching extension.
          <iframe
            src={candidate.resumeUrl}
            title="Resume Preview"
            className="w-full h-full"
          />
        )}
      </div>
    </BaseModal>
  );
}
