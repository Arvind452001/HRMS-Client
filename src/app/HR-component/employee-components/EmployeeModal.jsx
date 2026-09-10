import React from "react";
import EmployeeStepForm from "../../pages/hr-pages/stepFormEmployee/EmployeeStepForm";

// Employee view/edit modal: reuses the 9-step registration form,
// pre-filled with the employee's data (read-only in view mode).
export default function EmployeeModal({ employee, mode, onClose }) {
  if (!employee) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
        <EmployeeStepForm
          mode={mode}
          employee={employee}
          embedded
          onCancel={onClose}
          onSuccess={onClose}
        />
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
