import React, { useState } from "react";
import { scheduleInterviewApi } from "../../../api/interviewApi";
import { showWarning, showSuccess, showError } from "../../../utils/alert";
import BaseModal from "../../../components/BaseModal";

export default function InterviewScheduleModal({
  selectedVisitor,
  employees,
  onClose,
}) {
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [roundType, setRoundType] = useState("");
  const [interviewerId, setInterviewerId] = useState("");

  // TIME SLOTS
  const timeSlots = [];
  for (let hour = 10; hour <= 19; hour++) {
    const hour12 = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    timeSlots.push(`${hour12}:00 ${ampm}`);
  }


const handleSchedule = async () => {
  if (!roundType || !interviewerId || !interviewDate || !interviewTime) {
    return showWarning("Missing Fields", "Please fill all fields");
  }

  try {
    // CONVERT TIME
    const convertTo24Hour = (time12h) => {
      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");

      hours = parseInt(hours);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      }

      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    // PAYLOAD
    const payload = {
      candidateId: selectedVisitor._id,
      roundType,
      interviewerId,
      interviewDate,
      interviewTime: convertTo24Hour(interviewTime),
    };

    // API CALL
    const data = await scheduleInterviewApi(payload);
  
    // SUCCESS
    await showSuccess(
      "Interview Scheduled",
      data.message || "Interview scheduled successfully"
    );

    onClose();

  } catch (error) {

    showError(
      "Scheduling Failed",
      error?.response?.data?.message || error.message || "Something went wrong"
    );
  }
};

  return (
    <BaseModal
      title="Schedule Interview"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn-outline btn-sm sm:btn-md" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary btn-sm sm:btn-md" onClick={handleSchedule}>
            Submit
          </button>
        </>
      }
    >
        <div className="mb-2 flex flex-col">
          <span>
            <b>Candidate:</b> {selectedVisitor.fullName}
          </span>
          <span>
            <b>Domain:</b> {selectedVisitor.domain}
          </span>
        </div>

        {/* Round Type */}
        <div className="mb-4">
          <label className="label">Round Type</label>
          <select
            className="select select-bordered w-full"
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
          >
            <option value="">Select Round</option>
            <option value="HR">HR</option>
            <option value="Technical">Technical</option>
            <option value="Machine Coding">Machine Coding</option>
            <option value="Director">Director</option>
          </select>
        </div>

        {/* Interviewer Dropdown */}
        <div className="mb-4">
          <label className="label">Select Interviewer</label>
          <select
            className="select select-bordered w-full"
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp?.personal?.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Interview Date */}
        <div className="mb-4">
          <label className="label">Select Date</label>
          <input
            type="date"
            className="input input-bordered w-full"
            min={new Date().toISOString().split("T")[0]}
            value={interviewDate}
            onChange={(e) => {
              const selected = new Date(e.target.value);
              if (selected.getDay() === 0) {
                showWarning("Invalid Date", "Sunday is not allowed");
                return;
              }
              setInterviewDate(e.target.value);
            }}
          />
        </div>

        {/* Interview Time */}
        <div className="mb-4">
          <label className="label">Select Time</label>
          <select
            className="select select-bordered w-full"
            value={interviewTime}
            onChange={(e) => setInterviewTime(e.target.value)}
          >
            <option value="">Select Time</option>
            {timeSlots.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
    </BaseModal>
  );
}
