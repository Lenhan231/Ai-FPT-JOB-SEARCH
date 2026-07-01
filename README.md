# FPT Job Search - AI Application Assistant API

AI-powered job matching and application assistant for FPT positions. Get CV analysis, job recommendations with fit scores, tailored cover letters, and interview tips—all powered by Google Gemini AI.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Run locally
npm run dev

# Visit API docs
http://localhost:3000/api/docs
```

## Features

- 📄 **CV Analysis** - Extract skills, experience, education from CV text
- 🎯 **Job Matching** - Match profiles with FPT jobs (0-1 fit score)
- 📝 **AI Cover Letters** - Generate tailored cover letters in Vietnamese
- 💡 **Interview Tips** - Personalized interview preparation
- 🔍 **Skill Gap Analysis** - Identify matching and missing skills
- 💾 **Smart Caching** - Weekly job scraping to Supabase (instant API responses)
- 📚 **Swagger Docs** - Interactive API documentation

## API Endpoint

**POST** `/api/apply`

```json
Request:
{
  "cv_content": "Software Engineer 5 năm. Skills: Python, React, AWS. HCMC. Bachelor CS"
}

Response:
{
  "cv_analysis": {
    "current_role": "Software Engineer",
    "location": "Ho Chi Minh City",
    "skills": ["Python", "React", "AWS"],
    "years_experience": 5,
    "education": "Bachelor Computer Science"
  },
  "fpt_jobs": [
    {
      "job_id": "FPT-001",
      "title": "Senior Backend Developer",
      "location": "Ho Chi Minh City",
      "fit_score": 0.85,
      "matching_skills": ["Python", "AWS"],
      "missing_skills": ["Kubernetes"],
      "cover_letter": "Kính gửi Ban Tuyển dụng...",
      "interview_tips": ["Tip 1", "Tip 2", ...]
    }
  ]
}
```

## Tech Stack

- **API:** Express.js + TypeScript
- **AI:** Google Generative AI (Gemini 2.5 Flash)
- **Database:** Supabase (PostgreSQL)
- **Scheduling:** node-cron (weekly job updates)
- **Deployment:** Vercel
- **Docs:** Swagger/OpenAPI

## Setup Guide

See [API.md](./API.md) for:
- Environment variables setup
- Supabase database schema
- Local development instructions
- Vercel deployment steps
- Full API documentation

## Development

- `npm run build` — Compile TypeScript
- `npm run dev` — Start dev server with auto-reload

## Deployment

```bash
npm run build
vercel --prod --env GEMINI_API_KEY="..." --env SUPABASE_URL="..." --env SUPABASE_KEY="..."
```

## Automatic Job Updates

The API automatically:
- Scrapes FPT jobs on startup
- Runs weekly cron job (Monday 2 AM UTC) to refresh jobs
- Stores jobs in Supabase for instant API responses
- Cleans up jobs older than 30 days

## Environment Variables

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Generative AI API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/public key |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment (development/production) |

## Project Structure

```
api/
├── index.ts              # Express server + cron
├── types.ts              # TypeScript types
├── swagger.ts            # API docs
├── lib/
│   ├── gemini.ts         # Gemini AI integration
│   ├── fpt-scraper.ts    # FPT job scraper
│   ├── job-scraper.ts    # Scraper scheduler
│   └── supabase.ts       # Supabase client
└── routes/
    └── apply.ts          # /api/apply endpoint
```

## Performance Notes

- **First request:** 1-2 minutes (Gemini processing)
- **Subsequent requests:** < 1 second (cached from Supabase)
- **Job updates:** Automatic weekly refresh
- **Concurrency:** Handle multiple requests efficiently with caching

## License

MIT

---

**[Full API Documentation](./API.md)** | **[GitHub](https://github.com/Lenhan231/Ai-FPT-JOB-SEARCH)**
