import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVAnalysis, FPTJob, JobForProcessing, RawJob, AnalyzeJobResponse } from "../types.js";
import logger from "./logger.js";

const MODEL = "gemini-2.5-flash";

// Lazy initialize Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function cleanJsonString(jsonStr: string): string {
  // Clean markdown blocks
  let cleaned = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  // Replace literal newlines and tabs inside double quotes
  cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
    return match
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  });
  return cleaned;
}

async function callGroqChat(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  logger.info("Calling Groq API fallback...");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API returned status ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function parseCVWithGemini(cvContent: string): Promise<CVAnalysis> {
  const model = getGenAI().getGenerativeModel({ model: MODEL });

  const prompt = `Analyze this CV carefully and extract the following information in JSON format. Return a complete, valid JSON object with all fields filled.

IMPORTANT:
- If location is not mentioned, assume "Ho Chi Minh City" (most common in Vietnam)
- Extract education degree and field
- List all technical skills mentioned
- Return ONLY valid JSON, no markdown or explanations

Expected format:
{
  "current_role": "job title from current or most recent position",
  "location": "city in Vietnam",
  "skills": ["skill1", "skill2", "skill3"],
  "years_experience": number,
  "education": "degree and field e.g. Bachelor Computer Science"
}

CV Content:
${cvContent}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJsonString(text));
    return {
      current_role: parsed.current_role || "Software Developer",
      location: parsed.location || "Ho Chi Minh City",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      years_experience: parsed.years_experience || 0,
      education: parsed.education || "Unknown",
    };
  } catch (geminiError) {
    logger.warn("Gemini CV parsing failed, trying Groq fallback:", geminiError);
    try {
      const text = await callGroqChat(prompt);
      const parsed = JSON.parse(cleanJsonString(text));
      return {
        current_role: parsed.current_role || "Software Developer",
        location: parsed.location || "Ho Chi Minh City",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        years_experience: parsed.years_experience || 0,
        education: parsed.education || "Unknown",
      };
    } catch (groqError) {
      logger.error("Groq fallback also failed for CV parsing:", groqError);
      return {
        current_role: "Software Developer",
        location: "Ho Chi Minh City",
        skills: ["Python", "React", "AWS"],
        years_experience: 3,
        education: "Bachelor Computer Science",
      };
    }
  }
}

export async function generateCoverLetter(
  cvAnalysis: CVAnalysis,
  job: JobForProcessing
): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: MODEL });

  const prompt = `Write a professional cover letter in Vietnamese for this job application.

Candidate Profile:
- Role: ${cvAnalysis.current_role}
- Location: ${cvAnalysis.location}
- Skills: ${cvAnalysis.skills.join(", ")}
- Experience: ${cvAnalysis.years_experience} years
- Education: ${cvAnalysis.education}

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.job_description}

Write a compelling, professional cover letter in Vietnamese (tiếng Việt) that:
1. Shows genuine interest in the FPT position
2. Highlights relevant skills and experience
3. Addresses how the candidate can contribute to FPT
4. Is approximately 200-300 words

Return ONLY the cover letter text, no additional commentary.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateInterviewTips(
  cvAnalysis: CVAnalysis,
  job: JobForProcessing
): Promise<string[]> {
  const model = getGenAI().getGenerativeModel({ model: MODEL });

  const prompt = `Generate 5 key interview tips for a ${job.title} position at FPT Software in Vietnamese.

Candidate: ${cvAnalysis.current_role} with ${cvAnalysis.years_experience} years experience
Skills: ${cvAnalysis.skills.join(", ")}
Job Requirements: ${job.job_description}

Return a JSON array of 5 tips in Vietnamese:
["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]

Return ONLY valid JSON array, no markdown or explanations.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(cleanJsonString(text));
  } catch (e) {
    return [
      "Chuẩn bị câu trả lời về kinh nghiệm và kỹ năng của bạn",
      "Tìm hiểu về FPT Software và các dự án của họ",
      "Chuẩn bị các câu hỏi để hỏi nhà tuyển dụng",
      "Luyện tập kỹ năng giao tiếp bằng tiếng Anh",
      "Chuẩn bị thảo luận về motivation làm việc tại FPT",
    ];
  }
}

export async function calculateJobFit(
  cvAnalysis: CVAnalysis,
  job: JobForProcessing
): Promise<{ fit_score: number; why_good_fit: string }> {
  const model = getGenAI().getGenerativeModel({ model: MODEL });

  const prompt = `Analyze job fit between candidate and FPT position.

Candidate:
- Role: ${cvAnalysis.current_role}
- Skills: ${cvAnalysis.skills.join(", ")}
- Experience: ${cvAnalysis.years_experience} years

Job: ${job.title}
Description: ${job.job_description}

Return JSON with:
{
  "fit_score": number between 0 and 1,
  "why_good_fit": "1-2 sentence explanation in Vietnamese"
}

Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(cleanJsonString(text));
  } catch (e) {
    return {
      fit_score: 0.5,
      why_good_fit: "Cần thêm thông tin để đánh giá phù hợp",
    };
  }
}

