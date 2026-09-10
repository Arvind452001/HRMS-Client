import React, { forwardRef } from "react";

const fmt = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const monthYearLabel = (salary) => {
  if (salary?.effectiveFrom) {
    return new Date(salary.effectiveFrom).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }
  if (salary?.month && salary?.year) {
    return new Date(salary.year, salary.month - 1).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }
  return "—";
};

/**
 * SalarySlipDocument — the one salary-slip layout used everywhere it's
 * shown or downloaded (HR's per-employee slip page, and the employee's
 * own payslip). Forwards a ref to the outer element so callers can hand
 * that node to utils/pdf.js's generatePdfFromNode for a real PDF download.
 *
 * Props:
 *  - employee: { name, employeeId, designation, department, dateOfJoining, paidDays, leaveDays }
 *  - salary: the raw salary record (basic, hra, da, conveyanceAllowance,
 *    medicalAllowance, specialAllowance, bonus, pf, esi, professionalTax,
 *    leaveDeduction, otherDeduction, effectiveFrom / month+year)
 *  - logoSrc: company logo image
 */
const SalarySlipDocument = forwardRef(function SalarySlipDocument(
  { employee = {}, salary = {}, logoSrc },
  ref
) {
  const earnings = {
    basic: salary.basic || 0,
    hra: salary.hra || 0,
    da: salary.da || 0,
    conveyance: salary.conveyanceAllowance || 0,
    medical: salary.medicalAllowance || 0,
    special: salary.specialAllowance || 0,
    bonus: salary.bonus || 0,
  };

  const deductions = {
    pf: salary.pf || 0,
    esic: salary.esi || 0,
    pt: salary.professionalTax || 0,
    leave: salary.leaveDeduction || 0,
    other: salary.otherDeduction || 0,
  };

  const grossEarnings = Object.values(earnings).reduce((s, v) => s + Number(v), 0);
  const totalDeductions = Object.values(deductions).reduce((s, v) => s + Number(v), 0);
  const netSalary = salary.netSalary ?? grossEarnings - totalDeductions;

  const employeeFields = [
    { label: "Employee Name", value: employee.name },
    { label: "Employee ID", value: employee.employeeId },
    { label: "Designation", value: employee.designation },
    { label: "Department", value: employee.department },
    { label: "Date of Joining", value: employee.dateOfJoining },
    { label: "Paid Days", value: employee.paidDays },
    { label: "Leave Days", value: employee.leaveDays },
  ];

  return (
    <article
      id="salary-slip"
      ref={ref}
      className="mx-auto w-full max-w-[21cm] overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-20px_rgba(30,64,175,0.35)]"
    >
      {/* Header */}
      <header
        className="relative px-6 pt-6 pb-0 text-white sm:px-8 sm:pt-7"
        style={{ background: "linear-gradient(135deg, #0284c7, #075985)" }}
      >
        <div
          className="absolute inset-y-0 right-0 w-1/3 opacity-30"
          style={{
            background: "linear-gradient(135deg, #ea580c, #f59e0b)",
            clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-lg bg-white/95 px-4 py-2.5 shadow-sm">
            {logoSrc ? (
              <img src={logoSrc} alt="Technorizen" className="h-10 w-auto sm:h-12" />
            ) : (
              <span className="text-sm font-bold text-slate-800">Technorizen</span>
            )}
          </div>
          <div className="text-right leading-tight">
            <h1 className="text-base font-bold tracking-tight sm:text-lg md:text-xl">
              Technorizen Software Solutions Pvt. Ltd.
            </h1>
            <p className="mt-1 text-[11px] text-white/85 sm:text-xs">
              402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.) 452002
            </p>
            <p className="text-[11px] font-medium text-white/95 sm:text-xs">
              www.technorizen.com
            </p>
          </div>
        </div>
        <div className="relative mt-5 -mx-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/20 bg-black/15 px-6 py-3 sm:-mx-8 sm:px-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] sm:text-base md:text-lg">
            Salary Slip
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-white/80">Month:</span>
            <span className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-white">
              {monthYearLabel(salary)}
            </span>
          </div>
        </div>
      </header>

      {/* Employee Details */}
      <Section title="Employee Details">
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {employeeFields.map((f) => (
            <Field key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </Section>

      {/* Earnings & Deductions */}
      <Section title="Earnings & Deductions" accent="orange">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SlipTable
            title="Earnings"
            color="blue"
            rows={[
              { label: "Basic Salary", key: "basic" },
              { label: "House Rent Allowance (HRA)", key: "hra" },
              { label: "Dearness Allowance (DA)", key: "da" },
              { label: "Conveyance Allowance", key: "conveyance" },
              { label: "Medical Allowance", key: "medical" },
              { label: "Special Allowance", key: "special" },
              { label: "Bonus / Incentive", key: "bonus" },
            ]}
            values={earnings}
            totalLabel="Gross Earnings"
            total={grossEarnings}
          />
          <SlipTable
            title="Deductions"
            color="orange"
            rows={[
              { label: "Provident Fund (PF)", key: "pf" },
              { label: "ESIC", key: "esic" },
              { label: "Professional Tax (PT)", key: "pt" },
              { label: "Leave Deduction", key: "leave" },
              { label: "Other Deduction", key: "other" },
            ]}
            values={deductions}
            totalLabel="Total Deductions"
            total={totalDeductions}
          />
        </div>
      </Section>

      {/* Net Salary */}
      <Section title="Net Salary">
        <div className="overflow-hidden rounded-xl border border-[#dbe4ee]">
          <SummaryRow label="Gross Salary" value={fmt(grossEarnings)} />
          <SummaryRow label="Less: Total Deductions" value={fmt(totalDeductions)} />
          <div
            className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-white"
            style={{ background: "linear-gradient(135deg, #0284c7, #075985)" }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider">
              Net Salary / In-Hand
            </span>
            <span className="text-xl font-bold sm:text-2xl">₹ {fmt(netSalary)}</span>
          </div>
        </div>
      </Section>

      {/* Signature & Footer */}
      <section className="px-6 pb-8 pt-2 sm:px-8 sm:pb-10">
        <div className="flex justify-end pt-10 sm:pt-12">
          <div className="w-52 text-center sm:w-64">
            <div className="h-px bg-[#172033]/40" />
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#64748b]">
              Employer Signature
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-[#64748b] sm:mt-10">
          This is a system-generated salary slip — Technorizen
        </p>
      </section>
    </article>
  );
});

export default SalarySlipDocument;

function Section({ title, children, accent = "blue" }) {
  return (
    <section className="px-6 py-5 sm:px-8 sm:py-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="block h-5 w-1.5 rounded-full"
          style={{
            background:
              accent === "blue"
                ? "linear-gradient(135deg, #0284c7, #075985)"
                : "linear-gradient(135deg, #ea580c, #f59e0b)",
          }}
        />
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#172033]">
          {title}
        </h3>
        <div className="h-px flex-1 bg-[#dbe4ee]" />
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <label className="flex items-baseline gap-3">
      <span className="w-36 shrink-0 text-sm text-[#64748b] sm:w-40">{label}</span>
      <span className="flex-1 border-b border-dashed border-[#dbe4ee]/80 px-1 py-1 text-sm text-[#172033]">
        {value || value === 0 ? value : "—"}
      </span>
    </label>
  );
}

function SlipTable({ title, color, rows, values, totalLabel, total }) {
  const bg =
    color === "blue"
      ? "linear-gradient(135deg, #0284c7, #075985)"
      : "linear-gradient(135deg, #ea580c, #f59e0b)";
  return (
    <div className="overflow-hidden rounded-xl border border-[#dbe4ee]">
      <div
        className="flex items-center justify-between px-4 py-2.5 text-white"
        style={{ background: bg }}
      >
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-white/80">
          Amount (₹)
        </span>
      </div>
      <ul className="divide-y divide-[#dbe4ee]">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="text-sm text-[#172033]/90">{r.label}</span>
            <span className="w-28 rounded border border-transparent bg-[#f1f5f9]/60 px-2 py-1 text-right text-sm tabular-nums">
              {fmt(values[r.key])}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t-2 border-[#172033]/10 bg-[#f1f5f9]/40 px-4 py-2.5">
        <span className="text-sm font-semibold text-[#172033]">{totalLabel}</span>
        <span className="text-sm font-bold tabular-nums text-[#172033]">{fmt(total)}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#dbe4ee] bg-white px-5 py-3">
      <span className="text-sm text-[#172033]/90">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-[#172033]">₹ {value}</span>
    </div>
  );
}
