import React, { useState } from "react";
import { showWarning, showSuccess, showError } from "../../../utils/alert";
import {
  Mail,
  Phone,
  Clock3,
  ShieldCheck,
  Send,
  User,
  MessageSquare,
} from "lucide-react";
import { createSupportApi } from "../../../api/suportApi";

export default function Support() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // API CALL
  const sendSupportRequest = async () => {
    return await createSupportApi(form);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.category || !form.message) {
      return showWarning("Missing Fields", "Please fill all fields");
    }

    try {
      setLoading(true);

      await sendSupportRequest(); // FIXED

      showSuccess("Submitted", "Support request submitted successfully");

      setForm({
        name: "",
        email: "",
        category: "",
        message: "",
      });
    } catch (error) {
      showError("Error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full w-full flex items-center justify-center px-0 sm:px-2 py-0 sm:py-4 md:py-6 rounded-xl">
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm overflow-hidden grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="bg-sky-600 text-white p-4 md:p-5 flex flex-col justify-between">
          <div>
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold leading-tight">
                  HRMS Support
                </h2>

                <p className="text-sky-100 text-sm">We are here to help you</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-xs md:text-sm text-sky-100 leading-6">
              Facing issues with payroll, attendance, leave, or technical
              support? Submit your request and our team will contact you
              quickly.
            </p>

            {/* INFO BOXES */}
            <div className="mt-6 space-y-3">
              <div className="bg-white/10 border border-white/20 rounded-xl p-2 flex items-center gap-3">
                <div className="bg-white text-sky-600 p-2 rounded-lg">
                  <Mail size={18} />
                </div>

                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm">Email Support</h4>

                  <p className="text-xs text-sky-100 truncate">
                    support@company.com
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-xl p-2 flex items-center gap-3">
                <div className="bg-white text-sky-600 p-2 rounded-lg">
                  <Phone size={18} />
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Call Support</h4>

                  <p className="text-xs text-sky-100">+91 9876543210</p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-xl p-2 flex items-center gap-3">
                <div className="bg-white text-sky-600 p-2 rounded-lg">
                  <Clock3 size={18} />
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Working Hours</h4>

                  <p className="text-xs text-sky-100">
                    Mon - Fri (10 AM - 7:30 PM)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-5 mt-5 border-t border-white/20">
            <p className="text-xs text-sky-100">
              Average response time: 2-4 business hours
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="p-4 md:p-5">
          {/* TITLE */}
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-800">Submit Ticket</h3>

            <p className="text-sm text-gray-500 mt-1">Fill the form below</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-2 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-2 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* CATEGORY + PRIORITY */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Issue Type
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select Issue</option>
                  <option value="HR">HR</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Message
              </label>

              <div className="relative">
                <MessageSquare
                  size={16}
                  className="absolute left-3 top-4 text-gray-400"
                />

                <textarea
                  rows="3"
                  name="message"
                  placeholder="Describe your issue..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-9 pr-2 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 w-full text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition duration-200 disabled:opacity-70"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
