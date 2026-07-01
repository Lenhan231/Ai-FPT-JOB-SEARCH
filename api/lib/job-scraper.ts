import { scrapeFPTJobs } from "./fpt-scraper.js";
import { saveFPTJobs, clearOldJobs, FPTJobDB } from "./supabase.js";

export async function scrapeAndSaveJobs(): Promise<void> {
  try {
    console.log("Starting FPT jobs scrape...");

    // Scrape jobs
    const rawJobs = await scrapeFPTJobs("");

    if (rawJobs.length === 0) {
      console.log("No jobs found to scrape");
      return;
    }

    // Transform to DB format
    const jobsForDB: FPTJobDB[] = rawJobs.map((job) => ({
      job_id: job.id,
      title: job.title,
      location: job.location,
      company: job.company,
      job_url: job.url,
      salary_range: job.salary,
      deadline: job.deadline,
      job_description: job.description,
    }));

    // Save to Supabase
    await saveFPTJobs(jobsForDB);

    // Clean old jobs (older than 30 days)
    await clearOldJobs(30);

    console.log("✓ Scrape completed successfully");
  } catch (error) {
    console.error("Error in scrapeAndSaveJobs:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Run scraper on demand
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeAndSaveJobs()
    .then(() => {
      console.log("Scrape job finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Scrape job failed:", error);
      process.exit(1);
    });
}
