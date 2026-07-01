import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  console.log(`Saving ${jobs.length} jobs to Supabase...`);

  const { error } = await supabase
    .from("fpt_jobs")
    .upsert(jobs, { onConflict: "job_id" });

  if (error) {
    throw new Error(`Failed to save jobs: ${error.message}`);
  }

  console.log(`✓ Saved ${jobs.length} jobs to Supabase`);
}

export async function getFPTJobs(limit: number = 3): Promise<FPTJobDB[]> {
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
