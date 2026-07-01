export interface CVAnalysis {
  current_role: string;
  location: string;
  skills: string[];
  years_experience: number;
  education: string;
}

export interface FPTJob {
  job_id: string;
  title: string;
  location: string;
  company: string;
  job_url: string;
  salary_range?: string;
  deadline?: string;
  fit_score: number;
  matching_skills: string[];
  missing_skills: string[];
  why_good_fit: string;
  cover_letter: string;
  interview_tips: string[];
  job_description: string;
}

export interface ApplyResponse {
  cv_analysis: CVAnalysis;
  fpt_jobs: FPTJob[];
}

export interface ApplyRequest {
  cv_content: string;
}

export interface JobForProcessing {
  job_id: string;
  title: string;
  location: string;
  company: string;
  job_url: string;
  salary_range?: string;
  deadline?: string;
  matching_skills: string[];
  missing_skills: string[];
  job_description: string;
}
