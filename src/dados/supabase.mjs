import { createClient } from "@supabase/supabase-js";

/* Projeto Supabase do Contadoria — criado 12/ago/2026, ver docs/SESSION_STATE.md.
   Chave `anon` é pública por design (protegida por RLS, não por sigilo) —
   mesmo raciocínio do ContLife, que a deixa direto no código-fonte. */
const SUPABASE_URL = "https://gmiiuklkhwjpcowvjbwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWl1a2xraHdqcGNvd3ZqYnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NjU5NTMsImV4cCI6MjEwMjE0MTk1M30.CJ6KsMBPD4J8LkxJeGVIBqI-F9WXX5arOPtLEqIj4Wk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Copiado quase ao pé da letra de C:\Users\LUAN S\OneDrive\Documentos\sistema
   financeio, contlife.jsx (traduzErroAuth, ~linha 196, 12/ago/2026) — o
   GoTrue devolve mensagem em inglês, e uma tradução inventada erraria o
   motivo real com mais frequência do que ajudaria. */
export function traduzErroAuth(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar — veja a caixa de entrada (e o spam).";
  if (m.includes("already registered") || m.includes("user already exists")) return "Este e-mail já tem cadastro — tente entrar, ou recupere a senha.";
  if (m.includes("password should be at least") || m.includes("password is too short")) return "A senha precisa de pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Muitas tentativas em pouco tempo — espere um minuto e tente de novo.";
  if (m.includes("unable to validate email address") || m.includes("invalid email")) return "Esse e-mail não parece válido.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Sem conexão com o servidor — confira sua internet.";
  return msg || "Algo deu errado. Tente de novo.";
}
