// SalaryStructureForm.jsx
import { useMemo } from "react";

export default function SalaryStructureForm({
  formData = {
    employee: "",
    effectiveFrom: "",
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    bonus: 0,
    professionalTax: 0,
  },
  handleChange,
  handleSubmit,
  employees = [],
  loading = false,
  isView = false,
  isEdit = false,
}) {
  // Gross Salary = sum of all earnings
  const grossSalary = useMemo(() => {
    return (
      Number(formData.basicSalary || 0) +
      Number(formData.hra || 0) +
      Number(formData.conveyanceAllowance || 0) +
      Number(formData.medicalAllowance || 0) +
      Number(formData.specialAllowance || 0) +
      Number(formData.bonus || 0)
    );
  }, [formData]);

  // Total Deduction = only professional tax (schema has no other deductions)
  const totalDeduction = useMemo(() => {
    return Number(formData.professionalTax || 0);
  }, [formData]);

  const netSalary = grossSalary - totalDeduction;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-sky-700">
          {isView
            ? "View Salary Structure"
            : isEdit
              ? "Update Salary Structure"
              : "Create Salary Structure"}
        </h2>
        <p className="text-gray-500 mt-1">
          Manage employee salary details and deductions
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Employee */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Employee</span>
            </label>
            <select
              name="employee"
              value={formData.employee || ""}
              onChange={handleChange}
              disabled={isView}
              className="select select-bordered w-full"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.personal?.fullName} ({emp.professional?.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Effective From */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Effective From</span>
            </label>
            <input
              type="date"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
              disabled={isView}
              required
              className="input input-bordered w-full"
            />
          </div>

          {/* Basic Salary */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Basic Salary</span>
            </label>
            <input
              type="number"
              name="basicSalary"
              value={formData.basicSalary}
              onChange={handleChange}
              disabled={isView}
              placeholder="Enter Basic Salary"
              className="input input-bordered w-full"
            />
          </div>

          {/* HRA */}
          <div>
            <label className="label">
              <span className="label-text font-medium">HRA</span>
            </label>
            <input
              type="number"
              name="hra"
              value={formData.hra}
              onChange={handleChange}
              disabled={isView}
              placeholder="Enter HRA"
              className="input input-bordered w-full"
            />
          </div>

          {/* Allowances (grouped) */}
          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Allowances</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label">
                  <span className="label-text">Conveyance Allowance</span>
                </label>
                <input
                  type="number"
                  name="conveyanceAllowance"
                  value={formData.conveyanceAllowance}
                  onChange={handleChange}
                  disabled={isView}
                  placeholder="Enter Conveyance"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Medical Allowance</span>
                </label>
                <input
                  type="number"
                  name="medicalAllowance"
                  value={formData.medicalAllowance}
                  onChange={handleChange}
                  disabled={isView}
                  placeholder="Enter Medical"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Special Allowance</span>
                </label>
                <input
                  type="number"
                  name="specialAllowance"
                  value={formData.specialAllowance}
                  onChange={handleChange}
                  disabled={isView}
                  placeholder="Enter Special"
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          </div>

          {/* Bonus */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Bonus</span>
            </label>
            <input
              type="number"
              name="bonus"
              value={formData.bonus}
              onChange={handleChange}
              disabled={isView}
              placeholder="Enter Bonus"
              className="input input-bordered w-full"
            />
          </div>

          {/* Professional Tax (only deduction in schema) */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Professional Tax</span>
            </label>
            <input
              type="number"
              name="professionalTax"
              value={formData.professionalTax}
              onChange={handleChange}
              disabled={isView}
              placeholder="Enter Professional Tax"
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-5">
          <p className="text-sm text-green-600">Gross Salary</p>
          <h3 className="text-3xl font-bold text-green-700 mt-2">
            ₹{grossSalary.toLocaleString()}
          </h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5">
          <p className="text-sm text-red-600">Total Deduction</p>
          <h3 className="text-3xl font-bold text-red-700 mt-2">
            ₹{totalDeduction.toLocaleString()}
          </h3>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5">
          <p className="text-sm text-sky-600">Net Salary</p>
          <h3 className="text-3xl font-bold text-sky-700 mt-2">
            ₹{netSalary.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        {!isView && (
          <button
            type="submit"
            disabled={loading}
            className="btn border-0 text-white bg-sky-600 hover:bg-sky-700 min-w-40"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : isEdit ? (
              "Update Structure"
            ) : (
              "Create Structure"
            )}
          </button>
        )}
      </div>
    </form>
  );
}