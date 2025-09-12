import React from "react";

type Props = {
  className?: string;
};

/**
 * Minimal PIX-like diamond icon (for UI only, not official branding).
 */
export default function PixIcon({ className = "h-6 w-6" }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="pixGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#3dd6bf" />
          <stop offset="100%" stopColor="#1fbf9f" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#pixGradient)" strokeWidth="3">
        <rect x="10" y="10" width="28" height="28" rx="6" transform="rotate(45 24 24)" />
        <path d="M16 24h16M24 16v16" strokeLinecap="round" />
      </g>
    </svg>
  );
}
