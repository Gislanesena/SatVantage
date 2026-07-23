import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import VLibrasWidget from "@/components/VLibrasWidget";
import AccessibilityDock from "@/components/AccessibilityDock";

export const metadata: Metadata = {
  title: "SatVantage",
  description:
    "O futuro do Bitcoin, no seu ritmo. Aprenda, opere e proteja sua vida em sats — com identidade Nostr, sem guardarmos sua chave.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sv_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);var l=localStorage.getItem('sv_locale');if(l==='pt'||l==='en'||l==='es')document.documentElement.lang=l==='pt'?'pt-BR':l;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <AccessibilityDock />
          <VLibrasWidget />
        </Providers>
      </body>
    </html>
  );
}