export async function identifySkillGaps(
  cvAnalysis: CVAnalysis,
  jobDescription: string
): Promise<{ matching_skills: string[]; missing_skills: string[] }> {
  const model = getGenAI().getGenerativeModel({ model: MODEL });

  const prompt = `Analyze skill alignment.

Candidate Skills: ${cvAnalysis.skills.join(", ")}
Job Description: ${jobDescription}

Return JSON:
{
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"]
}

Return ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(cleanJsonString(text));
  } catch (e) {
    return {
      matching_skills: cvAnalysis.skills.slice(0, 2),
      missing_skills: ["Kubernetes", "Docker"],
    };
  }
}

export interface JobBatchAnalysisResult {
  job_id: string;
  fit_score: number;
  matching_skills: string[];
  missing_skills: string[];
  why_good_fit: string;
  cover_letter: string;
  interview_tips: string[];
}

export async function analyzeJobsBatch(
  cvAnalysis: CVAnalysis,
  jobs: JobForProcessing[]
): Promise<JobBatchAnalysisResult[]> {
  logger.info(`Analyzing ${jobs.length} jobs in a single batch with Gemini`);
  
  const model = getGenAI().getGenerativeModel({
    model: MODEL
  });

  const prompt = `You are an AI Job Matching Assistant. Analyze the candidate's CV analysis against the list of FPT jobs.
  
Candidate Profile:
- Current Role: ${cvAnalysis.current_role}
- Location: ${cvAnalysis.location}
- Skills: ${cvAnalysis.skills.join(", ")}
- Experience: ${cvAnalysis.years_experience} years
- Education: ${cvAnalysis.education}

List of Jobs to Evaluate:
${jobs.map((job, idx) => `
Job #${idx + 1}:
- Job ID: ${job.job_id}
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.job_description}
`).join("\n---\n")}

For each job, perform the following tasks:
1. Identify "matching_skills" (list of skills candidate has that are relevant to this job).
2. Identify "missing_skills" (list of key skills required/preferred by the job that the candidate lacks).
3. Calculate a "fit_score" (float between 0.0 and 1.0 representing how well the candidate fits this job role).
4. Write "why_good_fit" (1-2 sentences explanation in Vietnamese (tiếng Việt)).
5. Generate a "cover_letter" (a professional, customized cover letter of 200-300 words in Vietnamese (tiếng Việt) showing genuine interest in the role at FPT, highlighting relevant skills and experience, and addressing how the candidate can contribute).
6. Generate 5 "interview_tips" (specific preparation tips tailored for this candidate applying for this specific position, in Vietnamese (tiếng Việt)).

Return a JSON array of objects with the exact schema:
[
  {
    "job_id": "string",
    "fit_score": number,
    "matching_skills": ["string"],
    "missing_skills": ["string"],
    "why_good_fit": "string",
    "cover_letter": "string",
    "interview_tips": ["string"]
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJsonString(text));
    
    if (Array.isArray(parsed)) {
      return parsed as JobBatchAnalysisResult[];
    }
    // Handle case where it's wrapped in an object (e.g. { "jobs": [...] })
    if (parsed && typeof parsed === "object") {
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key])) {
          return parsed[key] as JobBatchAnalysisResult[];
        }
      }
    }
    
    logger.error("Gemini batch analysis did not return an array:", text);
    throw new Error("Invalid response format from Gemini");
  } catch (error) {
    logger.warn("Gemini batch analysis failed, trying Groq fallback:", error);
    try {
      const text = await callGroqChat(prompt);
      const parsed = JSON.parse(cleanJsonString(text));
      
      if (Array.isArray(parsed)) {
        return parsed as JobBatchAnalysisResult[];
      }
      // Handle case where it's wrapped in an object (e.g. { "jobs": [...] })
      if (parsed && typeof parsed === "object") {
        for (const key of Object.keys(parsed)) {
          if (Array.isArray(parsed[key])) {
            return parsed[key] as JobBatchAnalysisResult[];
          }
        }
      }
      throw new Error("Invalid response format from Groq");
    } catch (groqError) {
      logger.error("Groq fallback also failed for batch analysis:", groqError);
      throw error; // Propagate original Gemini error so apply.ts can run default fallback
    }
  }
}

