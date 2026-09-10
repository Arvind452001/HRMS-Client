// EmployeeSalaryTable.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSalaryHR, getAllSalariesHR } from "../../../../api/Salary.Api";
import Swal from "sweetalert2";
import { Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import { showError } from "../../../../utils/alert";

export default function EmployeeSalaryTable() {
  const navigate = useNavigate();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= MONTH / YEAR STATE =================
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // ================= PAGINATION STATES =================
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ================= FETCH =================
  const loadSalaries = async (month, year) => {
    try {
      setLoading(true);
      const res = await getAllSalariesHR(month, year);
      setSalaries(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  // Load when month changes
  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      loadSalaries(month, year);
    }
  }, [selectedMonth]);

  // ================= ACTIONS =================
  const handleView = (id) => {
    navigate(`/hr/salary/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/hr/salary/edit/${id}`);
  };

const handleDelete = async (id, employeeName) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `Delete salary structure for ${employeeName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteSalaryHR(id);

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Salary structure deleted successfully.",
      timer: 2000,
      showConfirmButton: false,
    });

    // Reload with current month/year
    const [year, month] = selectedMonth.split("-").map(Number);
    loadSalaries(month, year);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text:
        error?.response?.data?.message ||
        "Failed to delete salary structure.",
    });
  }
};

  // ================= PAGINATION =================
  const totalPages = Math.ceil(salaries.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = salaries.slice(startIndex, endIndex);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f4f8f8] p-4 md:p-6 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-sky-600"></span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f8f8] p-4 md:p-6">
      {/* ================= HEADER CARD ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-4 shadow-sm mb-5">
        {/* LEFT - Title */}
        <div>
          <h2 className="text-sky-600 text-xl font-bold flex items-center gap-2">
            <Calendar className="text-sky-500" />
            Employee Salary
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage salary structures for the selected month
          </p>
        </div>

        {/* RIGHT - Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Picker */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-sky-200 px-3 py-1 shadow-sm">
            <Calendar className="text-sky-500 text-sm" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1); // reset pagination when month changes
              }}
              className="border-0 bg-transparent text-sm font-medium text-gray-700 focus:outline-none focus:ring-0"
            />
          </div>

          {/* ROWS PER PAGE */}
          <select
            className="select select-sm w-28 border-sky-200 bg-white text-gray-700 focus:border-sky-400 focus:outline-none"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5/page</option>
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>

          {/* ADD BUTTON */}
          <button
            className="bg-sky-600 btn btn-sm border-0 text-white hover:scale-[1.02] transition-all duration-200 shadow-sm whitespace-nowrap"
            onClick={() => navigate("/hr/salary/add")}
          >
            + Add Salary
          </button>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-250 border-separate border-spacing-0">
            {/* TABLE HEAD */}
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider first:rounded-tl-2xl">
                  SN
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Emp Code
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Effective From
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider last:rounded-tr-2xl">
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-14 text-gray-500 bg-[#f4f8f8]"
                  >
                    No salary structures found for this month.
                  </td>
                </tr>
              ) : (
                currentData.map((salary, index) => {
                  const employeeName =
                    salary?.employee?.personal?.fullName || "this employee";
                  return (
                    <tr
                      key={salary._id}
                      className="bg-[#f4f8f8] border-b border-gray-200 hover:bg-[#eef5f5] transition-all duration-200"
                    >
                      {/* SN */}
                      <td className="px-2 py-3 font-semibold text-gray-700">
                        {startIndex + index + 1}
                      </td>

                      {/* EMPLOYEE */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-4">
                          <div className="bg-sky-600 w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                            {salary?.employee?.personal?.fullName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {salary.employee?.personal?.fullName || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Employee Salary
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMP CODE */}
                      <td className="px-2 py-3">
                        <span className="px-4 py-3 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                          {salary.employee?.empCode ||
                            salary.employee?.professional?.employeeId}
                        </span>
                      </td>

                      {/* EFFECTIVE FROM */}
                      <td className="px-2 py-3 text-gray-700 font-medium">
                        {new Date(salary.effectiveFrom).toLocaleDateString()}
                      </td>

                      {/* GROSS SALARY */}
                      <td className="px-2 py-3">
                        <span className="px-4 py-3 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                          ₹{salary.grossSalary?.toLocaleString()}
                        </span>
                      </td>

                      {/* NET SALARY */}
                      <td className="px-2 py-3">
                        <span className="bg-sky-600 px-4 py-3 rounded-full text-white text-sm font-bold shadow-sm">
                          ₹{salary.netSalary?.toLocaleString()}
                        </span>
                      </td>

                      {/* ACTIONS BUTTONS */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          {/* VIEW */}
                          <button
                            onClick={() => handleView(salary._id)}
                            className="tooltip tooltip-top w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:bg-sky-600 transition-all duration-200"
                            data-tip="View"
                            aria-label="View"
                          >
                            <Eye size={14} />
                          </button>

                          {/* EDIT */}
                          <button
                            onClick={() => handleEdit(salary._id)}
                            className="tooltip tooltip-top w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:bg-amber-600 transition-all duration-200"
                            data-tip="Edit"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() =>
                              handleDelete(salary._id, employeeName)
                            }
                            className="tooltip tooltip-top w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:bg-red-600 transition-all duration-200"
                            data-tip="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-sky-100 bg-[#f4f8f8]">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
            <span className="font-semibold">
              {Math.min(endIndex, salaries.length)}
            </span>{" "}
            of <span className="font-semibold">{salaries.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              className="h-10 min-w-10 rounded-xl border border-sky-200 bg-white text-gray-700 disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ←
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`h-10 min-w-10 rounded-xl text-sm font-medium transition-all ${
                  currentPage === i + 1
                    ? "bg-sky-600 text-white shadow-md"
                    : "border border-sky-200 bg-white text-gray-700"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="h-10 min-w-10 rounded-xl border border-sky-200 bg-white text-gray-700 disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}