import React, { forwardRef } from "react";

const fmt = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const monthYearLabel = (salary) => {
  if (salary?.month && salary?.year) {
    const monthNum = Number(salary.month);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      return new Date(salary.year, monthNum - 1).toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }
    return `${salary.month} ${salary.year}`;
  }
  if (salary?.month) {
    return String(salary.month);
  }
  if (salary?.effectiveFrom) {
    return new Date(salary.effectiveFrom).toLocaleString("en-IN", {
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
      className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-xl bg-white text-slate-800 shadow-[0_10px_35px_-10px_rgba(30,64,175,0.25)] box-border"
    >
      {/* Header */}
      <header
        className="relative px-6 pt-5 pb-0 text-white"
        style={{ background: "linear-gradient(135deg, #0284c7, #075985)" }}
      >
        <div
          className="absolute inset-y-0 right-0 w-1/3 opacity-30"
          style={{
            background: "linear-gradient(135deg, #ea580c, #f59e0b)",
            clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div className="rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
            {logoSrc ? (
              <img src={logoSrc} alt="Technorizen" className="h-9 w-auto" />
            ) : (
              <span className="text-sm font-bold text-slate-800">Technorizen</span>
            )}
          </div>
          <div className="text-right leading-tight">
            <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
              Technorizen Software Solutions Pvt. Ltd.
            </h1>
            <p className="mt-0.5 text-[11px] text-white/90">
              402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.) 452002
            </p>
            <p className="text-[11px] font-medium text-white/95">
              www.technorizen.com
            </p>
          </div>
        </div>
        <div className="relative mt-3.5 -mx-6 flex items-center justify-between border-t border-white/20 bg-black/15 px-6 py-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white sm:text-sm">
            Salary Slip
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/80">Month:</span>
            <span className="rounded border border-white/30 bg-white/10 px-2 py-0.5 font-medium text-white">
              {monthYearLabel(salary)}
            </span>
          </div>
        </div>
      </header>

      {/* Employee Details */}
      <Section title="Employee Details">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {employeeFields.map((f) => (
            <Field key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </Section>

      {/* Earnings & Deductions */}
      <Section title="Earnings & Deductions" accent="orange">
        <div className="grid grid-cols-2 gap-3.5">
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
            minRows={7}
          />
        </div>
      </Section>

      {/* Net Salary */}
      <Section title="Net Salary">
        <div className="overflow-hidden rounded-lg border border-[#dbe4ee]">
          <SummaryRow label="Gross Salary" value={fmt(grossEarnings)} />
          <SummaryRow label="Less: Total Deductions" value={fmt(totalDeductions)} />
          <div
            className="flex items-center justify-between px-4 py-2.5 text-white"
            style={{ background: "linear-gradient(135deg, #0284c7, #075985)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              Net Salary / In-Hand
            </span>
            <span className="text-lg font-bold tabular-nums sm:text-xl">
              ₹ {fmt(netSalary)}
            </span>
          </div>
        </div>
      </Section>

      {/* Signature & Footer */}
      <section className="px-6 pt-2 pb-5 sm:px-7 sm:pb-6">
        <div className="flex justify-end pt-4">
          <div className="w-48 text-center sm:w-56">
            <div className="h-px bg-[#172033]/40" />
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
              Employer Signature
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-[#64748b]">
          This is a system-generated salary slip — Technorizen
        </p>
      </section>
    </article>
  );
});

export default SalarySlipDocument;

function Section({ title, children, accent = "blue" }) {
  return (
    <section className="px-6 py-2.5 sm:px-7 sm:py-3">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          className="block h-4 w-1 rounded-full"
          style={{
            background:
              accent === "blue"
                ? "linear-gradient(135deg, #0284c7, #075985)"
                : "linear-gradient(135deg, #ea580c, #f59e0b)",
          }}
        />
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#172033]">
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
    <div className="flex items-baseline gap-2 text-xs">
      <span className="w-28 shrink-0 text-[#64748b]">{label}</span>
      <span className="flex-1 border-b border-dashed border-[#dbe4ee] px-1 py-0.5 font-medium text-[#172033]">
        {value || value === 0 ? value : "—"}
      </span>
    </div>
  );
}

function SlipTable({ title, color, rows, values, totalLabel, total, minRows = 0 }) {
  const bg =
    color === "blue"
      ? "linear-gradient(135deg, #0284c7, #075985)"
      : "linear-gradient(135deg, #ea580c, #f59e0b)";

  // Fill empty rows if needed so both tables have equal height side-by-side
  const extraRowsNeeded = Math.max(0, minRows - rows.length);
  const extraRows = Array.from({ length: extraRowsNeeded });

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-lg border border-[#dbe4ee]">
      <div>
        <div
          className="flex items-center justify-between px-3.5 py-1.5 text-white"
          style={{ background: bg }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/85">
            Amount (₹)
          </span>
        </div>
        <ul className="divide-y divide-[#dbe4ee]">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-2 px-3.5 py-1 text-xs">
              <span className="text-[#172033]/90">{r.label}</span>
              <span className="w-24 rounded bg-[#f1f5f9]/60 px-1.5 py-0.5 text-right font-medium tabular-nums text-[#172033]">
                {fmt(values[r.key])}
              </span>
            </li>
          ))}
          {extraRows.map((_, i) => (
            <li key={`empty-${i}`} className="flex items-center justify-between gap-2 px-3.5 py-1 text-xs text-transparent select-none">
              <span>—</span>
              <span className="w-24 px-1.5 py-0.5 text-right">—</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between border-t-2 border-[#172033]/10 bg-[#f1f5f9]/60 px-3.5 py-1.5 text-xs">
        <span className="font-semibold text-[#172033]">{totalLabel}</span>
        <span className="font-bold tabular-nums text-[#172033]">{fmt(total)}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#dbe4ee] bg-white px-4 py-1.5 text-xs">
      <span className="text-[#172033]/90">{label}</span>
      <span className="font-semibold tabular-nums text-[#172033]">₹ {value}</span>
    </div>
  );
}

