/**
 * Configurações da aplicação PROFAC adaptadas para o ambiente de produção do Render e desenvolvimento local
 */

export function getBaseUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  }
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS}`;
  }
  return process.env.NODE_ENV === "production" ? "https://profac.com.br" : "http://localhost:5000";
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
