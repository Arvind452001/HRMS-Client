import React, { useState } from "react";
import LeaveForm from "../../Employee-Component/LeaveForm";
import LeaveTable from "../../Employee-Component/LeaveTable";
import { ChevronLeft, Plus, Calendar } from "lucide-react";

const EmpLeaveManagement = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-full min-h-screen p-3 sm:p-5 md:p-6 space-y-5">
      {/* PAGE HEADER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showForm && (
            <button
              onClick={() => setShowForm(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Back to table"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
            <Calendar size={20} />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {showForm ? "Apply for Leave" : "Leave Management"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {showForm
                ? "Fill in the details below to submit your leave application."
                : "View your submitted leave applications, tracking status and approval stages."}
            </p>
          </div>
        </div>

        {/* APPLY BUTTON */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 px-4 py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Apply Leave</span>
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div>
        {showForm ? (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <LeaveForm onSuccess={() => setShowForm(false)} />
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
