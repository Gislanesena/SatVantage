export default function CheckinOkPage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {
  const ok = searchParams?.ok !== "0";
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        background: "#0c1220",
        color: "#e8eef8",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: 12 }}>
          {ok ? "✅ Obrigado, confirmamos que você está bem" : "Link inválido ou expirado"}
        </h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.5 }}>
          {ok
            ? "Sua prova de vida foi renovada. Você já pode fechar esta página."
            : "Não encontramos um plano com este token. Se o problema continuar, confirme pelo dashboard SatVantage."}
        </p>
      </div>
    </main>
  );
}
