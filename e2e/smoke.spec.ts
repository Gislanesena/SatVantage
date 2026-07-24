import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.describe("SatVantage landing + a11y smoke", () => {
  test("home carrega com marca SatVantage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    const html = await page.content();
    expect(html.toLowerCase()).toMatch(/satvantage|bitcoin/);
  });

  test("dock de acessibilidade e TTS estão no DOM", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", {
      name: /opções de acessibilidade|accessibility options|opciones de accesibilidad/i,
    });
    await expect(menu.first()).toBeVisible({ timeout: 20_000 });

    const read = page.getByRole("button", {
      name: /ler página em voz alta|read page aloud|leer la página/i,
    });
    await expect(read.first()).toBeVisible();

    // VLibras: wiring no layout + componente (CDN externo pode falhar no headless)
    const hasVlibrasWiring = await page.evaluate(() => {
      const w = window as unknown as { VLibras?: unknown };
      return Boolean(
        document.querySelector("[vw].enabled") ||
          document.querySelector("[vw-access-button]") ||
          document.querySelector('script[src*="vlibras"]') ||
          w.VLibras,
      );
    });
    // Não falha o suite se CDN bloquear; reporta via annotation
    if (!hasVlibrasWiring) {
      test.info().annotations.push({
        type: "warning",
        description:
          "VLibras não detectado no DOM headless (CDN/plugin). Wiring validado em smoke estático.",
      });
    }
  });

  test("símbolo universal de acessibilidade presente", async ({ page }) => {
    await page.goto("/");
    // ícone SVG/img do AccessibilityIcon no FAB
    const fab = page.locator(".sv-a11y-fab, [aria-label*='Acessibilidade'], [aria-label*='Accessibility']").first();
    await expect(fab).toBeVisible({ timeout: 20_000 });
  });

  test("não há SpeakButton de bolha no landing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /^Ouvir mensagem$/i })).toHaveCount(0);
  });
});

test.describe("Extensão — artefatos locais", () => {
  test("front/extension popup tem captura e análise", async () => {
    const htmlPath = path.join(process.cwd(), "extension", "popup.html");
    const html = fs.readFileSync(htmlPath, "utf8");
    expect(html).toMatch(/id="enviar"|Analisar/);
    expect(html).toMatch(/id="capturar"|Selecionar área|captura/i);
    expect(html).toMatch(/id="btn-oficial"|oficial/i);
  });

  test("extension oficial (front/extension) Side Panel MV3", async () => {
    const manifestPath = path.join(process.cwd(), "extension", "manifest.json");
    expect(fs.existsSync(manifestPath)).toBeTruthy();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(manifest.side_panel?.default_path).toBeTruthy();
    expect(manifest.permissions).toContain("sidePanel");
    expect(manifest.version).toBeTruthy();
  });
});
