import { Router, Request, Response } from "express";
import {
  parseCVWithGemini,
  analyzeJobsBatch,
  analyzeSingleJob
} from "../lib/gemini.js";
import { getFPTJobs } from "../lib/supabase.js";
import { scrapeFPTJobs } from "../lib/fpt-scraper.js";
import { fetchLinkedInJobs } from "../lib/linkedin-scraper.js";
import logger from "../lib/logger.js";
import {
  ApplyRequest,
  ApplyResponse,
  FPTJob,
  CVAnalysis,
  JobForProcessing,
  RecommendRequest,
  RecommendResponse,
  AnalyzeJobRequest,
  AnalyzeJobResponse,
  RawJob
} from "../types.js";

const router = Router();

/**
 * @swagger
 * /api/apply:
 *   post:
 *     summary: Analyze CV and get FPT job recommendations
 *     description: |
 *       Submit a CV and receive personalized FPT job recommendations with:
 *       - CV analysis (role, skills, experience)
 *       - Matching FPT jobs ranked by fit score
 *       - AI-generated cover letters in Vietnamese
 *       - Personalized interview tips
 *       - Skill gap analysis
 *     tags:
 *       - Job Recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyRequest'
 *           example:
 *             cv_content: "Tôi là Software Engineer 5 năm. Skills: Python, React, AWS"
 *     responses:
 *       200:
 *         description: Successfully processed CV and returned job recommendations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplyResponse'
 *       400:
 *         description: Bad request - CV content is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/apply", async (req: Request<{}, {}, ApplyRequest>, res: Response) => {
  const startTime = Date.now();
  try {
    const { cv_content, source = "linkedin", query, location } = req.body;

    if (!cv_content || cv_content.trim().length === 0) {
      return res.status(400).json({ error: "CV content is required" });
    }

    // Step 1: Parse CV to extract candidate info
    logger.info("Parsing CV...");
    const cvAnalysis = await parseCVWithGemini(cv_content);

    let rawJobs: {
      id: string;
      title: string;
      location: string;
      company: string;
      url: string;
      salary?: string;
      deadline?: string;
      description: string;
    }[] = [];

    if (source === "linkedin") {
      const searchQuery = query || cvAnalysis.current_role;
      const searchLocation = location || cvAnalysis.location || "Vietnam";
      logger.info(`Searching LinkedIn for "${searchQuery}" in "${searchLocation}"...`);
      
      const linkedinJobs = await fetchLinkedInJobs(searchQuery, searchLocation, 3);
      rawJobs = linkedinJobs.map(job => ({
        id: job.id,
        title: job.title,
        location: job.location || "Remote",
        company: job.company || "Company",
        url: job.url,
        salary: job.employmentType || undefined,
        deadline: undefined,
        description: job.description || "No description provided."
      }));
    } else {
      // Step 2: Get FPT jobs from Supabase (cached)
      logger.info("Fetching FPT jobs from Supabase...");
      let dbJobs = await getFPTJobs(3);
      logger.info(`Found ${dbJobs.length} jobs from database`);

      if (dbJobs.length === 0) {
        logger.warn("FPT job database is empty. Falling back to direct scraping...");
        const scrapedJobs = await scrapeFPTJobs("");
        dbJobs = scrapedJobs.map((job) => ({
          job_id: job.id,
          title: job.title,
          location: job.location,
          company: job.company,
          job_url: job.url,
          salary_range: job.salary,
          deadline: job.deadline,
          job_description: job.description,
        }));
      }

      rawJobs = dbJobs.map((job) => ({
        id: job.job_id,
        title: job.title,
        location: job.location,
        company: job.company,
        url: job.job_url,
        salary: job.salary_range,
        deadline: job.deadline,
        description: job.job_description,
      }));
    }

    if (rawJobs.length === 0) {
      return res.status(503).json({
        error: "No jobs available",
        message: `No jobs were found matching your criteria from source: ${source}.`,
      });
    }

    // Step 3: Process jobs with batch Gemini analysis (limit to 3 jobs for fast turnaround)
    const jobsToAnalyze = rawJobs.slice(0, 3);
    logger.info(`Processing ${jobsToAnalyze.length} jobs in batch...`);
    
    let fptJobs: FPTJob[] = [];
    
    try {
      const batchJobsInput: JobForProcessing[] = jobsToAnalyze.map(job => ({
        job_id: job.id,
        title: job.title,
        location: job.location,
        company: job.company,
        job_url: job.url,
        salary_range: job.salary,
        deadline: job.deadline,
        matching_skills: [],
        missing_skills: [],
        job_description: job.description
      }));

      const batchResults = await analyzeJobsBatch(cvAnalysis, batchJobsInput);
      
      fptJobs = batchResults.map(result => {
        const originalJob = jobsToAnalyze.find(j => j.id === result.job_id);
        return {
          job_id: result.job_id,
          title: originalJob?.title || "",
          location: originalJob?.location || "",
          company: originalJob?.company || "",
          job_url: originalJob?.url || "",
          salary_range: originalJob?.salary,
          deadline: originalJob?.deadline,
          fit_score: result.fit_score,
          matching_skills: result.matching_skills,
          missing_skills: result.missing_skills,
          why_good_fit: result.why_good_fit,
          cover_letter: result.cover_letter,
          interview_tips: result.interview_tips,
          job_description: originalJob?.description || ""
        };
      });
    } catch (batchError) {
      logger.error("Batch job analysis failed, using fallback mock generation:", batchError);
      
      // Fallback: Populate basic details
      fptJobs = jobsToAnalyze.map(rawJob => ({
        job_id: rawJob.id,
        title: rawJob.title,
        location: rawJob.location,
        company: rawJob.company,
        job_url: rawJob.url,
        salary_range: rawJob.salary,
        deadline: rawJob.deadline,
        fit_score: 0.7,
        matching_skills: cvAnalysis.skills.slice(0, 2),
        missing_skills: ["Docker", "Kubernetes"],
        why_good_fit: `Vị trí ${rawJob.title} phù hợp với kinh nghiệm của bạn`,
        cover_letter: `Kính gửi Nhà tuyển dụng,\n\nTôi là ${cvAnalysis.current_role} với ${cvAnalysis.years_experience} năm kinh nghiệm. Tôi rất hứng thú với vị trí này tại ${rawJob.company}.\n\nTôi mong nhận được cơ hội trao đổi thêm.\n\nTrân trọng`,
        interview_tips: [
          `Chuẩn bị câu trả lời về kinh nghiệm ${cvAnalysis.current_role} của bạn`,
          `Nghiên cứu về ${rawJob.company} và các dự án của họ`,
          `Luyện tập giao tiếp tiếng Anh`,
        ],
        job_description: rawJob.description,
      }));
    }

    // Sort by fit score descending
    fptJobs.sort((a, b) => b.fit_score - a.fit_score);

    const response: ApplyResponse = {
      cv_analysis: cvAnalysis,
      fpt_jobs: fptJobs,
    };

    const duration = Date.now() - startTime;
    logger.info(`Successfully processed application in ${duration}ms`);
    
    res.json(response);
  } catch (error) {
    logger.error("Error in /apply:", error);
    res.status(500).json({
      error: "Failed to process application",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * @swagger
 * /api/recommend:
 *   post:
 *     summary: Parse CV and quickly list matching jobs
 *     description: |
 *       Parses the CV and searches for matching jobs from LinkedIn or FPT database.
 *       Does not run deep AI matching analysis, making this call very fast.
 *     tags:
 *       - Job Recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecommendRequest'
 *           example:
 *             cv_content: "Tôi là Software Engineer 5 năm. Skills: Python, React, AWS"
 *     responses:
 *       200:
 *         description: Successfully parsed CV and returned matching jobs list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendResponse'
 *       400:
 *         description: Bad request - CV content is required
 *       500:
 *         description: Internal server error
 */
