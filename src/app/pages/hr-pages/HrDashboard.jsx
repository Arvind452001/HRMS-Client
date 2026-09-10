import React, { useState, useEffect } from "react";

import { ArrowUp, CalendarClock, Home, LayoutGrid, ListChecks, Users, Users2, Wallet } from "lucide-react";
import { getTodayALLAttendanceApi } from "../../../api/attendanceApi";
import { getAllEmployeesApi } from "../../../api/employee-Api";

const HrDashboard = () => {
  // STATE
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newEmployeesThisMonth: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
  });

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch all employees
        const empRes = await getAllEmployeesApi();
        const empList = empRes?.data || [];
        setEmployees(empList);

        // Calculate total employees this month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const newThisMonth = empList.filter((emp) => {
          const joiningDate = emp.professional?.dateOfJoining || emp.joinDate;
          if (!joiningDate) return false;

          const join = new Date(joiningDate);

          return (
            join.getMonth() === currentMonth &&
            join.getFullYear() === currentYear
          );
        }).length;

        // 2. Fetch today's attendance
        let attendanceData = [];

        try {
          const today = new Date().toISOString().split("T")[0];

          const attRes = await getTodayALLAttendanceApi(today);

          attendanceData = attRes?.data || [];
        } catch (error) {
          console.error(error);
          attendanceData = [];
        }

        setAttendance(attendanceData);

        const present = attendanceData.filter(
          (item) => item.status === "present",
        ).length;

        const onLeave = attendanceData.filter(
          (item) => item.status === "leave",
        ).length;

        // "Absent" should only count employees who are neither present
        // nor on approved/pending leave — someone on leave isn't absent.
        const absent = attendanceData.filter(
          (item) => item.status === "absent",
        ).length;

        setStats({
          totalEmployees: empList.length,
          newEmployeesThisMonth: newThisMonth,
          presentToday: present,
          absentToday: absent,
          onLeaveToday: onLeave,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // LOADING
  if (loading) {
    return (
      <section className="content p-4">
        <div className="container-fluid flex justify-center items-center h-80">
          <span className="loading loading-spinner loading-lg text-sky-600"></span>
        </div>
      </section>
    );
  }

  // RENDER
  return (
    <section className="content p-4">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="block-header mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <h4 className="text-xl font-semibold mr-4">Dashboard</h4>
              <ul className="flex items-center gap-2 text-gray-600">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-1 hover:text-sky-600"
                  >
                    <Home /> Home
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="active">Dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Card 1 - Projects (placeholder) */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="h-11 w-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <LayoutGrid className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  24.7% <ArrowUp className="inline" size={10} />
                </span>
              </div>
              <h5 className="text-sm font-medium mt-3 text-base-content/60">
                Projects
              </h5>
              <h2 className="text-2xl font-bold text-base-content">0</h2>
              <progress
                className="progress progress-info w-full h-1.5 mt-2"
                value="25"
                max="100"
              ></progress>
            </div>
          </div>

          {/* Card 2 - New Employee */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="h-11 w-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Users className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  5.28% <ArrowUp className="inline" size={10} />
                </span>
              </div>
              <h5 className="text-sm font-medium mt-3 text-base-content/60">
                Total Employee
              </h5>
              <h2 className="text-2xl font-bold text-base-content">
                {stats.totalEmployees}
              </h2>
              <progress
                className="progress progress-success w-full h-1.5 mt-2"
                value="25"
                max="100"
              ></progress>
            </div>
          </div>

          {/* Card 3 - Running Tasks (placeholder) */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="h-11 w-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <ListChecks className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  16% <ArrowUp className="inline" size={10} />
                </span>
              </div>
              <h5 className="text-sm font-medium mt-3 text-base-content/60">
                Running Tasks
              </h5>
              <h2 className="text-2xl font-bold text-base-content">0</h2>
              <progress
                className="progress progress-success w-full h-1.5 mt-2"
                value="25"
                max="100"
              ></progress>
            </div>
          </div>

          {/* Card 4 - Earning (placeholder) */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Wallet className="text-xl" />
                </div>
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  5.07% <ArrowUp className="inline" size={10} />
                </span>
              </div>
              <h5 className="text-sm font-medium mt-3 text-base-content/60">
                Earning
              </h5>
              <h2 className="text-2xl font-bold text-base-content">$0</h2>
              <progress
                className="progress progress-warning w-full h-1.5 mt-2"
                value="25"
                max="100"
              ></progress>
            </div>
          </div>
        </div>

        {/* Employee Details and Today Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Employee Details Table */}
          <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between gap-2 p-4 border-b border-base-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Users2 size={17} />
                </div>
                <h2 className="text-base font-bold text-base-content">
                  Active Employees
                </h2>
              </div>
              <span className="badge badge-ghost badge-sm bg-base-200 border-none text-base-content/60 font-medium whitespace-nowrap">
                {employees.length} total
              </span>
            </div>

            <div className="max-h-100 overflow-y-auto overflow-x-auto no-scrollbar">
              <table className="table w-full min-w-125">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joining Date</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-base-content/40">
                          <Users2 size={28} strokeWidth={1.5} />
                          <p className="text-sm">No employees found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id || emp.id}>
                        <td>
                          <div>
                            <div className="font-medium text-base-content">
                              {emp.personal?.fullName || emp.name}
                            </div>
                            <div className="text-xs opacity-60">
                              {emp.email || emp.contact?.email}
                            </div>
                          </div>
                        </td>
                        <td className="text-base-content/80">
                          {emp.department || emp.professional?.department}
                        </td>
                        <td>
                          <span className="badge badge-info badge-sm whitespace-nowrap uppercase">
                            {(
                              (Array.isArray(emp.roles)
                                ? emp.roles.join(", ")
                                : emp.role) ||
                              emp.professional?.designation ||
                              ""
                            ).toLowerCase()}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success badge-sm whitespace-nowrap">
                            {emp.status || "Active"}
                          </span>
                        </td>
                        <td className="text-sm text-base-content/60">
                          {emp.professional?.dateOfJoining || emp.joinDate
                            ? new Date(
                                emp.professional?.dateOfJoining || emp.joinDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today Attendance */}
          <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-base-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <CalendarClock size={17} />
                </div>
                <h2 className="text-base font-bold text-base-content">
                  Today Attendance
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-success badge-sm whitespace-nowrap">
                  Present: {stats.presentToday}
                </span>
                <span className="badge badge-info badge-sm whitespace-nowrap">
                  On Leave: {stats.onLeaveToday}
                </span>
                <span className="badge badge-error badge-sm whitespace-nowrap">
                  Absent: {stats.absentToday}
                </span>
              </div>
            </div>

            <div className="p-4 max-h-87.5 overflow-y-auto no-scrollbar">
              {attendance.length === 0 ? (
                <div className="flex flex-col items-center gap-2 text-base-content/40 py-12">
                  <CalendarClock size={28} strokeWidth={1.5} />
                  <p className="text-sm">No attendance records.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {attendance.map((emp) => (
                    <li
                      key={emp._id || emp.id}
                      className="flex items-center justify-between bg-base-200 p-3 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-base-content">
                          {emp.name || emp.employee?.name}
                        </p>
                        <p className="text-xs opacity-60">
                          {emp.status === "leave"
                            ? emp.leaveType || "On Leave"
                            : emp.department || emp.employee?.department}
                        </p>
                      </div>
                      <span
                        className={`badge badge-sm whitespace-nowrap shrink-0 ${
                          emp.status?.toLowerCase() === "present"
                            ? "badge-success"
                            : emp.status?.toLowerCase() === "leave"
                              ? "badge-info"
                              : emp.status?.toLowerCase() === "half-day"
                                ? "badge-warning"
                                : "badge-error"
                        }`}
                      >
                        {emp.status === "leave" ? "On Leave" : emp.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HrDashboard;
