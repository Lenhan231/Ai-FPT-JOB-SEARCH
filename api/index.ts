import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron";
import applyRouter from "./routes/apply.js";
import { swaggerSpec } from "./swagger.js";
import { scrapeAndSaveJobs } from "./lib/job-scraper.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("Current working directory:", process.cwd());
console.log("GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "✓ YES" : "✗ NO");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerUrl: "/api/docs.json" }));
app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "FPT Job Application API",
    version: "1.0.0",
    endpoints: {
      api: "POST /api/apply",
      docs: "GET /api/docs",
      docs_json: "GET /api/docs.json",
      debug: "GET /api/debug",
    },
  });
});

// Debug endpoint
app.get("/api/debug", (req, res) => {
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
    envFilePath: process.env.NODE_ENV === "development" ? ".env (should be loaded)" : "production",
  });
});

// API routes
app.use("/api", applyRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`POST /api/apply - Submit CV and get FPT job recommendations`);

  // Schedule weekly job scrape (every Monday at 2 AM)
  cron.schedule("0 2 * * 1", async () => {
    console.log("Running scheduled FPT jobs scraper...");
    try {
      await scrapeAndSaveJobs();
    } catch (error) {
      console.error("Scheduled scrape failed:", error);
    }
  });

  // Run scraper on startup
  console.log("Running initial job scrape...");
  scrapeAndSaveJobs().catch((error) => {
    console.error("Initial scrape failed:", error);
  });
});
