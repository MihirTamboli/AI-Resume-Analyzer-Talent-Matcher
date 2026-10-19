import { useEffect, useState } from "react";

export function ScoreRing({ value, label }: { value: number; label: string }) {
  const [shown, setShown] = useState(0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, shown)) / 100);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="relative grid size-40 shrink-0 place-items-center">
      <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-arc"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-5xl leading-none tabular-nums">{shown}</p>
        <p className="mt-1 text-xs tracking-wide text-muted uppercase">{label}</p>
      </div>
    </div>
  );
}