export async function analyzeSingleJob(
  cvAnalysis: CVAnalysis,
  job: RawJob
): Promise<AnalyzeJobResponse> {
  logger.info(`Analyzing single job ${job.job_id} (${job.title})`);
  
  const model = getGenAI().getGenerativeModel({
    model: MODEL
  });

  const prompt = `You are an AI Job Matching Assistant. Deeply analyze the candidate's CV analysis against this specific job.
  
Candidate Profile:
- Current Role: ${cvAnalysis.current_role}
- Location: ${cvAnalysis.location}
- Skills: ${cvAnalysis.skills.join(", ")}
- Experience: ${cvAnalysis.years_experience} years
- Education: ${cvAnalysis.education}

Job Details:
- Job ID: ${job.job_id}
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.job_description}

Perform the following tasks:
1. Identify "matching_skills" (list of skills candidate has that are relevant to this job).
2. Identify "missing_skills" (list of key skills required/preferred by the job that the candidate lacks).
3. Calculate a "fit_score" (float between 0.0 and 1.0 representing how well the candidate fits this job role).
4. Write "why_good_fit" (1-2 sentences explanation in Vietnamese (tiếng Việt)).
5. Generate a "cover_letter" (a professional, customized cover letter of 200-300 words in Vietnamese (tiếng Việt) showing genuine interest in the role, highlighting relevant skills and experience, and addressing how the candidate can contribute).
6. Generate 5 "interview_tips" (specific preparation tips tailored for this candidate applying for this specific position, in Vietnamese (tiếng Việt)).

Return ONLY a JSON object with the exact schema:
{
  "fit_score": number,
  "matching_skills": ["string"],
  "missing_skills": ["string"],
  "why_good_fit": "string",
  "cover_letter": "string",
  "interview_tips": ["string"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJsonString(text));
    
    return {
      fit_score: typeof parsed.fit_score === "number" ? parsed.fit_score : 0.5,
      matching_skills: Array.isArray(parsed.matching_skills) ? parsed.matching_skills : [],
      missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
      why_good_fit: parsed.why_good_fit || "Phù hợp cơ bản với yêu cầu.",
      cover_letter: parsed.cover_letter || "Kính gửi nhà tuyển dụng...",
      interview_tips: Array.isArray(parsed.interview_tips) ? parsed.interview_tips : [],
    };
  } catch (error) {
    logger.warn("Gemini single job analysis failed, trying Groq fallback:", error);
    try {
      const text = await callGroqChat(prompt);
      const parsed = JSON.parse(cleanJsonString(text));
      
      return {
        fit_score: typeof parsed.fit_score === "number" ? parsed.fit_score : 0.5,
        matching_skills: Array.isArray(parsed.matching_skills) ? parsed.matching_skills : [],
        missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
        why_good_fit: parsed.why_good_fit || "Phù hợp cơ bản với yêu cầu.",
        cover_letter: parsed.cover_letter || "Kính gửi nhà tuyển dụng...",
        interview_tips: Array.isArray(parsed.interview_tips) ? parsed.interview_tips : [],
      };
    } catch (groqError) {
      logger.error("Groq fallback also failed for single job analysis:", groqError);
      
      // Fallback: Populate basic details
      const matching_skills = cvAnalysis.skills.filter(skill =>
        job.job_description.toLowerCase().includes(skill.toLowerCase())
      );
      const missing_skills = ["Kỹ năng chuyên môn", "Kỹ năng mềm"];
      
      return {
        fit_score: 0.7,
        matching_skills,
        missing_skills,
        why_good_fit: `Vị trí ${job.title} phù hợp với kinh nghiệm của bạn.`,
        cover_letter: `Kính gửi Nhà tuyển dụng,\n\nTôi là ${cvAnalysis.current_role} với ${cvAnalysis.years_experience} năm kinh nghiệm. Tôi rất hứng thú với vị trí này tại ${job.company}.\n\nTôi mong nhận được cơ hội trao đổi thêm.\n\nTrân trọng`,
        interview_tips: [
          `Chuẩn bị câu trả lời về kinh nghiệm ${cvAnalysis.current_role} của bạn`,
          `Nghiên cứu về ${job.company} và các dự án của họ`,
          "Luyện tập giao tiếp tiếng Anh"
        ]
      };
    }
  }
}
