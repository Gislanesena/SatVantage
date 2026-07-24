/** Ícone de alto-falante (TTS) — azul via currentColor. */
type Props = {
  size?: number;
  className?: string;
};

export default function SpeakIcon({ size = 22, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" fill="currentColor" />
      <path
        d="M15.5 8.5a4.5 4.5 0 0 1 0 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M17.8 6a7.5 7.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
