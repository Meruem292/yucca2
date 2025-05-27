import type React from 'react';

export function YuccaLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 30"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Yucca Logo"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="currentColor"
      >
        Yucca
      </text>
    </svg>
  );
}
