// SalaryStructureTable.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteSalaryStructureHR, getAllSalaryStructuresHR } from "../../../../api/Salary.Api";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { showError } from "../../../../utils/alert";

export default function SalaryStructureTable() {
  const navigate = useNavigate();

  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadSalaryStructures = async () => {
    try {
      setLoading(true);
      const res = await getAllSalaryStructuresHR();
      setSalaryStructures(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      showError("Error", "Failed to load salary structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalaryStructures();
  }, []);

const handleDelete = async (id, employeeName) => {
  // window.print();
 const result = await Swal.fire({
    title: "Delete Salary Structure?",
    text: `Are you sure you want to delete the salary structure for ${employeeName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteSalaryStructureHR(id);

    await Swal.fire({
      title: "Deleted!",
      text: "Salary structure deleted successfully.",
      icon: "success",
      confirmButtonText: "OK",
    });

    loadSalaryStructures();
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        "Failed to delete salary structure.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

  // Filter data based on search
  const filteredData = salaryStructures.filter((item) =>
    item?.employee?.personal?.fullName
      ?.toLowerCase()
      ?.includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Helper to render limited page buttons
  const renderPageButtons = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f8f8] p-4 md:p-6">
      {/* Header */}
     <div className="bg-white rounded-2xl border border-sky-100 px-5 py-4 shadow-sm mb-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
    {/* Left */}
    <div>
      <h2 className="text-2xl font-bold text-sky-700">
        Salary Structures
      </h2>
      <p className="text-sm text-gray-500">
        Manage employee salary structures
      </p>
    </div>

    {/* Right */}
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search Employee..."
        className="input input-bordered rounded-xl w-64"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      <select
        className="select select-bordered rounded-xl"
        value={rowsPerPage}
        onChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
      >
        <option value={5}>5/Page</option>
        <option value={10}>10/Page</option>
        <option value={20}>20/Page</option>
        <option value={50}>50/Page</option>
      </select>

      <button
        onClick={() => navigate("/hr/salary-structure/add")}
        className="btn rounded-xl border-0 text-white bg-sky-600 hover:bg-sky-700 transition-all"
      >
        + Add Structure
      </button>
    </div>
  </div>
</div>

      {/* Table */}
      <div id="salary-slip" className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="table min-w-125">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-4 py-4">S.N.</th>
                <th className="px-4 py-4">Employee</th>
                <th className="px-4 py-4">Basic</th>
                {/* <th className="px-4 py-4">Gross</th> */}
                {/* <th className="px-4 py-4">Deduction</th> */}
                {/* <th className="px-4 py-4">Net Salary</th> */}
                <th className="px-4 py-4">Effective Date</th>
                <th className="px-4 py-4">Actions</th>
               </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-500">
                    No Salary Structures Found
                  </td>
                </tr>
              ) : (
                currentData.map((salary, idx) => {
                  const employee = salary?.employee || {};
                  const employeeName = employee?.personal?.fullName || "N/A";
                  const employeeId = employee?.professional?.employeeId || "-";
                  return (
                    <tr
                      key={salary._id}
                      className="hover:bg-slate-50 transition-all duration-200"
                    >
                      <td className="font-medium">{startIndex + idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {employeeName}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-gray-700">
                          ₹{salary.basicSalary?.toLocaleString() || 0}
                        </span>
                      </td>
                      {/* <td>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                          ₹{salary.grossSalary?.toLocaleString() || 0}
                        </span>
                      </td> */}
                      {/* <td>
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                          ₹{salary.totalDeduction?.toLocaleString() || 0}
                        </span>
                      </td> */}
                      {/* <td>
                        <span className="px-3 py-2 rounded-full bg-green-500 text-white text-sm font-semibold shadow-sm">
                          ₹{salary.netSalary?.toLocaleString() || 0}
                        </span>
                      </td> */}
                      <td className="text-gray-600">
                        {salary.effectiveFrom
                          ? new Date(salary.effectiveFrom).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/hr/salary-structure/view/${salary._id}`)
                            }
                            className="tooltip tooltip-top w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md hover:bg-sky-600 transition-all"
                            data-tip="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/hr/salary-structure/edit/${salary._id}`)
                            }
                            className="tooltip tooltip-top w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md hover:bg-amber-600 transition-all"
                            data-tip="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(salary._id, employeeName)}
                            className="tooltip tooltip-top w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-all"
                            data-tip="Delete"
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

        {/* Footer Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-t bg-slate-50">
            <div className="text-sm text-gray-600">
              Showing <strong>{startIndex + 1}</strong> to{" "}
              <strong>{Math.min(endIndex, filteredData.length)}</strong> of{" "}
              <strong>{filteredData.length}</strong> entries
            </div>
            <div className="join">
              <button
                className="join-item btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Prev
              </button>
              {renderPageButtons().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`join-item btn ${
                    currentPage === page ? "btn-primary" : ""
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                className="join-item btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}