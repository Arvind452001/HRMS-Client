import React, { useEffect, useState } from "react";
import { getProfileApi } from "../../../api/auth-Api";
import { showError } from "../../../utils/alert";
import DocumentModal from "../../HR-component/model/DocumentModal";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  IdCard,
  Lock,
  Landmark,
  FileText,
  Loader2,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";

const DOC_LABELS = {
  aadharCard: "Aadhar Card",
  panCard: "PAN Card",
  resume: "Resume",
  education: "Education Certificates",
  experience: "Experience Letters",
  offerLetter: "Offer Letter",
};

const getDocLabel = (key) =>
  DOC_LABELS[key] ||
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default function MyProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();
        setData(res.data);
      } catch (err) {
        console.error(err);
        showError("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!data) return null;

  const show = (val) => val || "—";
  const currentStatus = data.professional?.status?.toLowerCase()?.trim();

  let indicatorColor = "bg-emerald-500";
  if (currentStatus === "inactive") indicatorColor = "bg-amber-500";
  else if (currentStatus === "resigned") indicatorColor = "bg-rose-500";

  const cardStyle =
    "bg-slate-50 border border-slate-300/80 rounded-xl shadow-sm overflow-hidden";
  const headerStyle =
    "px-4 py-3 border-b border-slate-200 flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider";

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-100 min-h-screen text-slate-700 antialiased">
      {/* HEADER PROFILE CARD */}
      <div className={`${cardStyle} p-6 bg-slate-50`}>
        <div className="flex flex-col items-center justify-center text-center sm:flex-row sm:text-left sm:items-start sm:justify-start gap-5">
          {/* Avatar Area */}
          <div className="relative shrink-0">
            <img
              src={data.personal?.profilePhoto}
              alt="profile"
              className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-300 shadow-sm"
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${indicatorColor}`}
            />
          </div>

          {/* Details Area */}
          <div className="space-y-1.5 flex flex-col items-center sm:items-start">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight capitalize">
              {data.personal?.fullName}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Employee ID: {data.professional?.employeeId}
            </p>
            <div className="pt-1">
              <span className="bg-sky-600 text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                {Array.isArray(data.roles) ? data.roles.join(" • ") : data.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Information grid; items-start keeps cards sized to their own content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* PERSONAL INFO */}
        <div className={`${cardStyle}`}>
          <div className={`${headerStyle} bg-sky-100/70 border-sky-200/60`}>
            <User className="w-4 h-4 text-sky-700" />
            <h3 className="text-sky-900">Personal Info</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white">
            <div>
              <span className="text-slate-500 text-xs block">Full Name</span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.fullName)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Father's Name
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.fatherName)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Mother's Name
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.motherName)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Gender</span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.gender)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Marital Status
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.maritalStatus)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Date of Birth
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.dob?.slice(0, 10))}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Nationality</span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.nationality)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Blood Group</span>
              <span className="font-semibold text-slate-800">
                {show(data.personal?.bloodGroup)}
              </span>
            </div>
          </div>
        </div>

        {/* CONTACT DETAILS */}
        <div className={`${cardStyle}`}>
          <div
            className={`${headerStyle} bg-indigo-100/70 border-indigo-200/60`}
          >
            <Phone className="w-4 h-4 text-indigo-700" />
            <h3 className="text-indigo-900">Contact Details</h3>
          </div>
          <div className="p-4 space-y-4 text-sm bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 text-xs block">
                  Primary Phone
                </span>
                <span className="font-semibold text-slate-800">
                  {show(data.contact?.primaryPhone)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">
                  Alternate Phone
                </span>
                <span className="font-semibold text-slate-800">
                  {show(data.contact?.alternatePhone)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Personal Email
              </span>
              <span className="font-semibold text-slate-800 break-all">
                {show(data.contact?.personalEmail)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="font-semibold text-amber-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                Emergency Contact
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Name</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {show(data.contact?.emergencyContact?.name)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    Relation
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {show(data.contact?.emergencyContact?.relation)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    Phone
                  </span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {show(data.contact?.emergencyContact?.phone)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADDRESSES */}
        <div className={`${cardStyle}`}>
          <div
            className={`${headerStyle} bg-emerald-100/70 border-emerald-200/60`}
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h3 className="text-emerald-900">Addresses</h3>
          </div>
          <div className="p-4 space-y-3.5 text-sm bg-white">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block mb-1">
                Current Address
              </span>
              <p className="font-semibold text-slate-800">
                {show(data.address?.current?.address)}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {show(data.address?.current?.city)},{" "}
                {show(data.address?.current?.state)},{" "}
                {show(data.address?.current?.country)} -{" "}
                <span className="font-bold text-slate-700">
                  {show(data.address?.current?.pincode)}
                </span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block mb-1">
                Permanent Address
              </span>
              <p className="font-semibold text-slate-800">
                {show(data.address?.permanent?.address)}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {show(data.address?.permanent?.city)},{" "}
                {show(data.address?.permanent?.state)},{" "}
                {show(data.address?.permanent?.country)} -{" "}
                <span className="font-bold text-slate-700">
                  {show(data.address?.permanent?.pincode)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* PROFESSIONAL METRICS */}
        <div className={`${cardStyle}`}>
          <div className={`${headerStyle} bg-teal-100/70 border-teal-200/60`}>
            <Briefcase className="w-4 h-4 text-teal-700" />
            <h3 className="text-teal-900">Professional</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white">
            <div>
              <span className="text-slate-500 text-xs block">Employee ID</span>
              <span className="font-semibold text-slate-800">
                {show(data.professional?.employeeId)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Department</span>
              <span className="font-semibold text-slate-800">
                {show(data.professional?.department)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Designation</span>
              <span className="font-semibold text-slate-800">
                {show(data.professional?.designation)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Employment Type
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.professional?.employmentType)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block mb-0.5">
                Status
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border font-semibold ${
                  currentStatus === "resigned"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : currentStatus === "inactive"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {show(data.professional?.status)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block font-medium">
                Date of Joining
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.professional?.dateOfJoining?.slice(0, 10))}
              </span>
            </div>
          </div>
        </div>

        {/* IDENTIFICATION SCHEME */}
        <div className={`${cardStyle}`}>
          <div className={`${headerStyle} bg-rose-100/70 border-rose-200/60`}>
            <IdCard className="w-4 h-4 text-rose-700" />
            <h3 className="text-rose-900">Identification</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white">
            <div>
              <span className="text-slate-500 text-xs block">Aadhaar No.</span>
              <span className="font-semibold text-slate-800">
                {show(data.identification?.aadhaarNo)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">PAN</span>
              <span className="font-semibold text-slate-800 uppercase">
                {show(data.identification?.pan)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">ESIC No.</span>
              <span className="font-semibold text-slate-800">
                {show(data.identification?.esic)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">UAN</span>
              <span className="font-semibold text-slate-800">
                {show(data.identification?.uan)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Internal ID No.
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.identification?.idNo)}
              </span>
            </div>
          </div>
        </div>

        {/* ACCOUNT CREDENTIALS */}
        <div className={`${cardStyle}`}>
          <div className={`${headerStyle} bg-amber-100/70 border-amber-200/60`}>
            <Lock className="w-4 h-4 text-amber-700" />
            <h3 className="text-amber-900">Account Credentials</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white">
            <div>
              <span className="text-slate-500 text-xs block">
                Official Email
              </span>
              <span className="font-semibold text-slate-800 break-all">
                {show(data.account?.officialEmail)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Email Password
              </span>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200 rounded inline-block mt-0.5">
                {show(data.account?.officialPassword)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Teams ID</span>
              <span className="font-semibold text-slate-800 break-all">
                {show(data.account?.teamsId)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Teams Password
              </span>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200 rounded inline-block mt-0.5">
                {show(data.account?.teamsPassword)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block mb-0.5">
                Login Password
              </span>
              {data.hasLoginPassword ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                  ✓ Set
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border font-semibold bg-rose-50 text-rose-700 border-rose-200">
                  Not Set
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BANKING STRUCTURE */}
        <div className={`${cardStyle}`}>
          <div
            className={`${headerStyle} bg-violet-100/70 border-violet-200/60`}
          >
            <Landmark className="w-4 h-4 text-violet-700" />
            <h3 className="text-violet-900">Bank Details</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white">
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-xs block">
                Account Holder Name
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.bank?.accountHolderName)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Bank Name</span>
              <span className="font-semibold text-slate-800">
                {show(data.bank?.bankName)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Account Number
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {show(data.bank?.accountNumber)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">IFSC Code</span>
              <span className="font-mono font-semibold text-slate-800 uppercase">
                {show(data.bank?.ifscCode)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">
                Branch Office
              </span>
              <span className="font-semibold text-slate-800">
                {show(data.bank?.branch)}
              </span>
            </div>
          </div>
        </div>

        {/* INTERNAL DOCUMENTS */}
        <div className={`${cardStyle}`}>
          <div
            className={`${headerStyle} bg-fuchsia-100/70 border-fuchsia-200/60`}
          >
            <FileText className="w-4 h-4 text-fuchsia-700" />
            <h3 className="text-fuchsia-900">Internal Documents</h3>
          </div>
          <div className="p-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(data.documents || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-w-0"
                >
                  <span
                    className="text-slate-700 text-xs font-semibold tracking-wide truncate"
                    title={getDocLabel(key)}
                  >
                    {getDocLabel(key)}
                  </span>
                  {val ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewDoc({ label: getDocLabel(key), url: val })
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  ) : (
                    <span className="shrink-0 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW POPUP */}
      <DocumentModal
        url={previewDoc?.url}
        label={previewDoc?.label}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
