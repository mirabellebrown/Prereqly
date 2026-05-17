export function AppIcon({ name, className = 'h-5 w-5' }) {
  const icons = {
    dashboard: (
      <path
        d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"
        fill="currentColor"
      />
    ),
    planner: (
      <path
        d="M5 5h14v14H5zM9 3v4M15 3v4M5 9h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    checklist: (
      <path
        d="M9 7h10M9 12h10M9 17h10M5 7l1.5 1.5L8.5 6M5 12l1.5 1.5L8.5 11M5 17l1.5 1.5L8.5 16"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    chat: (
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    resources: (
      <path
        d="M6 4h12v16H6zM8 4V2h8v2M9 9h6M9 13h6M9 17h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    calendar: (
      <path
        d="M6 4v3M18 4v3M5 8h14M6 6h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm3 5h2m4 0h2m-8 4h2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    bell: (
      <path
        d="M12 4a4 4 0 0 1 4 4v2.6c0 .7.2 1.4.6 2l1.1 1.7c.5.8-.1 1.7-1 1.7H7.3c-.9 0-1.5-.9-1-1.7l1.1-1.7c.4-.6.6-1.3.6-2V8a4 4 0 0 1 4-4Zm-1.5 14h3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    'arrow-up-right': (
      <path
        d="M7 17 17 7M9 7h8v8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    spark: (
      <path
        d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Zm6 11 1 2.5L21.5 18 19 19l-1 2.5L17 19l-2.5-1 2.5-1.5L18 14Zm-12 0 1 2.5L9.5 18 7 19l-1 2.5L5 19l-2.5-1L5 16.5 6 14Z"
        fill="currentColor"
      />
    ),
    check: (
      <path
        d="m5 12 4.2 4.2L19 6.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    chevron: (
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name]}
    </svg>
  )
}
