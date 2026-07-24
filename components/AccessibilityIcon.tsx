/** Símbolo Universal de Acessibilidade (PNG oficial fornecido). */
type Props = {
  size?: number;
  className?: string;
  title?: string;
};

export default function AccessibilityIcon({
  size = 52,
  className,
  title,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/accessibility-symbol.png?v=3"
      alt=""
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      decoding="async"
      draggable={false}
    />
  );
}
