import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron";
import applyRouter from "./routes/apply.js";
import { swaggerSpec } from "./swagger.js";
import { scrapeAndSaveJobs } from "./lib/job-scraper.js";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./lib/logger.js";
import { getFrontendHTML } from "./frontend.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

logger.info(`Current working directory: ${process.cwd()}`);
logger.info(`GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? "✓ YES" : "✗ NO"}`);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Swagger Documentation - Served via CDN to bypass Vercel serverless static files issue
app.get("/api/docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>FPT Job Application API Docs</title>
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css" >
        <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/favicon-32x32.png" sizes="32x32" />
        <style>
          html { box-sizing: border-box; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js"> </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js"> </script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: "/api/docs.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
            window.ui = ui;
          };
        </script>
      </body>
    </html>
  `);
});
app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});

// Serve gorgeous frontend SPA at root
app.get("/", (req, res) => {
  res.send(getFrontendHTML());
});

// Debug endpoint (disabled in production for security)
app.get("/api/debug", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Forbidden", message: "Debug endpoint is disabled in production" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const keyLength = apiKey ? apiKey.length : 0;
  const keyPreview = apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET";

  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      GEMINI_API_KEY_SET: !!apiKey,
      GEMINI_API_KEY_LENGTH: keyLength,
      GEMINI_API_KEY_PREVIEW: keyPreview,
    },
    cwd: process.cwd(),
    envFilePath: ".env (should be loaded)",
  });
});

// API routes
app.use("/api", applyRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  logger.info(`POST /api/apply - Submit CV and get FPT job recommendations`);

  // Schedule weekly job scrape (every Monday at 2 AM)
  cron.schedule("0 2 * * 1", async () => {
    logger.info("Running scheduled FPT jobs scraper...");
    try {
      await scrapeAndSaveJobs();
    } catch (error) {
      logger.error("Scheduled scrape failed:", error);
    }
  });

  // Run scraper on startup if not in production or serverless environments to save resources
  const isServerless = process.env.VERCEL || process.env.NOW_BUILDER;
  if (!isServerless) {
    logger.info("Running initial job scrape...");
    scrapeAndSaveJobs().catch((error) => {
      logger.error("Initial scrape failed:", error);
    });
  } else {
    logger.info("Skipping initial job scrape in serverless environment");
  }
});
