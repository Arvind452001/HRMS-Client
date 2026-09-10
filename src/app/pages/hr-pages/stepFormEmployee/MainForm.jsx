import React from "react";
import EmployeeStepForm from "./EmployeeStepForm";

export default function MainForm() {
  return (
    <div className="min-h-screen bg-base-200 px-3 py-5 sm:px-6 sm:py-8">
      <EmployeeStepForm mode="create" />
    </div>
  );
}
