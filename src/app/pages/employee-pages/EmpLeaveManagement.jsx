import React, { useState } from "react";
import LeaveForm from "../../Employee-Component/LeaveForm";
import LeaveTable from "../../Employee-Component/LeaveTable";
import { ArrowLeft, ChevronLeft } from "lucide-react";

const EmpLeaveManagement = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen p-3 md:p-6">
      {/* CONTAINER */}
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm p-4 md:p-6 border border-white/40">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            {/* ⬅ BUTTON (only when form open) */}
            {showForm && (
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-full bg-gray-200 "
              >
                <ChevronLeft className="hover:cursor-pointer" size={16} />
              </button>
            )}

            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Leave Management
            </h1>
          </div>

          {/* APPLY BUTTON (only when table visible) */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-sky-500 px-4 py-2 text-white rounded-lg shadow hover:opacity-90 whitespace-nowrap"
            >
              Apply Leave
            </button>
          )}
        </div>

        {/* CONTENT */}
        {showForm ? (
          <div className="flex justify-center">
            {/* width control + center */}
            <div className="w-full max-w-2xl">
              <LeaveForm />
            </div>
          </div>
        ) : (
          <LeaveTable />
        )}
      </div>
    </div>
  );
};

export default EmpLeaveManagement;
