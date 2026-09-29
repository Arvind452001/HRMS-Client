import {
  User,
  Phone,
  MapPin,
  Briefcase,
  IdCard,
  KeyRound,
  Landmark,
  FileText,
  ClipboardCheck,
} from "lucide-react";

export const MAX_FILE_SIZE_MB = 2;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const steps = [
  { label: "Personal", icon: User },
  { label: "Contact", icon: Phone },
  { label: "Address", icon: MapPin },
  { label: "Professional", icon: Briefcase },
  { label: "Identification", icon: IdCard },
  { label: "Login Details", icon: KeyRound },
  { label: "Bank", icon: Landmark },
  { label: "Documents", icon: FileText },
  { label: "Summary", icon: ClipboardCheck },
];

export const defaultValues = {
  personal: {
    fullName: "",
    fatherName: "",
    motherName: "",
    gender: "",
    maritalStatus: "",
    dob: "",
    nationality: "",
    bloodGroup: "",
    profilePhoto: null,
  },
  contact: {
    primaryPhone: "",
    alternatePhone: "",
    personalEmail: "",
    emergencyContact: { name: "", relation: "", phone: "" },
  },
  address: {
    current: { address: "", city: "", state: "", country: "", pincode: "" },
    permanent: { address: "", city: "", state: "", country: "", pincode: "" },
  },
  professional: {
    employeeId: "",
    department: "",
    designation: "",
    employmentType: "",
    status: "Active",
    dateOfJoining: "",
    weekOffPolicy: "FIRST_THIRD",
  },
  identification: { aadhaarNo: "", pan: "", esic: "", uan: "", idNo: "" },
  account: {
    officialEmail: "",
    officialPassword: "",
    teamsId: "",
    teamsPassword: "",
    loginPassword: "",
  },
  bank: {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
  },
  documents: {
    aadharCard: null,
    panCard: null,
    resume: null,
    education: null,
    experience: null,
    offerLetter: null,
  },
};

const toDateInput = (val) => {
  if (!val) return "";
  const str = typeof val === "string" ? val : new Date(val).toISOString();
  return str.slice(0, 10);
};

export const buildInitialValues = (employee) => {
  if (!employee) return defaultValues;
  return {
    personal: {
      ...defaultValues.personal,
      ...employee.personal,
      dob: toDateInput(employee.personal?.dob),
    },
    contact: {
      ...defaultValues.contact,
      ...employee.contact,
      emergencyContact: {
        ...defaultValues.contact.emergencyContact,
        ...employee.contact?.emergencyContact,
      },
    },
    address: {
      current: {
        ...defaultValues.address.current,
        ...employee.address?.current,
      },
      permanent: {
        ...defaultValues.address.permanent,
        ...employee.address?.permanent,
      },
    },
    professional: {
      ...defaultValues.professional,
      ...employee.professional,
      dateOfJoining: toDateInput(employee.professional?.dateOfJoining),
    },
    identification: {
      ...defaultValues.identification,
      ...employee.identification,
    },
    account: { ...defaultValues.account, ...employee.account },
    bank: { ...defaultValues.bank, ...employee.bank },
    documents: { ...defaultValues.documents, ...employee.documents },
  };
};
