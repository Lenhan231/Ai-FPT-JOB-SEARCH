import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️  Missing SUPABASE_URL or SUPABASE_KEY - will use in-memory fallback");
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface FPTJobDB {
  id?: number;
  job_id: string;
  title: string;
  location: string;
  company: string;
  job_url: string;
  salary_range?: string;
  deadline?: string;
  job_description: string;
  created_at?: string;
  updated_at?: string;
}

export async function saveFPTJobs(jobs: FPTJobDB[]): Promise<void> {
  if (!supabase) {
    console.warn("Supabase not initialized - skipping save");
    return;
  }

  console.log(`Saving ${jobs.length} jobs to Supabase...`);

  const { error } = await supabase
    .from("fpt_jobs")
    .upsert(jobs, { onConflict: "job_id" });

  if (error) {
    console.error(`Failed to save jobs: ${error.message}`);
    return;
  }

  console.log(`✓ Saved ${jobs.length} jobs to Supabase`);
}

export async function getFPTJobs(limit: number = 3): Promise<FPTJobDB[]> {
  if (!supabase) {
    console.warn("Supabase not initialized - returning empty jobs");
    return [];
  }

  const { data, error } = await supabase
    .from("fpt_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }

  return data || [];
}

export async function clearOldJobs(daysOld: number = 30): Promise<void> {
  if (!supabase) {
    console.warn("Supabase not initialized - skipping cleanup");
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { error } = await supabase
    .from("fpt_jobs")
    .delete()
    .lt("created_at", cutoffDate.toISOString());

  if (error) {
    console.error("Error clearing old jobs:", error);
  } else {
    console.log(`✓ Cleared jobs older than ${daysOld} days`);
  }
}
