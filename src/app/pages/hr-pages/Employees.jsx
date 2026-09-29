import React, { useEffect, useState } from "react";

import EmployeeHeader from "../../HR-component/employee-components/EmployeeHeader";
import EmployeeSummaryCard from "../../HR-component/employee-components/EmployeeSummaryCard";
import EmployeeModal from "../../HR-component/employee-components/EmployeeModal";

import Loader from "../../../components/Loader";

import { getAllEmployeesApi } from "../../../api/employee-Api";
import { Eye, SquarePen } from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [mode, setMode] = useState("view");

  // Fetch Employees

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await getAllEmployeesApi();
      setEmployees(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search

  const filteredEmployees = employees.filter((emp) =>
    emp.personal?.fullName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}

      <EmployeeHeader />

      {/* Summary Cards */}

      <EmployeeSummaryCard employees={employees} />

      {/* Employee Table Card */}

      <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
        {/* Table Header */}

        <div className="m-3 border-b border-base-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-0">
            {/* LEFT */}
            <div>
              <h2 className="font-bold text-xl text-gray-800">
                Employees List
              </h2>
            </div>

            {/* SEARCH */}

            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered rounded-2xl w-full"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto w-full custom-scrollbar">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">
              No employees found
            </div>
          ) : (
            <table className="table table-zebra w-full min-w-[950px] border-separate border-spacing-0">
              {/* TABLE HEAD */}

              <thead className="bg-sky-600 text-white">
                <tr>
                  <th className="py-4 px-5 rounded-tl-2xl font-semibold">
                    Employee
                  </th>

                  <th className="py-4 px-5 font-semibold">Employee ID</th>

                  <th className="py-4 px-5 font-semibold">Contact</th>

                  <th className="py-4 px-5 font-semibold">Department</th>

                  <th className="py-4 px-5 font-semibold">City</th>

                  <th className="py-4 px-5 font-semibold">DOJ</th>

                  <th className="py-4 px-5 rounded-tr-2xl text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-sky-50/40 transition-all duration-300"
                  >
                    {/* EMPLOYEE */}

                    <td>
                      <div className="flex items-center gap-3">
                        {/* AVATAR */}

                        <div className="avatar">
                          <div className="w-12 h-12 rounded-2xl ring ring-sky-100 ring-offset-2 overflow-hidden shadow-sm">
                            <img
                              src={emp.personal?.profilePhoto}
                              alt="profile"
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* INFO */}

                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {emp.personal?.fullName}
                          </p>

                          <p className="text-xs text-gray-500">
                            {emp.account?.officialEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* EMPLOYEE ID */}

                    <td>
                      <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold">
                        {emp.professional?.employeeId || "-"}
                      </span>
                    </td>

                    {/* CONTACT */}

                    <td>
                      <span className="font-medium text-gray-700 text-sm">
                        {emp.contact?.primaryPhone || "-"}
                      </span>
                    </td>

                    {/* DEPARTMENT */}

                    <td>
                      <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-700 text-xs font-semibold">
                        {emp.professional?.department || "-"}
                      </span>
                    </td>

                    {/* CITY */}

                    <td className="text-gray-700 font-medium text-sm">
                      {emp.address?.current?.city || "-"}
                    </td>

                    {/* DOJ */}

                    <td className="text-gray-700 text-sm">
                      {emp.professional?.dateOfJoining
                        ? new Date(
                            emp.professional.dateOfJoining,
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex justify-center gap-2">
                        {/* VIEW */}

                        <button
                          className="w-9 h-9 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 transition-all duration-200 flex items-center justify-center shadow-sm hover:cursor-pointer"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setMode("view");
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {/* EDIT */}

                        <button
                          className="w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 transition-all duration-200 flex items-center justify-center shadow-sm hover:cursor-pointer"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setMode("edit");
                          }}
                        >
                          <SquarePen size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER */}

        <div className="card-body border-t border-base-200 py-4 text-xs text-gray-500">
          Showing {filteredEmployees.length} employees
        </div>
      </div>

      {/* MODAL */}

      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          mode={mode}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
