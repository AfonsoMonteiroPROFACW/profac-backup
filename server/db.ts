import * as schema from "@shared/schema";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString.includes("neon.tech");

let poolInstance: any;
let dbInstance: any;

if (isNeon) {
  // Configuração para banco Neon (Serverless via WebSocket)
  neonConfig.webSocketConstructor = ws;
  poolInstance = new NeonPool({ connectionString });
  dbInstance = drizzleNeon({ client: poolInstance, schema });
} else {
  // Configuração universal para Render PostgreSQL, Supabase, AWS ou Local
  const { Pool: PgPool } = pg;
  const isProduction = process.env.NODE_ENV === "production";
  poolInstance = new PgPool({
    connectionString,
    ssl: isProduction && !connectionString.includes("localhost") 
      ? { rejectUnauthorized: false } 
      : false,
  });
  dbInstance = drizzleNodePg(poolInstance, { schema });
}

export const pool = poolInstance;
export const db = dbInstance;