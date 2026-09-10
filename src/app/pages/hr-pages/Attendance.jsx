import React from "react";
import AttendanceLog from "../../HR-component/attendance-management/AttendanceLog";
import EmployeesLeaveManagement from "../../HR-component/attendance-management/EmployeesLeaveManagement";
import CompanyStatsCard from "../../HR-component/attendance-management/CompanyStatsCard";

const Attendance = () => {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-stretch mb-4 gap-4">
        <div className="w-full lg:w-1/2 flex">
          <CompanyStatsCard />
        </div>
        <div className="w-full lg:w-1/2 flex">
          <EmployeesLeaveManagement />
        </div>
      </div>

      <AttendanceLog />
    </div>
  );
};

export default Attendance;
