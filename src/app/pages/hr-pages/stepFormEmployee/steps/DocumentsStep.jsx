import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FileText, UploadCloud, Eye } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";
import DocumentModal from "../../../../HR-component/model/DocumentModal";

const DOCS = [
  {
    key: "aadharCard",
    label: "Aadhar Card",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
  },
  {
    key: "panCard",
    label: "PAN Card",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
  },
  {
    key: "resume",
    label: "Resume",
    hint: "PDF only",
    accept: ".pdf",
  },
  {
    key: "education",
    label: "Education Certificates",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
  },
  {
    key: "experience",
    label: "Experience Letters",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
  },
  {
    key: "offerLetter",
    label: "Offer Letter",
    hint: "PDF only",
    accept: ".pdf",
  },
];

function DocumentField({ doc }) {
  const { register, control } = useFormContext();
  const { isView } = useFormMode();
  const fileValue = useWatch({ name: `documents.${doc.key}`, control });
  const [previewOpen, setPreviewOpen] = useState(false);

  // Existing uploaded document (edit/view prefill) comes in as a URL string,
  // a newly picked file comes in as a FileList from the file input
  const existingUrl = typeof fileValue === "string" && fileValue ? fileValue : null;
  const newFileName = !existingUrl && fileValue?.[0]?.name;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">{doc.label}</span>
      </label>

      {existingUrl && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPreviewOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setPreviewOpen(true);
            }
          }}
          className="mb-2 flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs text-primary hover:bg-primary/5 cursor-pointer w-fit"
        >
          <Eye className="h-3.5 w-3.5" />
          View current file
        </div>
      )}

      {previewOpen && (
        <DocumentModal
          url={existingUrl}
          label={doc.label}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {isView ? (
        !existingUrl && (
          <span className="text-xs text-base-content/40">No file uploaded</span>
        )
      ) : (
        <>
          <label
            htmlFor={`doc-${doc.key}`}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-base-300 bg-base-100 px-3 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UploadCloud className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-base-content">
                {newFileName || (existingUrl ? "Click to replace" : "Click to upload")}
              </span>
              <span className="text-xs text-base-content/40">{doc.hint}</span>
            </span>
          </label>

          <input
            id={`doc-${doc.key}`}
            type="file"
            accept={doc.accept}
            {...register(`documents.${doc.key}`)}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

export default function DocumentsStep() {
  const { mode } = useFormMode();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Documents</h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Upload the required documents for verification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DOCS.map((doc) => (
          <DocumentField key={doc.key} doc={doc} />
        ))}
      </div>
    </div>
  );
}
