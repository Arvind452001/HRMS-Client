import { Link } from "react-router-dom";
import EmployeeSalaryTable from "./EmployeeSalaryTable";
// import SalarySlipDisplay from "./SalarySlipDisplay";

export default function SalaryDashboard() {
  return (
    <div>
     
      <div className="">
        {/* <SalarySlipDisplay/> */}
        <EmployeeSalaryTable />
      </div>
    </div>
  );
}
