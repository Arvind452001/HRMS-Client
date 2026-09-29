import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getEmployeeByIdApi } from "../../../../api/employee-Api";
import { getSalaryByIdHR } from "../../../../api/Salary.Api";
import logo from "../../../../assets/technorizen-logo.png";
import SalarySlipDocument from "../../../../components/SalarySlipDocument";
import Loader from "../../../../components/Loader";
import { generatePdfFromNode } from "../../../../utils/pdf";
import { showError } from "../../../../utils/alert";

export default function SalarySlipPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const slipRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // The route param is the specific salary record's ID, so we
        // fetch that exact record (not just "any" salary for the
        // employee) and then load the full employee profile from it.
        const salRes = await getSalaryByIdHR(id);
        const salaryData = salRes?.data?.data;

        if (!salaryData) {
          throw new Error("Salary record not found");
        }

        const employeeId = salaryData.employee?._id || salaryData.employee;
        const empData = await getEmployeeByIdApi(employeeId);

        setEmployee(empData);
        setSalary(salaryData);
      } catch (error) {
        console.error("Failed to load data", error);
        showError("Failed to Load", "Could not load salary slip data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <Loader />
      </div>
    );
  }

  if (!employee || !salary) {
    return (
      <div className="p-6 text-center text-error">No data found</div>
    );
  }

  const employeeDoc = {
    name: employee.personal?.fullName,
    employeeId: employee.professional?.employeeId,
    designation: employee.professional?.designation,
    department: employee.professional?.department,
    dateOfJoining: employee.professional?.dateOfJoining
      ? new Date(employee.professional.dateOfJoining).toLocaleDateString("en-IN")
      : "",
    paidDays: salary.paidDays || 0,
    leaveDays: salary.leaveWithoutPay || 0,
  };

  const handlePrint = () => window.print();

  const handlePDF = async () => {
    setGeneratingPdf(true);
    try {
      const monthLabel = (() => {
        if (salary?.month && salary?.year) {
          const monthNum = Number(salary.month);
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
            return new Date(salary.year, monthNum - 1).toLocaleString("en", { month: "short" });
          }
          return salary.month;
        }
        if (salary?.effectiveFrom) {
          return new Date(salary.effectiveFrom).toLocaleString("en", { month: "short" });
        }
        return salary?.month || "Slip";
      })();
      const fileName = `Salary-Slip-${employeeDoc.name || "Employee"}-${monthLabel}-${salary?.year || ""}.pdf`
        .replace(/\s+/g, "_");

      await generatePdfFromNode(slipRef.current, fileName);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      showError("PDF Failed", "Could not generate the PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b border-base-300 bg-base-100/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm gap-1.5"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <img src={logo} alt="Technorizen" className="h-7 w-auto sm:h-8" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn btn-outline btn-sm">
              Print
            </button>
            <button
              onClick={handlePDF}
              disabled={generatingPdf}
              className="btn btn-primary btn-sm"
            >
              {generatingPdf ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <SalarySlipDocument
          ref={slipRef}
          employee={employeeDoc}
          salary={salary}
          logoSrc={logo}
        />
      </main>
    </div>
  );
}
