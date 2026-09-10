import React from "react";
import {
  Shield,
  FileText,
  User,
  Briefcase,
  Terminal,
  Lock,
  CheckCircle2,
  Cookie,
  Globe,
  HelpCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 antialiased text-sm">
      {/* Main Content - Max Width 7xl for Wide Layout */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-sky-600 px-6 py-8 md:p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-sky-150" />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-100">
                Legal Documentation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sky-50 text-xs md:text-sm max-w-4xl leading-relaxed">
              Your trust is our priority. This Privacy Policy explains how{" "}
              <span className="font-semibold text-white">
                Technorizen Software Solution Pvt Ltd
              </span>{" "}
              collects, uses, shares, and protects your information when you use
              our Human Resource Management System (HRMS).
            </p>
          </div>

          {/* Policy Sections */}
          <div className="px-6 md:px-8 py-8 space-y-8">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  1
                </span>
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                Introduction
              </h2>
              <div className="text-gray-600 leading-relaxed space-y-2 pl-8 text-xs md:text-sm">
                <p>
                  Technorizen Software Solution Pvt Ltd ("Company," "we," "us,"
                  or "our") is committed to protecting the privacy and security
                  of your personal information. This Privacy Policy describes
                  our practices in connection with information collected through
                  our Human Resource Management System (HRMS), which is used for
                  managing employee data, payroll, attendance, performance
                  evaluations, recruitment, and other HR-related functions.
                </p>
                <p>
                  By accessing or using our HRMS, you acknowledge that you have
                  read and understood this Privacy Policy. If you are an
                  employee, this policy applies in conjunction with your
                  employment contract and any applicable company policies.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  2
                </span>
                <User className="w-4 h-4 text-sky-600 shrink-0" />
                Information We Collect
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4 pl-8 text-xs md:text-sm">
                We collect the following categories of personal information:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pl-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-sky-800 text-sm mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Personal Identifiers
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-0.5">
                    <li>Full name, DOB, gender</li>
                    <li>Address, phone, email</li>
                    <li>Government IDs (PAN, Aadhaar, etc.)</li>
                    <li>Employee ID, photograph</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-sky-800 text-sm mb-2 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Employment & Financial
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-0.5">
                    <li>Job title, department</li>
                    <li>Salary, bank details, tax info</li>
                    <li>Attendance & leave balances</li>
                    <li>Performance reviews</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-sky-800 text-sm mb-2 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5" /> Technical & Usage Data
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-0.5">
                    <li>IP address, browser type</li>
                    <li>Device info, access logs</li>
                    <li>Login timestamps</li>
                    <li>Authentication cookies</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-sky-800 text-sm mb-2 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Sensitive Data
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-0.5">
                    <li>Health info & medical claims</li>
                    <li>Biometric data (attendance)</li>
                    <li>Background verification data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  3
                </span>
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-3 pl-8 text-xs md:text-sm">
                Your personal data is used strictly for legitimate HR and
                business purposes, including:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-8">
                {[
                  "Processing payroll & tax filings",
                  "Managing attendance & leave requests",
                  "Performance appraisals & career development",
                  "Compliance with labor laws & statutory reporting",
                  "Benefits administration (insurance, claims)",
                  "System security audits & access control",
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-gray-700 font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Data Sharing & Disclosure */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  4
                </span>
                <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                Data Sharing & Disclosure
              </h2>
              <p className="text-gray-600 leading-relaxed mb-3 pl-8 text-xs md:text-sm">
                We do not sell your personal information. However, we may share
                your data in the following circumstances:
              </p>
              <div className="space-y-2 pl-8">
                {[
                  {
                    label: "Service Providers",
                    text: "Third-party vendors who assist with payroll processing, cloud hosting, IT support, and background checks (under strict confidentiality agreements).",
                  },
                  {
                    label: "Legal Compliance",
                    text: "When required by law, court order, or government regulations (e.g., tax authorities, labor departments).",
                  },
                  {
                    label: "Corporate Transactions",
                    text: "In the event of a merger, acquisition, or asset sale, your data may be transferred with notice.",
                  },
                  {
                    label: "Internal Use",
                    text: "Authorized HR, IT, and management personnel who need access for legitimate business functions.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-150 bg-slate-50/50 text-xs text-gray-600"
                  >
                    <span className="font-bold text-gray-800 mr-1">
                      {item.label}:
                    </span>{" "}
                    {item.text}
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Data Security & Retention */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  5
                </span>
                <Lock className="w-4 h-4 text-sky-600 shrink-0" />
                Data Security & Retention
              </h2>
              <div className="text-gray-600 leading-relaxed space-y-2 pl-8 text-xs md:text-sm">
                <p>
                  We implement industry-standard security measures including
                  encryption (TLS 1.3), role-based access controls, multi-factor
                  authentication, regular security audits, and employee training
                  to protect your data from unauthorized access, alteration, or
                  destruction.
                </p>
                <p>
                  Your personal information will be retained for as long as you
                  are an employee and for the duration required to comply with
                  legal obligations (e.g., tax records for 7 years, employment
                  contracts for 3 years post-termination) or until a valid
                  deletion request is received.
                </p>
              </div>
            </section>

            {/* 6. Your Privacy Rights */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  6
                </span>
                <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
                Your Privacy Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-3 pl-8 text-xs md:text-sm">
                Depending on your jurisdiction (including India's DPDP Act and
                GDPR where applicable), you may have the following rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-8">
                {[
                  {
                    title: "Right to Access",
                    desc: "Request a copy of your personal data we hold.",
                  },
                  {
                    title: "Right to Rectification",
                    desc: "Correct inaccurate or incomplete information.",
                  },
                  {
                    title: "Right to Erasure",
                    desc: "Request deletion of your data, subject to legal retention.",
                  },
                  {
                    title: "Right to Restrict",
                    desc: "Limit how we use your data in certain cases.",
                  },
                  {
                    title: "Data Portability",
                    desc: "Receive your data in a structured, machine-readable format.",
                  },
                  {
                    title: "Right to Object",
                    desc: "Object to processing based on legitimate interests.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-sky-50/60 p-3 rounded-xl border border-sky-100"
                  >
                    <h3 className="font-bold text-sky-900 text-xs mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-650 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 mt-3 text-[11px] pl-8">
                To exercise these rights, contact our Data Protection Officer at{" "}
                <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] select-all border border-slate-200">
                  privacy@technorizen.com
                </span>
                .
              </p>
            </section>

            {/* 7. Cookies */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  7
                </span>
                <Cookie className="w-4 h-4 text-sky-600 shrink-0" />
                Cookies & Tracking Technologies
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-xs md:text-sm">
                Our HRMS uses essential cookies for authentication, session
                management, and security. We do not use tracking cookies for
                marketing purposes. You can disable cookies via browser
                settings, but this may affect system functionality. Third-party
                providers integrated into the HRMS may set their own cookies as
                per their policies.
              </p>
            </section>

            {/* 8. International Data Transfers */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  8
                </span>
                <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                International Data Transfers
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-xs md:text-sm">
                Technorizen may store and process your data on servers located
                in India or other countries where our cloud service providers
                operate. We ensure that any cross-border data transfer complies
                with applicable data protection laws through standard
                contractual clauses or adequacy decisions.
              </p>
            </section>

            {/* 9. Children's Privacy */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  9
                </span>
                <AlertTriangle className="w-4 h-4 text-sky-600 shrink-0" />
                Children's Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-xs md:text-sm">
                Our HRMS is strictly for employees and job applicants aged 18
                years or older. We do not knowingly collect personal information
                from minors. If we discover such data, we will delete it
                immediately.
              </p>
            </section>

            {/* 10. Changes to This Policy */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  10
                </span>
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-xs md:text-sm">
                We may update this policy from time to time. Material changes
                will be communicated via email or through a prominent notice in
                the HRMS. The "Last Updated" date at the top of this page
                indicates when the policy was last revised. Continued use of the
                system constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 11. Contact Information */}
            <section>
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-md flex items-center justify-center text-xs font-bold border border-sky-100 shrink-0">
                  11
                </span>
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                Contact Us
              </h2>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 pl-8">
                <p className="text-gray-600 text-xs mb-4">
                  If you have any questions, concerns, or complaints about this
                  Privacy Policy or our data practices, please contact our
                  Privacy Team:
                </p>

                <div className="grid gap-6 sm:grid-cols-2 text-xs text-gray-700">
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Company Details
                    </div>
                    <div className="font-bold text-gray-900">
                      Technorizen Software Solution Pvt Ltd
                    </div>
                    <div className="text-gray-600 flex gap-2 items-start mt-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>
                        Sapphire House, 402 A, B, C,
                        <br />
                        Sapna Sangeeta Rd, Indore,
                        <br />
                        Madhya Pradesh 452001, India
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Direct Contact
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <a
                        href="mailto:privacy@technorizen.com"
                        className="text-sky-600 font-medium hover:underline"
                      >
                        privacy@technorizen.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span className="font-medium">+91-78284 07092</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-400 text-[11px] mt-6 border-t border-slate-200 pt-4">
          © {new Date().getFullYear()} Technorizen Software Solution Pvt Ltd.
          All rights reserved.
          <p className="mt-0.5 font-medium text-gray-400/80">
            This HRMS Privacy Policy is a legally binding document.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
