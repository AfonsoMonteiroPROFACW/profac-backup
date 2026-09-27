import { initApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import { FtpHealthMonitor } from "./ftpHealthMonitor";

(async () => {
  const { app, server } = await initApp();

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);

    // Em servidor tradicional / dev, inicia o monitor de saúde do FTP
    if (!process.env.VERCEL) {
      const ftpHealthMonitor = FtpHealthMonitor.getInstance();
      ftpHealthMonitor.startMonitoring();
    }
  });
})();
