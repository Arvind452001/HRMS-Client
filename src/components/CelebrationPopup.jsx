import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Cake, Award, Scissors, PartyPopper, X } from "lucide-react";

const SKY = "#0ea5e9",
  SKY_LIGHT = "#38bdf8",
  BLUE = "#1d4ed8",
  BLUE_DARK = "#1e3a8a";
const ORANGE = "#f97316",
  ORANGE_DARK = "#ea580c",
  CREAM = "#fefaf4";
const RIBBON_COLORS = [SKY, ORANGE, BLUE, SKY_LIGHT, ORANGE_DARK];

const VARIANTS = {
  BIRTHDAY: {
    Icon: Cake,
    eyebrow: "Birthday Celebration",
    heading: "Happy Birthday!",
    meta: "ADMIT ONE · TO CAKE",
    stub: "B-DAY",
  },
  ANNIVERSARY: {
    Icon: Award,
    eyebrow: "Work Anniversary",
    heading: "Happy Work Anniversary!",
    meta: "MILESTONE · UNLOCKED",
    stub: "ANNIV",
  },
};

export default function CelebrationPopup({
  isOpen,
  message,
  variant = "BIRTHDAY",
  onClose,
  onCelebrate,
}) {
  const [show, setShow] = useState(false);
  const [torn, setTorn] = useState(false);
  const [ribbons, setRibbons] = useState([]);
  const { Icon, ...content } = VARIANTS[variant] || VARIANTS.BIRTHDAY;

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(false);
    setTorn(false);
    setRibbons([]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCelebrate = () => {
    if (torn) return;
    setTorn(true);
    setRibbons(
      Array.from({ length: 120 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 140 + Math.random() * 320;
        return {
          id: i,
          color: RIBBON_COLORS[i % RIBBON_COLORS.length],
          left: 50 + (Math.random() * 30 - 15),
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance - 130,
          rotate: Math.random() * 720 - 360,
          delay: Math.random() * 0.18,
          duration: 1.3 + Math.random() * 0.9,
          width: 6 + Math.random() * 5,
          height: 14 + Math.random() * 12,
        };
      }),
    );
    onCelebrate?.();
    setTimeout(onClose, 1500);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-8"
      onClick={onClose}
    >
      {ribbons.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-10000 overflow-hidden">
          {ribbons.map((r) => (
            <span
              key={r.id}
              className="absolute top-1/2 rounded-sm"
              style={{
                left: `${r.left}vw`,
                width: `${r.width}px`,
                height: `${r.height}px`,
                backgroundColor: r.color,
                opacity: 0,
                boxShadow: `0 0 6px ${r.color}66`,
                "--dx": `${r.dx}px`,
                "--dy": `${r.dy}px`,
                "--rot": `${r.rotate}deg`,
                animation: `ribbonBurst ${r.duration}s cubic-bezier(0.2,0.7,0.3,1) ${r.delay}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-xl flex flex-col items-center"
      >
        <div
          className={`relative w-full flex rounded-[28px] overflow-hidden ring-1 ring-black/5 shadow-[0_35px_80px_-20px_rgba(14,165,233,0.45)] transition-all duration-500 hover:-translate-y-1 ${show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          style={{ transform: show ? undefined : "rotate(-3deg)" }}
        >
          <div
            className="relative flex-1 min-w-0 px-6 sm:px-9 py-8 text-left transition-transform duration-700 ease-out"
            style={{
              background: `radial-gradient(circle at 1px 1px, rgba(14,165,233,0.06) 1px, transparent 0) 0 0/14px 14px, ${CREAM}`,
              transform: torn
                ? "translate(-10px, 4px) rotate(-1.5deg)"
                : "none",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-0.75"
              style={{
                background: `linear-gradient(180deg, ${SKY}, ${ORANGE})`,
              }}
            />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-700 hover:rotate-90 transition-all duration-300"
            >
              <X size={16} />
            </button>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600 mb-2 pr-8">
              {content.eyebrow}
            </p>

            <h2
              className="text-2xl sm:text-[32px] font-black tracking-tight leading-[1.1] mb-3 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${SKY} 0%, ${BLUE_DARK} 100%)`,
              }}
            >
              {content.heading}
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed max-w-sm">
              {message}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="font-mono text-[10px] tracking-[0.14em] text-slate-400">
                {content.meta}
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

          <div className="relative w-0">
            <div
              className="h-full w-px"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.9) 0 6px, transparent 6px 14px)",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.25)] rotate-90"
              aria-hidden
            >
              <Scissors size={13} className="text-slate-400" />
            </div>
          </div>

          <div
            className="relative w-24 sm:w-32 shrink-0 flex flex-col items-center justify-center gap-2.5 py-8 overflow-hidden transition-transform duration-700 ease-out"
            style={{
              background: `linear-gradient(160deg, ${SKY_LIGHT} 0%, ${BLUE} 55%, ${BLUE_DARK} 100%)`,
              transform: torn ? "translate(14px, -6px) rotate(3deg)" : "none",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 opacity-25"
              style={{
                background: `repeating-conic-gradient(from 0deg, ${ORANGE} 0deg 3deg, transparent 3deg 15deg), radial-gradient(120% 60% at 50% -10%, rgba(255,255,255,0.5), transparent 60%)`,
              }}
            />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40 shadow-inner">
              <Icon size={24} className="text-white drop-shadow-sm" />
            </div>
            <span className="relative text-[10px] font-bold tracking-[0.24em] text-white/90 [writing-mode:vertical-rl]">
              {content.stub}
            </span>
          </div>
        </div>

        <button
          onClick={handleCelebrate}
          disabled={torn}
          className="group relative mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full text-white font-semibold text-sm px-9 py-3.5 shadow-[0_10px_30px_-8px_rgba(249,115,22,0.55)] hover:shadow-[0_14px_38px_-6px_rgba(249,115,22,0.65)] active:scale-[0.97] transition-all disabled:opacity-80 disabled:active:scale-100 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            }}
          />
          <PartyPopper
            size={16}
            className="relative group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300"
          />
          <span className="relative">
            {torn ? "Celebrating…" : "Celebrate"}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes ribbonBurst {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translate(var(--dx), calc(var(--dy) + 480px)) rotate(var(--rot)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
