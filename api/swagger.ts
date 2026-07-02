// @ts-ignore
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FPT Job Application API",
      description:
        "AI-powered job matching and application assistant for FPT positions using Gemini AI",
      version: "1.0.0",
      contact: {
        name: "FPT Job Search",
        url: "https://careers.fpt.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current environment (Auto-detected)",
      },
      {
        url: "https://ai-job-search-pink.vercel.app",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
    components: {
      schemas: {
        ApplyRequest: {
          type: "object",
          required: ["cv_content"],
          properties: {
            cv_content: {
              type: "string",
              description: "Full CV text content",
              example:
                "Tôi là Software Engineer với 5 năm kinh nghiệm. Skills: Python, React, AWS, SQL. Vị trí hiện tại: Ho Chi Minh City",
            },
            source: {
              type: "string",
              enum: ["fpt", "linkedin"],
              default: "linkedin",
              description: "Job search database source",
            },
            query: {
              type: "string",
              description: "Keyword search query (defaults to parsed role from CV)",
            },
            location: {
              type: "string",
              description: "Location to search (defaults to parsed location from CV)",
            },
          },
        },
        CVAnalysis: {
          type: "object",
          properties: {
            current_role: {
              type: "string",
              example: "Software Engineer",
            },
            location: {
              type: "string",
              example: "Ho Chi Minh City",
            },
            skills: {
              type: "array",
              items: { type: "string" },
              example: ["Python", "React", "AWS"],
            },
            years_experience: {
              type: "number",
              example: 5,
            },
            education: {
              type: "string",
              example: "Bachelor Computer Science",
            },
          },
        },
        FPTJob: {
          type: "object",
          properties: {
            job_id: {
              type: "string",
              example: "FPT-001",
            },
            title: {
              type: "string",
              example: "Senior Backend Developer",
            },
            location: {
              type: "string",
              example: "Ho Chi Minh City",
            },
            company: {
              type: "string",
              example: "FPT Software",
            },
            job_url: {
              type: "string",
              example: "https://careers.fpt.com/job/001",
            },
            salary_range: {
              type: "string",
              example: "15-25 triệu",
            },
            deadline: {
              type: "string",
              example: "2026-08-31",
            },
            fit_score: {
              type: "number",
              minimum: 0,
              maximum: 1,
              example: 0.92,
              description: "Job fit score (0-1)",
            },
            matching_skills: {
              type: "array",
              items: { type: "string" },
              example: ["Python", "AWS"],
            },
            missing_skills: {
              type: "array",
              items: { type: "string" },
              example: ["Kubernetes"],
            },
            why_good_fit: {
              type: "string",
              example: "Bạn có kinh nghiệm backend mạnh và kỹ năng AWS phù hợp với yêu cầu",
            },
            cover_letter: {
              type: "string",
              description: "AI-generated cover letter in Vietnamese",
            },
            interview_tips: {
              type: "array",
              items: { type: "string" },
              example: [
                "Chuẩn bị câu trả lời về kinh nghiệm AWS",
                "Tìm hiểu về các dự án recent của FPT",
              ],
            },
            job_description: {
              type: "string",
              description: "Full job description",
            },
          },
        },
        ApplyResponse: {
          type: "object",
          properties: {
            cv_analysis: {
              $ref: "#/components/schemas/CVAnalysis",
            },
            fpt_jobs: {
              type: "array",
              items: {
                $ref: "#/components/schemas/FPTJob",
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Failed to process application",
            },
            message: {
              type: "string",
              example: "Error details here",
            },
          },
        },
        RawJob: {
          type: "object",
          properties: {
            job_id: {
              type: "string",
              example: "FPT-001",
            },
            title: {
              type: "string",
              example: "Senior Backend Developer",
            },
            location: {
              type: "string",
              example: "Ho Chi Minh City",
            },
            company: {
              type: "string",
              example: "FPT Software",
            },
            job_url: {
              type: "string",
              example: "https://careers.fpt.com/job/001",
            },
            salary_range: {
              type: "string",
              example: "15-25 triệu",
            },
            deadline: {
              type: "string",
              example: "2026-08-31",
            },
            job_description: {
              type: "string",
              description: "Full job description",
            },
          },
        },
        RecommendRequest: {
          type: "object",
          required: ["cv_content"],
          properties: {
            cv_content: {
              type: "string",
              description: "Full CV text content",
              example:
                "Tôi là Software Engineer với 5 năm kinh nghiệm. Skills: Python, React, AWS, SQL. Vị trí hiện tại: Ho Chi Minh City",
            },
            source: {
              type: "string",
              enum: ["fpt", "linkedin"],
              default: "linkedin",
              description: "Job search database source",
            },
            query: {
              type: "string",
              description: "Keyword search query (defaults to parsed role from CV)",
            },
            location: {
              type: "string",
              description: "Location to search (defaults to parsed location from CV)",
            },
          },
        },
        RecommendResponse: {
          type: "object",
          properties: {
            cv_analysis: {
              $ref: "#/components/schemas/CVAnalysis",
            },
            jobs: {
              type: "array",
              items: {
                $ref: "#/components/schemas/RawJob",
              },
            },
          },
        },
        AnalyzeJobRequest: {
          type: "object",
          required: ["cv_analysis", "job"],
          properties: {
            cv_analysis: {
              $ref: "#/components/schemas/CVAnalysis",
            },
            job: {
              $ref: "#/components/schemas/RawJob",
            },
          },
        },
        AnalyzeJobResponse: {
          type: "object",
          properties: {
            fit_score: {
              type: "number",
              minimum: 0,
              maximum: 1,
              example: 0.92,
            },
            matching_skills: {
              type: "array",
              items: { type: "string" },
              example: ["Python", "AWS"],
            },
            missing_skills: {
              type: "array",
              items: { type: "string" },
              example: ["Kubernetes"],
            },
            why_good_fit: {
              type: "string",
              example: "Bạn có kinh nghiệm backend mạnh và kỹ năng AWS phù hợp với yêu cầu",
            },
            cover_letter: {
              type: "string",
              description: "AI-generated cover letter in Vietnamese",
            },
            interview_tips: {
              type: "array",
              items: { type: "string" },
              example: [
                "Chuẩn bị câu trả lời về kinh nghiệm AWS",
                "Tìm hiểu về các dự án recent của FPT",
              ],
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "routes", "*.ts"),
    path.join(__dirname, "routes", "*.js"),
    "./api/routes/*.ts",
    "./api/routes/*.js",
    "./dist/api/routes/*.js"
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
