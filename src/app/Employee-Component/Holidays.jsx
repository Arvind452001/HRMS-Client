import React from "react";
import { PartyPopper } from "lucide-react";

// List of 2026 Indian public holidays
const ALL_2026_HOLIDAYS = [
  {
    title: "Republic Day",
    day: "Monday",
    date: "26",
    monthNum: 1,
    monthName: "January",
    monthShort: "Jan",
  },
  {
    title: "Maha Shivratri",
    day: "Monday",
    date: "16",
    monthNum: 2,
    monthName: "February",
    monthShort: "Feb",
  },
  {
    title: "Holi",
    day: "Wednesday",
    date: "4",
    monthNum: 3,
    monthName: "March",
    monthShort: "Mar",
  },
  {
    title: "Id-ul-Fitr (Ramadan Eid)",
    day: "Friday",
    date: "20",
    monthNum: 3,
    monthName: "March",
    monthShort: "Mar",
  },
  {
    title: "Mahavir Jayanti",
    day: "Thursday",
    date: "2",
    monthNum: 4,
    monthName: "April",
    monthShort: "Apr",
  },
  {
    title: "Good Friday",
    day: "Friday",
    date: "3",
    monthNum: 4,
    monthName: "April",
    monthShort: "Apr",
  },
  {
    title: "Budha Purnima",
    day: "Saturday",
    date: "2",
    monthNum: 5,
    monthName: "May",
    monthShort: "May",
  },
  {
    title: "Id-ul-Zuha (Bakrid)",
    day: "Wednesday",
    date: "27",
    monthNum: 5,
    monthName: "May",
    monthShort: "May",
  },
  {
    title: "Muharram",
    day: "Friday",
    date: "26",
    monthNum: 6,
    monthName: "June",
    monthShort: "June",
  },
  {
    title: "Independence Day",
    day: "Saturday",
    date: "15",
    monthNum: 8,
    monthName: "August",
    monthShort: "Aug",
  },
  {
    title: "Raksha Bandhan",
    day: "Friday",
    date: "28",
    monthNum: 8,
    monthName: "August",
    monthShort: "Aug",
  },
  {
    title: "Janmashtami",
    day: "Friday",
    date: "4",
    monthNum: 9,
    monthName: "September",
    monthShort: "Sep",
  },
  {
    title: "Id-Milad (Prophet Birthday)",
    day: "Sunday",
    date: "6",
    monthNum: 9,
    monthName: "September",
    monthShort: "Sep",
  },
  {
    title: "Gandhi Jayanti",
    day: "Friday",
    date: "2",
    monthNum: 10,
    monthName: "October",
    monthShort: "Oct",
  },
  {
    title: "Dussehra",
    day: "Tuesday",
    date: "20",
    monthNum: 10,
    monthName: "October",
    monthShort: "Oct",
  },
  {
    title: "Diwali (Deepavali)",
    day: "Sunday",
    date: "8",
    monthNum: 11,
    monthName: "November",
    monthShort: "Nov",
  },
  {
    title: "Guru Nanak Birthday",
    day: "Tuesday",
    date: "24",
    monthNum: 11,
    monthName: "November",
    monthShort: "Nov",
  },
  {
    title: "Christmas Day",
    day: "Friday",
    date: "25",
    monthNum: 12,
    monthName: "December",
    monthShort: "Dec",
  },
];

export default function Holidays() {
  const currentYear = new Date().getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Filter out holidays that have already passed
  const upcomingHolidays = ALL_2026_HOLIDAYS.map((h) => ({
    ...h,
    rawDate: new Date(currentYear, h.monthNum - 1, parseInt(h.date)),
  })).filter((h) => h.rawDate >= today);

  // 2. 🗓️ Month-wise Grouping Logic (Pure local execution)
  const groupedHolidays = {};
  upcomingHolidays.forEach((h) => {
    if (!groupedHolidays[h.monthName]) {
      groupedHolidays[h.monthName] = [];
    }
    groupedHolidays[h.monthName].push(h);
  });

  const monthKeys = Object.keys(groupedHolidays);

  return (
    <div
      className="card bg-base-100 border border-base-300"
      style={{ boxShadow: "0 1px 1px rgba(15, 23, 42, 0.02)" }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <PartyPopper size={18} />
          </span>
          <div>
            <h3 className="font-semibold text-base leading-tight">
              Upcoming Holidays
            </h3>
            <p className="text-xs text-base-content/50">Year {currentYear}</p>
          </div>
        </div>
      </div>

      {/* LIST CONTENT */}
      <div className="p-5 pt-3 max-h-90 overflow-y-auto space-y-4">
        {monthKeys.length === 0 ? (
          <p className="text-xs text-center py-6 text-base-content/50">
            No upcoming holidays left for this year.
          </p>
        ) : (
          // Month-wise loop map render
          monthKeys.map((monthName) => (
            <div key={monthName} className="space-y-2">
              {/* Month Section Title Tag */}
              <div className="text-[11px] font-bold text-sky-600 tracking-wider uppercase bg-sky-50 rounded-md px-2 py-0.5 inline-block border border-sky-100/50">
                {monthName}
              </div>

              {/* Holidays inside this specific Month */}
              <div className="space-y-2 pl-0.5">
                {groupedHolidays[monthName].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/40 px-3 py-2 hover:bg-base-200/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center leading-none">
                        <span className="text-xs font-bold">{h.date}</span>
                        <span className="text-[9px] font-bold uppercase mt-0.5">
                          {h.monthShort}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-sm text-base-content leading-snug">
                          {h.title}
                        </p>
                        <p className="text-[11px] text-base-content/50">
                          {h.day}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
