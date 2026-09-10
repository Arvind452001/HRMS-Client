// EmployeePanel.jsx
import React, { useEffect, useState } from "react";
import SalaryTable from "../../Employee-Component/SalaryTable";
import { getMySalary } from "../../../api/Salary.Api";

const PayrollSalary = () => {
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMySalary();
      const data = res?.data?.data || [];
      setSalaries(data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Employee Salaries</h2>
      <SalaryTable salaries={salaries} />
    </div>
  );
};


export default PayrollSalary
