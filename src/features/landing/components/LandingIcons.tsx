export function ArrowUpRight() {
  return <span aria-hidden="true">↗</span>;
}

export function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="lc-download-icon"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 3v11m0 0 4.2-4.2M12 14l-4.2-4.2M5 19.5h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Bookmark({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={filled ? "is-filled" : ""}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6.75 4.75A2.25 2.25 0 0 1 9 2.5h6a2.25 2.25 0 0 1 2.25 2.25v16.1l-5.25-3.2-5.25 3.2V4.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ checked }: { checked: boolean }) {
  return (
    <span className={`lc-check ${checked ? "is-checked" : ""}`} aria-hidden="true">
      {checked ? "✓" : ""}
    </span>
  );
}
