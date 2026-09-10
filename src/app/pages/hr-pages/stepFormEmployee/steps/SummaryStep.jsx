import React from "react";
import { useFormContext } from "react-hook-form";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  IdCard,
  KeyRound,
  Landmark,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function SummaryCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-base-content sm:text-base">
          {title}
        </h3>
      </div>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-base-200 py-1 last:border-none">
      <dt className="text-base-content/50">{label}</dt>
      <dd className="text-right font-medium text-base-content">{value}</dd>
    </div>
  );
}

export default function SummaryStep() {
  const { getValues } = useFormContext();
  const data = getValues();

  const show = (val) => val || "-";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Summary</h2>
        <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
          Review everything before submitting the registration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Personal */}
        <SummaryCard icon={User} title="Personal">
          <Row label="Name" value={show(data.personal?.fullName)} />
          <Row label="Father" value={show(data.personal?.fatherName)} />
          <Row label="Mother" value={show(data.personal?.motherName)} />
          <Row label="Gender" value={show(data.personal?.gender)} />
          <Row label="DOB" value={show(data.personal?.dob)} />
          <Row label="Nationality" value={show(data.personal?.nationality)} />
        </SummaryCard>

        {/* Contact */}
        <SummaryCard icon={Phone} title="Contact">
          <Row label="Phone" value={show(data.contact?.primaryPhone)} />
          <Row label="Alternate" value={show(data.contact?.alternatePhone)} />
          <Row label="Email" value={show(data.contact?.personalEmail)} />
        </SummaryCard>

        {/* Address */}
        <SummaryCard icon={MapPin} title="Address">
          <Row label="City" value={show(data.address?.current?.city)} />
          <Row label="State" value={show(data.address?.current?.state)} />
          <Row label="Country" value={show(data.address?.current?.country)} />
          <Row label="Pincode" value={show(data.address?.current?.pincode)} />
        </SummaryCard>

        {/* Professional */}
        <SummaryCard icon={Briefcase} title="Professional">
          <Row
            label="Employee ID"
            value={show(data.professional?.employeeId)}
          />
          <Row label="Department" value={show(data.professional?.department)} />
          <Row
            label="Designation"
            value={show(data.professional?.designation)}
          />
          <Row label="Type" value={show(data.professional?.employmentType)} />
          <Row label="Status" value={show(data.professional?.status)} />
        </SummaryCard>

        {/* Identification */}
        <SummaryCard icon={IdCard} title="Identification">
          <Row
            label="Aadhaar No."
            value={show(data.identification?.aadhaarNo)}
          />
          <Row label="PAN" value={show(data.identification?.pan)} />
          <Row label="ESIC" value={show(data.identification?.esic)} />
          <Row label="UAN" value={show(data.identification?.uan)} />
          <Row label="ID No." value={show(data.identification?.idNo)} />
        </SummaryCard>

        {/* Login Details */}
        <SummaryCard icon={KeyRound} title="Login Details">
          <Row
            label="Official Email"
            value={show(data.account?.officialEmail)}
          />
          <Row label="Teams ID" value={show(data.account?.teamsId)} />
          <Row label="Login Password" value="******" />
        </SummaryCard>

        {/* Bank */}
        <SummaryCard icon={Landmark} title="Bank">
          <Row
            label="Account Holder"
            value={show(data.bank?.accountHolderName)}
          />
          <Row label="Bank" value={show(data.bank?.bankName)} />
          <Row label="Account No" value={show(data.bank?.accountNumber)} />
          <Row label="IFSC" value={show(data.bank?.ifscCode)} />
          <Row label="Branch" value={show(data.bank?.branch)} />
        </SummaryCard>
      </div>

      {/* Documents */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-base-content sm:text-base">
            Documents
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(data.documents || {}).map(([key, value]) => (
            <span
              key={key}
              className={`badge gap-1 py-3 ${value ? "badge-success badge-outline" : "badge-error badge-outline"}`}
            >
              {value ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
