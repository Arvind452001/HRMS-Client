import {
  LayoutGrid,
  User,
  CalendarCheck,
  Calendar,
  Wallet,
  Briefcase,
  Target,
  Banknote,
  Users,
  BarChart2,
  ShieldCheck,
  BriefcaseBusiness,
  Settings,
  FileText,
} from "lucide-react";

// Sidebar menu items per role
export const menu = {
  hr: [
    { name: "Dashboard", icon: LayoutGrid, path: "" }, // index route
    { name: "Employees", icon: Users, path: "employees" },
    { name: "Visitors", icon: Users, path: "VisitorsPage" },
    { name: "Candidate Resumes", icon: FileText, path: "resume-bank" },
    { name: "Job Post", icon: Briefcase, path: "job-post" },
    { name: "Applications", icon: Target, path: "Applications" },
    { name: "Attendance Management", icon: CalendarCheck, path: "attendance" },
    { name: "Salary", icon: Banknote, path: "salary" },
    { name: "Salary Structures", icon: BarChart2, path: "salary-structure" },
    { name: "Leave Management", icon: Calendar, path: "leave" },
    { name: "Company Policy", icon: ShieldCheck, path: "company-policy" },
    { name: "Support", icon: Settings, path: "support-history" },
    {
      name: "Lovable",
      icon: Target,
      path: "https://payment-slip.lovable.app/",
      external: true,
    },
  ],

  employee: [
    { name: "Dashboard", icon: LayoutGrid, path: "" }, // index route
    { name: "My Profile", icon: User, path: "myProfile" },
    { name: "Attendance", icon: CalendarCheck, path: "attendance" },
    { name: "My Interviews", icon: BriefcaseBusiness, path: "my-interviews" },
    { name: "Leave Management", icon: Calendar, path: "leaveManagement" },
    { name: "Payroll & Salary", icon: Wallet, path: "payroll-salary" }, // avoid & in URL
    { name: "Company Policies", icon: Briefcase, path: "privacy-Policy" },
    { name: "Support", icon: Settings, path: "support" },
  ],

  // Admin-only section — a genuinely separate area from the HR view.
  // Admin can jump back to the HR/Employee views via the "Switch View"
  // links rendered by Sidebar itself; this list is only the Admin-specific
  // pages.
  admin: [
    { name: "Admin Dashboard", icon: LayoutGrid, path: "" }, // index route
    { name: "Leave Management", icon: Calendar, path: "leave" },
    { name: "Users & Roles", icon: Users, path: "users" },
    { name: "Departments", icon: Briefcase, path: "departments" },
    { name: "Designations", icon: BriefcaseBusiness, path: "designations" },
    { name: "Audit Logs", icon: BarChart2, path: "audit-logs" },
    { name: "System Settings", icon: Settings, path: "settings" },
  ],
};

// Dropdown option lists used on the visitor/interview form
export const experienceOptions = [
  "Less than 1 year",
  "1-2 years",
  "2-3 years",
  "3-4 years",
  "4-5 years",
  "5-6 years",
  "6-7 years",
  "7-8 years",
  "8-9 years",
  "9-10 years",
  "10+ years",
];

export const interviewDomains = [
  "MERN",
  "React",
  "Node.js",
  "Java",
  "Python",
  "DevOps",
  "UI/UX",
  "QA",
  "Data Science",
  "Flutter",
  "Android",
  "iOS",
];

export const jobSourceOptions = [
  "LinkedIn",
  "Naukri",
  "Indeed",
  "Reference",
  "Company Website",
  "Other",
];

// Sample leave events for the HR leave calendar (LeaveCalendar.jsx).
// NOTE: this is placeholder data, not wired to a real leave API yet.
export const fetchLeaveCalendarData = () => {
  return Promise.resolve([
    {
      employeeId: 1,
      employeeName: "Rahul Sharma",
      status: "Approved",
      leaveDates: ["2026-02-10", "2026-02-11", "2026-02-12"],
    },
    {
      employeeId: 2,
      employeeName: "Priya Verma",
      status: "Pending",
      leaveDates: ["2026-02-15", "2026-02-16"],
    },
    {
      employeeId: 3,
      employeeName: "Amit Singh",
      status: "Rejected",
      leaveDates: ["2026-02-18"],
    },
    {
      employeeId: 4,
      employeeName: "Neha Gupta",
      status: "Approved",
      leaveDates: ["2026-02-20", "2026-02-21"],
    },
  ]);
};
