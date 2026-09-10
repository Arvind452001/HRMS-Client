export const CircularTimer = ({ seconds }) => {
  const totalSeconds = 9 * 60 * 60 + 30 * 60; // 9 hours 30 minutes
  const radius = 74;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = Math.min(seconds / totalSeconds, 1);
  const strokeDashoffset = circumference - progress * circumference;

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex justify-center items-center">
      <svg height={radius * 2} width={radius * 2}>
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          stroke="var(--color-base-300)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress */}
        <circle
          stroke="url(#timerGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 0.5s ease",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />

        {/* Time Text */}
        <text
          x="50%"
          y="47%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="19"
          fontWeight="700"
          fill="var(--color-base-content)"
          fontFamily="var(--font-heading)"
        >
          {formatTime(seconds)}
        </text>
        <text
          x="50%"
          y="63%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="10"
          letterSpacing="0.05em"
          fill="var(--color-primary)"
          fontWeight="600"
        >
          HRS : MIN : SEC
        </text>
      </svg>
    </div>
  );
};
