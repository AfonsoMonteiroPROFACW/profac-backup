import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Permite conectar via DATABASE_URL única ou variáveis individuais
function getPoolConfig(): mysql.PoolOptions {
  const isVercel = !!process.env.VERCEL;

  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL.trim();
    // Se vier com protocolo postgresql:// ou postgres://, converter para mysql://
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      console.warn("Aviso: DATABASE_URL com protocolo postgres detectada. Ajustando para mysql://.");
      url = url.replace(/^postgres(ql)?:\/\//, "mysql://");
    }

    const config: mysql.PoolOptions = {
      uri: url,
      waitForConnections: true,
      connectionLimit: isVercel ? 3 : 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };

    // Habilitar SSL para provedores gerenciados de nuvem (TiDB, PlanetScale, AWS RDS, etc.)
    const isRemote = !url.includes("localhost") && !url.includes("127.0.0.1");
    if (process.env.MYSQL_SSL === "true" || url.includes("ssl=") || url.includes("ssl-mode=") || (isRemote && process.env.NODE_ENV === "production")) {
      config.ssl = { rejectUnauthorized: false };
    }

    return config;
  }

  // Fallback para variáveis individuais se configuradas
  const isRemote = process.env.MYSQL_HOST && process.env.MYSQL_HOST !== "localhost" && process.env.MYSQL_HOST !== "127.0.0.1";
  const sslNeeded = process.env.MYSQL_SSL === "true" || (isRemote && process.env.NODE_ENV === "production");

  return {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "profac",
    waitForConnections: true,
    connectionLimit: isVercel ? 3 : 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: sslNeeded ? { rejectUnauthorized: false } : undefined,
  };
}

if (!process.env.DATABASE_URL && !process.env.MYSQL_HOST) {
  console.warn("Aviso: Nenhuma DATABASE_URL ou MYSQL_HOST configurada. Certifique-se de configurar nas variáveis de ambiente da Vercel ou no .env.");
}

export const pool = mysql.createPool(getPoolConfig());
export const db = drizzle(pool, { schema, mode: "default" });