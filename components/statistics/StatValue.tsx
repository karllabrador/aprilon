"use client";

import { useEffect, useRef, useState } from "react";
import { parseValue } from "@/lib/parseValue";

type StatValueProps = {
  value: string;
  label: string;
};

export default function StatValue({ value, label }: StatValueProps) {
  const { num, suffix, decimals } = parseValue(value);
  const [display, setDisplay] = useState("0" + (decimals > 0 ? ".0" : ""));
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const duration = 2000;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay((eased * num).toFixed(decimals));
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num, decimals]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 min-w-24">
      <span className="text-xs text-gray-400 uppercase tracking-wider text-center min-h-8 flex items-end justify-center">
        {label}
      </span>

      <span className="text-3xl text-[#ededed] tabular-nums">
        {display}
        {suffix}
      </span>
    </div>
  );
}
