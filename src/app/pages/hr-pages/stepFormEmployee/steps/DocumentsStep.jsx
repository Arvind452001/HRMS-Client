import React, { useState, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FileText, UploadCloud, Eye, AlertCircle } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";
import DocumentModal from "../../../../HR-component/model/DocumentModal";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "../formConstants";

const DOCS = [
  {
    key: "aadharCard",
    label: "Aadhar Card",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
    allowedTypesText: "PDF, JPG, PNG",
  },
  {
    key: "panCard",
    label: "PAN Card",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
    allowedTypesText: "PDF, JPG, PNG",
  },
  {
    key: "resume",
    label: "Resume",
    hint: "PDF only",
    accept: ".pdf",
    allowedTypesText: "PDF only",
  },
  {
    key: "education",
    label: "Education Certificates",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
    allowedTypesText: "PDF, JPG, PNG",
  },
  {
    key: "experience",
    label: "Experience Letters",
    hint: "Image or PDF",
    accept: "image/*,.pdf",
    allowedTypesText: "PDF, JPG, PNG",
  },
  {
    key: "offerLetter",
    label: "Offer Letter",
    hint: "PDF only",
    accept: ".pdf",
    allowedTypesText: "PDF only",
  },
];

function DocumentField({ doc }) {
  const {
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const { isView } = useFormMode();
  const fileValue = useWatch({ name: `documents.${doc.key}`, control });
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef(null);

  // Existing uploaded document (edit/view prefill) comes in as a URL string,
  // a newly picked file comes in as a FileList from the file input
  const existingUrl = typeof fileValue === "string" && fileValue ? fileValue : null;
  const newFile = !existingUrl && fileValue?.[0];
  const newFileName = newFile?.name;
  const newFileSizeText = newFile?.size
    ? `(${(newFile.size / (1024 * 1024)).toFixed(2)} MB)`
    : "";

  const fieldError = errors?.documents?.[doc.key];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate maximum file size immediately
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const selectedSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `File size (${selectedSizeMB} MB) exceeds ${MAX_FILE_SIZE_MB} MB limit. Please select a smaller file.`;

      setError(`documents.${doc.key}`, {
        type: "manual",
        message: errorMsg,
      });

      // Clear input so invalid file is not retained in form state
      e.target.value = "";
      setValue(`documents.${doc.key}`, null, { shouldValidate: true });
      return;
    }

    // Clear any previous error and update form value
    clearErrors(`documents.${doc.key}`);
    setValue(`documents.${doc.key}`, e.target.files, { shouldValidate: true });
  };

  return (
    <div className="form-control">
      <label className="label pb-1">
        <span className="label-text font-medium">{doc.label}</span>
        <span className="text-[11px] text-base-content/50">
          Max: {MAX_FILE_SIZE_MB} MB ({doc.allowedTypesText})
        </span>
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
            className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed bg-base-100 px-3 py-3 transition-colors ${
              fieldError
                ? "border-error bg-error/5 hover:border-error"
                : "border-base-300 hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                fieldError
                  ? "bg-error/10 text-error"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <UploadCloud className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-base-content font-medium">
                {newFileName
                  ? `${newFileName} ${newFileSizeText}`
                  : existingUrl
                    ? "Click to replace"
                    : "Click to upload"}
              </span>
              <span className="text-xs text-base-content/50">
                {doc.hint} • Max size: {MAX_FILE_SIZE_MB} MB
              </span>
            </span>
          </label>

          <input
            ref={inputRef}
            id={`doc-${doc.key}`}
            type="file"
            accept={doc.accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {fieldError && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-error">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{fieldError.message}</span>
            </p>
          )}
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
            Upload the required documents for verification (Max {MAX_FILE_SIZE_MB} MB per file)
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

