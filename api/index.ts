import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp } from "../server/app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    console.error("Erro na execução da Serverless Function da Vercel:", error);
    res.status(500).json({
      message: "Erro interno no servidor da Vercel",
      error: process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
}
