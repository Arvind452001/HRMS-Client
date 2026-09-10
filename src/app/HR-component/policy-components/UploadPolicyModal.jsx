import { useState } from "react";
import { showWarning, showError } from "../../../utils/alert";
import { baseURL } from "../../../utils/baseUrlConfig";
import BaseModal from "../../../components/BaseModal";

const UploadPolicyModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return showWarning("Missing File", "Please select a PDF");

    const formData = new FormData();
    formData.append("policy", file);

    try {
      setLoading(true);
      // NOTE: backend does not currently expose an /api/policies route -
      // this call now points at the configured API (local or live) instead
      // of a hardcoded localhost URL, ready for whenever that route exists.
      await fetch(`${baseURL}/policies/upload`, {
        method: "POST",
        body: formData,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showError("Upload Failed", "Could not upload the policy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      title="Add Policy"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn btn-outline btn-sm sm:btn-md">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn btn-primary btn-sm sm:btn-md"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </>
      }
    >
      <p className="mb-4 text-center text-xs text-base-content/60">
        Upload company policy PDF
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input file-input-bordered w-full"
      />
    </BaseModal>
  );
};

export default UploadPolicyModal;
