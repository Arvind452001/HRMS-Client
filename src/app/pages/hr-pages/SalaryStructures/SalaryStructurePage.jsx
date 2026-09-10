// SalaryStructurePage.jsx (Parent Component)
import { useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import SalaryStructureForm from "./SalaryStructureForm";
import SalaryStructureTable from "./SalaryStructureTable";
import {
  getSalaryStructureByIdHR,
  createSalaryStructureHR,
  updateSalaryStructureHR,
} from "../../../../api/Salary.Api";
import { getAllEmployeesApi } from "../../../../api/employee-Api";
import Swal from "sweetalert2";
import { showError } from "../../../../utils/alert";

function SalaryStructureFormWrapper({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  employee: "",
  effectiveFrom: "",
  basicSalary: "",
  hra: "",
  conveyanceAllowance: "",
  medicalAllowance: "",
  specialAllowance: "",
  bonus: "",
  professionalTax: "",
});

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const isView = mode === "view";
  const isEdit = mode === "edit";

  // Load employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployeesApi();
        // Salary structures only support employees from the classic
        // "OldEmployee" directory — see AddSalaryPage.jsx for details.
        const allEmployees = res?.data || [];
        const eligible = allEmployees.filter(
          (emp) => emp.employeeType !== "new",
        );
        setEmployees(eligible);
      } catch (error) {
        console.error(error);
        showError("Error", "Failed to load employees");
        console.error(error);
      }
    };
    fetchEmployees();
  }, []);

  // Load salary data for edit/view
  useEffect(() => {
    if ((isEdit || isView) && id) {
      const fetchSalary = async () => {
        try {
          const res = await getSalaryStructureByIdHR(id);
          const salaryData = res?.data?.data || {};
          if (salaryData.effectiveFrom) {
            salaryData.effectiveFrom = salaryData.effectiveFrom.split("T")[0];
          }
          setFormData({
            employee: salaryData.employee?._id || salaryData.employee || "",
            effectiveFrom: salaryData.effectiveFrom || "",
            basicSalary: salaryData.basicSalary || 0,
            hra: salaryData.hra || 0,
            conveyanceAllowance: salaryData.conveyanceAllowance || 0,
            medicalAllowance: salaryData.medicalAllowance || 0,
            specialAllowance: salaryData.specialAllowance || 0,
            bonus: salaryData.bonus || 0,
            professionalTax: salaryData.professionalTax || 0,
          });
        } catch (error) {
          console.error(error);
          showError("Error", "Failed to load salary structure");
          navigate("/hr/salary-structure");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchSalary();
    } else {
      setInitialLoading(false);
    }
  }, [id, isEdit, isView, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: isEdit ? "Update Salary Structure?" : "Create Salary Structure?",
      text: isEdit
        ? "Are you sure you want to update this salary structure?"
        : "Are you sure you want to create this salary structure?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEdit ? "Yes, Update" : "Yes, Create",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      // Convert all numeric fields to numbers before sending
      const submitData = {
        ...formData,
        basicSalary: Number(formData.basicSalary) || 0,
        hra: Number(formData.hra) || 0,
        conveyanceAllowance: Number(formData.conveyanceAllowance) || 0,
        medicalAllowance: Number(formData.medicalAllowance) || 0,
        specialAllowance: Number(formData.specialAllowance) || 0,
        bonus: Number(formData.bonus) || 0,
        professionalTax: Number(formData.professionalTax) || 0,
      };
      if (isEdit) {
        await updateSalaryStructureHR(id, submitData);
      } else {
        await createSalaryStructureHR(submitData);
      }

      await Swal.fire({
        title: "Success!",
        text: isEdit
          ? "Salary structure updated successfully."
          : "Salary structure created successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      navigate("/hr/salary-structure");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          (isEdit
            ? "Failed to update salary structure."
            : "Failed to create salary structure."),
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <SalaryStructureForm
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      employees={employees}
      loading={loading}
      isView={isView}
      isEdit={isEdit}
    />
  );
}

export default function SalaryStructurePage() {
  return (
    <Routes>
      <Route index element={<SalaryStructureTable />} />
      <Route path="add" element={<SalaryStructureFormWrapper mode="create" />} />
      <Route path="edit/:id" element={<SalaryStructureFormWrapper mode="edit" />} />
      <Route path="view/:id" element={<SalaryStructureFormWrapper mode="view" />} />
    </Routes>
  );
}