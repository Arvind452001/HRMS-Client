// AddSalaryPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAllEmployeesApi } from "../../../../api/employee-Api";
import {
  createSalaryHR,
  getSalaryByIdHR,
  updateSalaryHR,
} from "../../../../api/Salary.Api";
import Swal from "sweetalert2";
import { showError } from "../../../../utils/alert";
import { Calendar, Clock, DollarSign, FileText, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AddSalaryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Determine mode from URL path
  const pathname = location.pathname;
  const isViewMode = pathname.includes("/view/");
  const isEditMode = pathname.includes("/edit/");
  const isAddMode = pathname.includes("/add") && !isViewMode && !isEditMode;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode || isViewMode);
  const [salaryMeta, setSalaryMeta] = useState(null);
  const [form, setForm] = useState({
    employee: "",
    salaryType: "monthly",
    effectiveFrom: "",
    month: "",
    year: "",
    workingDays: 0,
    paidDays: 0,
    leaveWithoutPay: 0,
    basic: "",
    hra: "",
    da: "",
    conveyanceAllowance: "",
    medicalAllowance: "",
    specialAllowance: "",
    bonus: "",
    pf: "",
    esi: "",
    professionalTax: "",
    leaveDeduction: 0,
    otherDeduction: "",
    status: "generated",
    remarks: "",
  });

  // Fetch employees for dropdown
  useEffect(() => {
    loadEmployees();
  }, []);

  // If editing or viewing, fetch salary data
  useEffect(() => {
    if ((isEditMode || isViewMode) && id) {
      loadSalaryData();
    }
  }, [id, isEditMode, isViewMode]);

  const loadEmployees = async () => {
    try {
      const res = await getAllEmployeesApi();
      const allEmployees = res?.data || [];
      const eligible = allEmployees.filter(
        (emp) => emp.employeeType !== "new",
      );
      setEmployees(eligible);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load employees");
    }
  };

  const loadSalaryData = async () => {
    try {
      setPageLoading(true);
      const res = await getSalaryByIdHR(id);
      const data = res?.data?.data || res?.data;
      if (!data) return;

      setSalaryMeta({
        _id: data._id,
        generationType: data.generationType || "MANUAL",
        isManuallyModified: data.isManuallyModified || false,
        generatedAt: data.generatedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        employeeDetails: data.employee,
      });

      setForm({
        employee: data.employee?._id || data.employee || "",
        salaryType: data.salaryType || "monthly",
        effectiveFrom: data.effectiveFrom
          ? data.effectiveFrom.split("T")[0]
          : "",
        month: data.month ?? "",
        year: data.year ?? "",
        workingDays: data.workingDays ?? 0,
        paidDays: data.paidDays ?? 0,
        leaveWithoutPay: data.leaveWithoutPay ?? 0,
        basic: data.basic ?? "",
        hra: data.hra ?? "",
        da: data.da ?? "",
        conveyanceAllowance: data.conveyanceAllowance ?? "",
        medicalAllowance: data.medicalAllowance ?? "",
        specialAllowance: data.specialAllowance ?? "",
        bonus: data.bonus ?? "",
        pf: data.pf ?? "",
        esi: data.esi ?? "",
        professionalTax: data.professionalTax ?? "",
        leaveDeduction: data.leaveDeduction ?? 0,
        otherDeduction: data.otherDeduction ?? "",
        status: data.status || "generated",
        remarks: data.remarks || "",
      });
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load salary data");
    } finally {
      setPageLoading(false);
    }
  };

  const updateField = (key, value) => {
    if (isViewMode) return; // Disable editing in view mode
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Numeric Calculations
  const workingDays = parseFloat(form.workingDays) || 0;
  const paidDays = parseFloat(form.paidDays) || 0;
  const leaveWithoutPay = parseFloat(form.leaveWithoutPay) || 0;

  const basic = parseFloat(form.basic) || 0;
  const hra = parseFloat(form.hra) || 0;
  const da = parseFloat(form.da) || 0;
  const conveyanceAllowance = parseFloat(form.conveyanceAllowance) || 0;
  const medicalAllowance = parseFloat(form.medicalAllowance) || 0;
  const special = parseFloat(form.specialAllowance) || 0;
  const bonus = parseFloat(form.bonus) || 0;

  const pf = parseFloat(form.pf) || 0;
  const esi = parseFloat(form.esi) || 0;
  const professionalTax = parseFloat(form.professionalTax) || 0;
  const leaveDeduction = parseFloat(form.leaveDeduction) || 0;
  const other = parseFloat(form.otherDeduction) || 0;

  const gross =
    basic + hra + da + conveyanceAllowance + medicalAllowance + special + bonus;
  const totalDeduction = pf + esi + professionalTax + leaveDeduction + other;
  const net = gross - totalDeduction;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    if (!form.employee) {
      return Swal.fire({
        icon: "warning",
        title: "Employee Required",
        text: "Please select an employee.",
      });
    }

    if (!form.effectiveFrom) {
      return Swal.fire({
        icon: "warning",
        title: "Effective Date Required",
        text: "Please select effective date.",
      });
    }

    if (!form.month || !form.year) {
      return Swal.fire({
        icon: "warning",
        title: "Month & Year Required",
        text: "Please select month and enter year.",
      });
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        workingDays,
        paidDays,
        leaveWithoutPay,
        basic,
        hra,
        da,
        conveyanceAllowance,
        medicalAllowance,
        specialAllowance: special,
        bonus,
        pf,
        esi,
        professionalTax,
        leaveDeduction,
        otherDeduction: other,
        grossSalary: gross,
        totalDeduction,
        netSalary: net,
        status: form.status || "generated",
        remarks: form.remarks || "",
      };

      if (isEditMode) {
        await updateSalaryHR(id, payload);

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Salary updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createSalaryHR(payload);

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Salary added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      navigate("/hr/salary");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Get selected employee name for view/edit mode title
  const selectedEmployee =
    employees?.find((emp) => emp._id === form.employee) ||
    salaryMeta?.employeeDetails ||
    null;
  const employeeName =
    selectedEmployee?.personal?.fullName ||
    selectedEmployee?.name ||
    (typeof form.employee === "object" ? form.employee?.personal?.fullName : "") ||
    "";
  const employeeIdStr =
    selectedEmployee?.professional?.employeeId ||
    selectedEmployee?.employeeId ||
    "";

  const pageTitle = isAddMode
    ? "Add New Salary"
    : isEditMode
      ? `Edit Salary - ${employeeName || "Employee"}`
      : `View Salary - ${employeeName || "Employee"}`;

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="card-title text-3xl text-primary m-0">
                  {pageTitle}
                </h2>
                {employeeIdStr && (
                  <span className="badge badge-outline text-xs font-mono font-medium">
                    {employeeIdStr}
                  </span>
                )}
                {salaryMeta && (
                  <span
                    className={`badge badge-sm font-semibold ${
                      salaryMeta.generationType === "AUTO"
                        ? "badge-secondary"
                        : "badge-primary"
                    }`}
                  >
                    {salaryMeta.generationType === "AUTO"
                      ? "Auto-Generated"
                      : "Manual"}
                    {salaryMeta.isManuallyModified && " • Modified"}
                  </span>
                )}
                {form.status && (
                  <span
                    className={`badge badge-sm font-semibold uppercase ${
                      form.status === "paid"
                        ? "badge-success text-white"
                        : form.status === "draft"
                          ? "badge-warning"
                          : "badge-info text-white"
                    }`}
                  >
                    {form.status}
                  </span>
                )}
              </div>
              {(isEditMode || isViewMode) && id && (
                <div className="flex items-center gap-2">
                  {isViewMode && (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm"
                      onClick={() => navigate(`/hr/salary/edit/${id}`)}
                    >
                      Edit Salary
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/hr/salary/slip/${id}`)}
                  >
                    Generate Salary Slip
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic & Period Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Employee Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Employee *</span>
                  </label>
                  <select
                    className={`select select-bordered w-full ${isViewMode ? "select-ghost bg-base-200" : ""}`}
                    value={form.employee}
                    onChange={(e) => updateField("employee", e.target.value)}
                    required
                    disabled={isViewMode}
                  >
                    <option value="">Select Employee</option>
                    {/* If employee not yet in list but loaded from salary meta */}
                    {form.employee && !employees.some((e) => e._id === form.employee) && employeeName && (
                      <option value={form.employee}>
                        {employeeName} {employeeIdStr ? `(${employeeIdStr})` : ""}
                      </option>
                    )}
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.personal?.fullName || emp.name} - {emp.professional?.employeeId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Salary Type */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Salary Type</span>
                  </label>
                  <select
                    className={`select select-bordered ${isViewMode ? "select-ghost bg-base-200" : ""}`}
                    value={form.salaryType}
                    onChange={(e) => updateField("salaryType", e.target.value)}
                    disabled={isViewMode}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Effective Date */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Effective From *
                    </span>
                  </label>
                  <input
                    type="date"
                    className={`input input-bordered ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                    value={form.effectiveFrom}
                    onChange={(e) =>
                      updateField("effectiveFrom", e.target.value)
                    }
                    required
                    disabled={isViewMode}
                  />
                </div>

                {/* Month */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Month *</span>
                  </label>
                  <select
                    className={`select select-bordered ${isViewMode ? "select-ghost bg-base-200" : ""}`}
                    value={form.month}
                    onChange={(e) =>
                      updateField("month", Number(e.target.value))
                    }
                    disabled={isViewMode}
                    required
                  >
                    <option value="">Select Month</option>
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ].map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m} ({i + 1})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Year *</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                    placeholder="Enter year (e.g. 2026)"
                    value={form.year}
                    onChange={(e) =>
                      updateField("year", Number(e.target.value))
                    }
                    disabled={isViewMode}
                    required
                  />
                </div>

                {/* Status */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Salary Status</span>
                  </label>
                  <select
                    className={`select select-bordered ${isViewMode ? "select-ghost bg-base-200" : ""}`}
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    disabled={isViewMode}
                  >
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Attendance & Working Days Section */}
              <div className="mt-6 p-4 bg-base-200/60 rounded-2xl border border-base-300">
                <h4 className="font-semibold text-md text-sky-700 dark:text-sky-400 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Attendance &amp; Days Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Working Days */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Total Working Days</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className={`input input-bordered bg-base-100 ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                      placeholder="0"
                      value={form.workingDays}
                      onChange={(e) => updateField("workingDays", e.target.value)}
                      disabled={isViewMode}
                    />
                  </div>

                  {/* Paid Days */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-emerald-700 dark:text-emerald-400">
                        Paid Days
                      </span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className={`input input-bordered bg-base-100 ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                      placeholder="0"
                      value={form.paidDays}
                      onChange={(e) => updateField("paidDays", e.target.value)}
                      disabled={isViewMode}
                    />
                  </div>

                  {/* Leave Days / Leave Without Pay */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-rose-700 dark:text-rose-400">
                        Leave Days (LWP)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className={`input input-bordered bg-base-100 ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                      placeholder="0"
                      value={form.leaveWithoutPay}
                      onChange={(e) => updateField("leaveWithoutPay", e.target.value)}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* Earnings Section */}
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3 text-success flex items-center gap-2">
                  <DollarSign size={18} />
                  Earnings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: "basic", label: "Basic Salary" },
                    { key: "hra", label: "HRA" },
                    { key: "da", label: "DA" },
                    { key: "conveyanceAllowance", label: "Conveyance Allowance" },
                    { key: "medicalAllowance", label: "Medical Allowance" },
                    { key: "specialAllowance", label: "Special Allowance" },
                    { key: "bonus", label: "Bonus" },
                  ].map(({ key, label }) => (
                    <div className="form-control" key={key}>
                      <label className="label">
                        <span className="label-text font-medium">{label}</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                        placeholder="0"
                        value={form[key]}
                        onChange={(e) => updateField(key, e.target.value)}
                        disabled={isViewMode}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions Section */}
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3 text-error flex items-center gap-2">
                  <AlertCircle size={18} />
                  Deductions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { key: "pf", label: "Provident Fund (PF)" },
                    { key: "esi", label: "ESI" },
                    { key: "professionalTax", label: "Professional Tax (PT)" },
                    { key: "leaveDeduction", label: "Leave Deduction" },
                    { key: "otherDeduction", label: "Other Deduction" },
                  ].map(({ key, label }) => (
                    <div className="form-control" key={key}>
                      <label className="label">
                        <span className="label-text font-medium">{label}</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                        placeholder="0"
                        value={form[key]}
                        onChange={(e) => updateField(key, e.target.value)}
                        disabled={isViewMode}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks Section */}
              <div className="mt-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-1.5">
                      <FileText size={15} /> Remarks / Note
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${isViewMode ? "input-ghost bg-base-200" : ""}`}
                    placeholder="e.g. Auto-generated monthly salary slip / Monthly bonus included"
                    value={form.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="mt-6 p-4 bg-base-200 rounded-2xl border border-base-300">
                <h4 className="font-semibold text-md mb-3">Salary &amp; Days Summary</h4>
                
                {/* Days mini stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-base-100 rounded-xl text-center border border-base-300">
                  <div>
                    <span className="text-xs text-base-content/60">Working Days</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{workingDays}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-600 font-medium">Paid Days</span>
                    <p className="text-lg font-bold text-emerald-600">{paidDays}</p>
                  </div>
                  <div>
                    <span className="text-xs text-rose-600 font-medium">Leave Days (LWP)</span>
                    <p className="text-lg font-bold text-rose-600">{leaveWithoutPay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="stat bg-base-100 rounded-xl p-3 shadow-xs">
                    <div className="stat-title text-primary font-medium">Gross Salary</div>
                    <div className="stat-value text-primary text-2xl">
                      ₹{gross.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="stat bg-base-100 rounded-xl p-3 shadow-xs">
                    <div className="stat-title text-error font-medium">Total Deduction</div>
                    <div className="stat-value text-error text-2xl">
                      ₹{totalDeduction.toLocaleString("en-IN")}
                    </div>
                    {leaveDeduction > 0 && (
                      <div className="stat-desc text-rose-500 text-[11px] mt-0.5">
                        Incl. ₹{leaveDeduction.toLocaleString("en-IN")} leave deduction
                      </div>
                    )}
                  </div>
                  <div className="stat bg-base-100 rounded-xl p-3 shadow-xs">
                    <div className="stat-title text-success font-medium">Net Salary</div>
                    <div className="stat-value text-success text-2xl font-extrabold">
                      ₹{net.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/hr/salary")}
                >
                  Back
                </button>
                {!isViewMode && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                    {isEditMode ? "Update Salary" : "Save Salary"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
