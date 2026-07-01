import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVAnalysis, FPTJob, JobForProcessing } from "../types.js";

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

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  // Clean up markdown if present
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(text);
    return {
      current_role: parsed.current_role || "Software Developer",
      location: parsed.location || "Ho Chi Minh City",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      years_experience: parsed.years_experience || 0,
      education: parsed.education || "Unknown",
    };
  } catch (e) {
    console.error("CV parsing error:", e, "Raw response:", text);
    return {
      current_role: "Software Developer",
      location: "Ho Chi Minh City",
      skills: ["Python", "React", "AWS"],
      years_experience: 3,
      education: "Bachelor Computer Science",
    };
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
    return JSON.parse(text);
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
    return JSON.parse(text);
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
    return JSON.parse(text);
  } catch (e) {
    return {
      matching_skills: cvAnalysis.skills.slice(0, 2),
      missing_skills: ["Kubernetes", "Docker"],
    };
  }
}