router.post("/recommend", async (req: Request<{}, {}, RecommendRequest>, res: Response) => {
  const startTime = Date.now();
  try {
    const { cv_content, source = "linkedin", query, location } = req.body;

    if (!cv_content || cv_content.trim().length === 0) {
      return res.status(400).json({ error: "CV content is required" });
    }

    // Step 1: Parse CV to extract candidate info
    logger.info("Parsing CV for recommendation...");
    const cvAnalysis = await parseCVWithGemini(cv_content);

    let rawJobs: {
      id: string;
      title: string;
      location: string;
      company: string;
      url: string;
      salary?: string;
      deadline?: string;
      description: string;
    }[] = [];

    if (source === "linkedin") {
      const searchQuery = query || cvAnalysis.current_role;
      const searchLocation = location || cvAnalysis.location || "Vietnam";
      logger.info(`Searching LinkedIn for "${searchQuery}" in "${searchLocation}"...`);
      
      const linkedinJobs = await fetchLinkedInJobs(searchQuery, searchLocation, 5);
      rawJobs = linkedinJobs.map(job => ({
        id: job.id,
        title: job.title,
        location: job.location || "Remote",
        company: job.company || "Company",
        url: job.url,
        salary: job.employmentType || undefined,
        deadline: undefined,
        description: job.description || "No description provided."
      }));
    } else {
      logger.info("Fetching FPT jobs from Supabase...");
      let dbJobs = await getFPTJobs(5);
      logger.info(`Found ${dbJobs.length} jobs from database`);

      if (dbJobs.length === 0) {
        logger.warn("FPT job database is empty. Falling back to direct scraping...");
        const scrapedJobs = await scrapeFPTJobs("");
        dbJobs = scrapedJobs.map((job) => ({
          job_id: job.id,
          title: job.title,
          location: job.location,
          company: job.company,
          job_url: job.url,
          salary_range: job.salary,
          deadline: job.deadline,
          job_description: job.description,
        }));
      }

      rawJobs = dbJobs.map((job) => ({
        id: job.job_id,
        title: job.title,
        location: job.location,
        company: job.company,
        url: job.job_url,
        salary: job.salary_range,
        deadline: job.deadline,
        description: job.job_description,
      }));
    }

    const jobs: RawJob[] = rawJobs.map((job) => ({
      job_id: job.id,
      title: job.title,
      location: job.location,
      company: job.company,
      job_url: job.url,
      salary_range: job.salary,
      deadline: job.deadline,
      job_description: job.description,
    }));

    const response: RecommendResponse = {
      cv_analysis: cvAnalysis,
      jobs,
    };

    const duration = Date.now() - startTime;
    logger.info(`Successfully returned recommendations in ${duration}ms`);
    res.json(response);
  } catch (error) {
    logger.error("Error in /recommend:", error);
    res.status(500).json({
      error: "Failed to fetch recommendations",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * @swagger
 * /api/analyze-job:
 *   post:
 *     summary: Deeply analyze and match a single job against the parsed CV
 *     description: Returns fit score, matching skills, missing skills, customized cover letter, and interview tips.
 *     tags:
 *       - Job Recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalyzeJobRequest'
 *     responses:
 *       200:
 *         description: Successfully analyzed job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzeJobResponse'
 *       400:
 *         description: Bad request - CV analysis and Job info are required
 *       500:
 *         description: Internal server error
 */
router.post("/analyze-job", async (req: Request<{}, {}, AnalyzeJobRequest>, res: Response) => {
  const startTime = Date.now();
  try {
    const { cv_analysis, job } = req.body;

    if (!cv_analysis || !job || !job.job_description) {
      return res.status(400).json({
        error: "cv_analysis and job (with job_description) are required"
      });
    }

    const analysisResult = await analyzeSingleJob(cv_analysis, job);

    const duration = Date.now() - startTime;
    logger.info(`Successfully analyzed job ${job.job_id} in ${duration}ms`);
    res.json(analysisResult);
  } catch (error) {
    logger.error("Error in /analyze-job:", error);
    res.status(500).json({
      error: "Failed to analyze job",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
