// lib/supabase.ts — cliente ADMIN (service role). Importar SOMENTE em código de servidor.
import { createClient } from "@supabase/supabase-js";

function env(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  // Cola do painel às vezes traz espaço/quebra de linha ou aspas.
  return raw.trim().replace(/^["']|["']$/g, "");
}

/** Aceita URL com /rest/v1 no fim (erro comum) e normaliza para a origem do projeto. */
function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1$/i, "");
  // Remove qualquer whitespace acidental no meio (cola quebrada).
  url = url.replace(/\s+/g, "");
  return url;
}

/** JWT não pode ter espaços — remove whitespace interno de colas quebradas. */
function normalizeServiceRoleKey(raw: string): string {
  return raw.replace(/\s+/g, "");
}

const supabaseUrl = normalizeSupabaseUrl(env("SUPABASE_URL"));
const serviceRoleKey = normalizeServiceRoleKey(env("SUPABASE_SERVICE_ROLE_KEY"));

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente/vazio no .env.local",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
