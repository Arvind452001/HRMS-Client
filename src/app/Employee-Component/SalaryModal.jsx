import React, { useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import BaseModal from "../../components/BaseModal";
import SalarySlipDocument from "../../components/SalarySlipDocument";
import { generatePdfFromNode } from "../../utils/pdf";
import { showError } from "../../utils/alert";

const SalaryModal = ({ data, totals, onClose, logoSrc }) => {
  const slipRef = useRef(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const employeeDoc = {
    name: data?.employee?.personal?.fullName,
    employeeId: data?.employee?.professional?.employeeId,
    designation: data?.employee?.professional?.designation,
    department: data?.employee?.professional?.department,
    dateOfJoining: data?.employee?.professional?.dateOfJoining
      ? new Date(data.employee.professional.dateOfJoining).toLocaleDateString("en-IN")
      : "",
    paidDays: data?.paidDays || 0,
    leaveDays: data?.leaveWithoutPay || 0,
  };

  // Keep the same net/gross the table already computed, so the totals
  // shown here always match the row the employee clicked "View" on.
  const salaryDoc = {
    ...data,
    netSalary: totals?.net ?? data?.netSalary,
  };

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    setGeneratingPdf(true);
    try {
      const monthLabel = data?.effectiveFrom
        ? new Date(data.effectiveFrom).toLocaleString("en", { month: "short" })
        : data?.month;
      const fileName = `Salary-Slip-${employeeDoc.name || "Employee"}-${monthLabel}-${data?.year}.pdf`.replace(
        /\s+/g,
        "_"
      );
      await generatePdfFromNode(slipRef.current, fileName);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      showError("PDF Failed", "Could not generate the PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <BaseModal
      title="Salary Slip"
      onClose={onClose}
      size="xl"
      footer={
        <>
          <button onClick={onClose} className="btn btn-outline btn-sm sm:btn-md">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-outline btn-sm gap-1.5 sm:btn-md">
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={generatingPdf}
            className="btn btn-primary btn-sm gap-1.5 sm:btn-md"
          >
            <Download size={16} />
            {generatingPdf ? "Generating…" : "Download PDF"}
          </button>
        </>
      }
    >
      {/* The exact same document that gets downloaded is what's previewed
          here — what the employee sees is exactly what they get. */}
      <SalarySlipDocument
        ref={slipRef}
        employee={employeeDoc}
        salary={salaryDoc}
        logoSrc={logoSrc}
      />
    </BaseModal>
  );
};

export default SalaryModal;
