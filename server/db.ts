import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Permite conectar via DATABASE_URL única ou variáveis individuais
function getPoolConfig(): mysql.PoolOptions {
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL.trim();
    // Se vier sem protocolo ou com mysql://, tratar adequadamente
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      console.warn("Aviso: DATABASE_URL com protocolo postgres detectada para MariaDB.");
      url = url.replace(/^postgres(ql)?:\/\//, "mysql://");
    }
    return {
      uri: url,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };
  }

  // Fallback para variáveis individuais se configuradas
  return {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "profac",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };
}

if (!process.env.DATABASE_URL && !process.env.MYSQL_HOST) {
  console.warn("Aviso: Nenhuma DATABASE_URL ou MYSQL_HOST configurada. Certifique-se de preencher nas variáveis de ambiente do Render.");
}

export const pool = mysql.createPool(getPoolConfig());
export const db = drizzle(pool, { schema, mode: "default" });