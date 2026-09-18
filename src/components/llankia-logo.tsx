export function LlankiaLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true" className="shrink-0">
        <path
          d="M40.4 19.6 A17 17 0 1 1 32 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 16 L24 24 L37.5 9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-medium tracking-wide">Llankia</span>
    </span>
  );
}
