export const CARRIERS = [
  "Correios",
  "Jadlog",
  "Total Express",
  "Loggi",
  "Entrega própria",
  "Outro",
] as const;

/**
 * Link público de rastreio, quando a transportadora tem uma URL padrão
 * conhecida. Retorna null para transportadoras sem link direto (ex:
 * entrega própria) — o admin ainda registra o código manualmente.
 */
export function trackingUrl(carrier: string | null, code: string | null): string | null {
  if (!code) return null;
  const normalized = carrier?.trim().toLowerCase();

  if (normalized === "correios") {
    return `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(code)}`;
  }
  if (normalized === "jadlog") {
    return `https://www.jadlog.com.br/siteInstitucional/tracking.jad?cte=${encodeURIComponent(code)}`;
  }
  if (normalized === "loggi") {
    return `https://www.loggi.com/rastreador/${encodeURIComponent(code)}`;
  }
  return null;
}
