/** Símbolo Universal de Acessibilidade (ativo oficial + SVG de fallback). */
type Props = {
  size?: number;
  className?: string;
  title?: string;
};

export default function AccessibilityIcon({
  size = 22,
  className,
  title,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/accessibility-symbol.png"
      alt=""
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      decoding="async"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
