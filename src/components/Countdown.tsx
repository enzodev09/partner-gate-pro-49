import { useEffect, useState } from "react";

export function Countdown({ deadlineISO }: { deadlineISO: string }) {
  const [remaining, setRemaining] = useState<number>(() => new Date(deadlineISO).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(deadlineISO).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineISO]);

  if (remaining <= 0) return <span>00:00:00</span>;

  const totalSeconds = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return <span>{h}:{m}:{s}</span>;
}
