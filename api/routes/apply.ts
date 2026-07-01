import { Router, Request, Response } from "express";
import {
  parseCVWithGemini,
  generateCoverLetter,
  generateInterviewTips,
  calculateJobFit,
  identifySkillGaps,
} from "../lib/gemini.js";
import { getFPTJobs } from "../lib/supabase.js";
import { ApplyRequest, ApplyResponse, FPTJob, CVAnalysis, JobForProcessing } from "../types.js";

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
  try {
    const { cv_content } = req.body;

    if (!cv_content || cv_content.trim().length === 0) {
      return res.status(400).json({ error: "CV content is required" });
    }

    // Step 1: Parse CV to extract candidate info
    console.log("Parsing CV...");
    const cvAnalysis = await parseCVWithGemini(cv_content);

    // Step 2: Get FPT jobs from Supabase (cached)
    console.log("Fetching FPT jobs from Supabase...");
    const dbJobs = await getFPTJobs(3);
    console.log(`Found ${dbJobs.length} jobs from database`);

    if (dbJobs.length === 0) {
      return res.status(503).json({
        error: "No jobs available",
        message: "FPT job database is empty. Please run scraper first.",
      });
    }

    // Transform DB jobs to raw format for processing
    const rawJobs = dbJobs.map((job) => ({
      id: job.job_id,
      title: job.title,
      location: job.location,
      company: job.company,
      url: job.job_url,
      salary: job.salary_range,
      deadline: job.deadline,
      description: job.job_description,
    }));

    // Step 3: Process each job with Gemini analysis
    console.log(`Processing ${rawJobs.length} jobs...`);
    const fptJobs: FPTJob[] = [];

    for (const rawJob of rawJobs.slice(0, 3)) {
      // Limit to 3 jobs for faster processing
      try {
        // Identify skill gaps
        const skillGapsResult = await identifySkillGaps(cvAnalysis, rawJob.description);

        const jobForProcessing: JobForProcessing = {
          job_id: rawJob.id,
          title: rawJob.title,
          location: rawJob.location,
          company: rawJob.company,
          job_url: rawJob.url,
          salary_range: rawJob.salary,
          deadline: rawJob.deadline,
          matching_skills: skillGapsResult.matching_skills,
          missing_skills: skillGapsResult.missing_skills,
          job_description: rawJob.description,
        };

        // Calculate job fit
        const fitAnalysis = await calculateJobFit(cvAnalysis, jobForProcessing);

        // Generate cover letter
        const coverLetter = await generateCoverLetter(cvAnalysis, jobForProcessing);

        // Generate interview tips
        const interviewTips = await generateInterviewTips(cvAnalysis, jobForProcessing);

        fptJobs.push({
          job_id: rawJob.id,
          title: rawJob.title,
          location: rawJob.location,
          company: rawJob.company,
          job_url: rawJob.url,
          salary_range: rawJob.salary,
          deadline: rawJob.deadline,
          fit_score: fitAnalysis.fit_score,
          matching_skills: skillGapsResult.matching_skills,
          missing_skills: skillGapsResult.missing_skills,
          why_good_fit: fitAnalysis.why_good_fit,
          cover_letter: coverLetter,
          interview_tips: interviewTips,
          job_description: rawJob.description,
        });
      } catch (error) {
        console.error(`Error processing job ${rawJob.id}:`, error instanceof Error ? error.message : String(error));
        // Continue with next job
      }
    }

    // Sort by fit score descending
    fptJobs.sort((a, b) => b.fit_score - a.fit_score);

    // If no jobs were processed, return basic job info without AI analysis
    if (fptJobs.length === 0 && rawJobs.length > 0) {
      console.log("No jobs processed with AI, returning basic job info");
      for (const rawJob of rawJobs.slice(0, 3)) {
        fptJobs.push({
          job_id: rawJob.id,
          title: rawJob.title,
          location: rawJob.location,
          company: rawJob.company,
          job_url: rawJob.url,
          salary_range: rawJob.salary,
          deadline: rawJob.deadline,
          fit_score: 0.7, // Default fit score
          matching_skills: cvAnalysis.skills.slice(0, 2),
          missing_skills: ["Docker", "Kubernetes"],
          why_good_fit: `Vị trí ${rawJob.title} phù hợp với kinh nghiệm của bạn`,
          cover_letter: `Kính gửi Nhà tuyển dụng,\n\nTôi là ${cvAnalysis.current_role} với ${cvAnalysis.years_experience} năm kinh nghiệm. Tôi rất hứng thú với vị trí này tại FPT Software.\n\nTôi mong nhận được cơ hội trao đổi thêm.\n\nTrân trọng`,
          interview_tips: [
            `Chuẩn bị câu trả lời về kinh nghiệm ${cvAnalysis.current_role} của bạn`,
            `Nghiên cứu về FPT Software và các dự án của họ`,
            `Luyện tập giao tiếp tiếng Anh`,
          ],
          job_description: rawJob.description,
        });
      }
    }

    const response: ApplyResponse = {
      cv_analysis: cvAnalysis,
      fpt_jobs: fptJobs,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in /apply:", error);
    res.status(500).json({
      error: "Failed to process application",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
