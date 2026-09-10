// Formats a leave's `dates` array (list of individual date strings/Dates)
// into a compact display — a "from → to" range when the dates are
// consecutive, instead of listing every single date, which was breaking
// the table layout on multi-day leaves.

const fmt = (d) => d.toLocaleDateString("en-GB"); // dd/mm/yyyy

const sortDates = (dates = []) =>
  [...dates].map((d) => new Date(d)).sort((a, b) => a - b);

const isConsecutive = (sorted) => {
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round((sorted[i] - sorted[i - 1]) / 86400000);
    if (diffDays !== 1) return false;
  }
  return true;
};

// Returns { label, sub, tooltip, count }
// - label: what to show as the primary text
// - sub: optional smaller secondary text (day count)
// - tooltip: full date list, for hover (title attribute)
export const formatLeaveDates = (dates = []) => {
  if (!dates || dates.length === 0) {
    return { label: "-", sub: "", tooltip: "", count: 0 };
  }

  const sorted = sortDates(dates);
  const count = sorted.length;

  if (count === 1) {
    return { label: fmt(sorted[0]), sub: "", tooltip: "", count };
  }

  if (isConsecutive(sorted)) {
    return {
      label: `${fmt(sorted[0])} → ${fmt(sorted[count - 1])}`,
      sub: `${count} days`,
      tooltip: sorted.map(fmt).join(", "),
      count,
    };
  }

  // Non-consecutive / scattered dates — show first date + "+N more"
  return {
    label: `${fmt(sorted[0])} +${count - 1} more`,
    sub: `${count} days (non-consecutive)`,
    tooltip: sorted.map(fmt).join(", "),
    count,
  };
};