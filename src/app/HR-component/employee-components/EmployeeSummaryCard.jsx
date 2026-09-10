import { useEffect, useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import { getAllLeaveApi } from "../../../api/leaveApi";

export default function EmployeeSummaryCard({ employees }) {
  const [onLeaveCount, setOnLeaveCount] = useState(0);

  // New Employees (joined this month)
  const now = new Date();
  const newEmployeesCount = employees.filter((emp) => {
    const doj = emp.professional?.dateOfJoining;
    if (!doj) return false;
    const joinDate = new Date(doj);
    return (
      joinDate.getMonth() === now.getMonth() &&
      joinDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Departments (unique count)
  const departmentsCount = new Set(
    employees.map((emp) => emp.professional?.department).filter((dept) => dept),
  ).size;

  // On Leave (approved leave covering today)
  useEffect(() => {
    const fetchOnLeave = async () => {
      try {
        const res = await getAllLeaveApi();
        const leaves = res?.data || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const employeesOnLeave = new Set(
          leaves
            .filter((leave) => {
              if (leave.status !== "APPROVED") return false;
              return (leave.dates || []).some((d) => {
                const date = new Date(d);
                date.setHours(0, 0, 0, 0);
                return date.getTime() === today.getTime();
              });
            })
            .map((leave) => leave.employeeId?._id || leave.employeeId),
        );

        setOnLeaveCount(employeesOnLeave.size);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOnLeave();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CARD 1 */}
      <div className="bg-sky-600 card shadow-sm border-0 text-white">
        <div className="card-body p-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/20 text-white">
              <Users size={18} />
            </div>

            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-xs text-white hover:bg-white/10 border-0"
              >
                This Week
                <ChevronDown size={14} />
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 text-black rounded-box w-32"
              >
                <li>
                  <a>This Week</a>
                </li>
                <li>
                  <a>This Month</a>
                </li>
                <li>
                  <a>This Year</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center md:text-left">
            <div>
              <p className="text-xs text-white">All Employees</p>

              <p className="text-lg font-semibold">{employees.length}</p>
            </div>

            <div>
              <p className="text-xs text-white">Active</p>

              <p className="text-lg font-semibold text-white">
                {
                  employees.filter(
                    (emp) => emp.professional?.status === "Active",
                  ).length
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-white">Inactive</p>

              <p className="text-lg font-semibold text-white">
                {
                  employees.filter(
                    (emp) => emp.professional?.status !== "Active",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2 */}
      <div className="bg-orange-500 card shadow-sm border-0 text-white">
        <div className="card-body p-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white">
              <Users size={18} />
            </div>

            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-xs text-white hover:bg-white/10 border-0"
              >
                This Week
                <ChevronDown size={14} />
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 text-black rounded-box w-32"
              >
                <li>
                  <a>This Week</a>
                </li>
                <li>
                  <a>This Month</a>
                </li>
                <li>
                  <a>This Year</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center md:text-left">
            <div>
              <p className="text-xs text-white">New Employees</p>

              <p className="text-lg font-semibold text-white">
                {newEmployeesCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-white">Departments</p>

              <p className="text-lg font-semibold text-white">
                {departmentsCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-white">On Leave</p>

              <p className="text-lg font-semibold text-white">{onLeaveCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
