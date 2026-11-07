export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={large ? "brand-mark brand-mark-large" : "brand-mark"}
      fill="none"
      viewBox="0 0 42 46"
    >
      <path d="M21 2 39 12.5v21L21 44 3 33.5v-21L21 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="m21 7 13.5 8v16L21 39l-13.5-8V15L21 7Z" stroke="currentColor" strokeOpacity=".4" />
      <path d="M13 16h6v5h5v-5h6v14h-6v-4h-5v4h-6V16Z" fill="currentColor" />
      <path d="M16 12h10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
