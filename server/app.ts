import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MySQLSessionStore from "express-mysql-session";
import MemoryStore from "memorystore";
import compression from "compression";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import { pool } from "./db";
import type { Server } from "http";

export const app = express();

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
}

// Compressão HTTP
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// Headers de segurança
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Middleware para normalização de rotas em ambientes Serverless da Vercel
app.use((req, res, next) => {
  // Se a requisição chega no handler da Vercel sem o prefixo /api, adiciona /api
  if (!req.url.startsWith("/api") && !req.url.startsWith("/_") && !req.url.includes(".")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  next();
});

// Configuração do Session Store (MySQL com fallback para MemoryStore)
function configureSessionStore(): session.Store {
  try {
    const MySQLStore = MySQLSessionStore(session as any);
    const store = new MySQLStore({
      clearExpired: true,
      checkExpirationInterval: 900000, // 15 minutos
      expiration: 86400000, // 24 horas
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    }, pool as any);

    store.on('error', (err: any) => {
      console.warn('Aviso no Session Store MySQL:', err?.message || err);
    });

    return store;
  } catch (error: any) {
    console.warn('Fallback para MemoryStore de sessões:', error?.message);
    const MemoryStoreSession = MemoryStore(session);
    return new MemoryStoreSession({
      checkPeriod: 86400000
    });
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'profac-session-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  store: configureSessionStore(),
  cookie: {
    secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  }
}));

// Logger de chamadas da API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

let initPromise: Promise<{ app: express.Express; server: Server }> | null = null;

export async function initApp(): Promise<{ app: express.Express; server: Server }> {
  if (!initPromise) {
    initPromise = (async () => {
      const server = await registerRoutes(app);

      // Error handler
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = (process.env.NODE_ENV === 'production' && !process.env.DEBUG) 
          ? 'Internal Server Error' 
          : err.message;
        
        if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
          console.error(err);
        }

        res.status(status).json({ message });
      });

      return { app, server };
    })();
  }
  return initPromise;
}

export async function getApp(): Promise<express.Express> {
  const { app } = await initApp();
  return app;
}
