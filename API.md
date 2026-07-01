# FPT Job Application API

AI-powered job matching and application assistant for FPT positions. Uses Gemini AI to analyze CVs, match with jobs, and generate tailored cover letters.

## Quick Start

### Prerequisites
- Node.js 18+
- Gemini API key (from Google AI Studio)

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Run locally:**
```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Deploy to Vercel

```bash
vercel
# Follow prompts and add GEMINI_API_KEY environment variable
```

## API Endpoint

### `POST /api/apply`

Submit a CV and receive FPT job recommendations with analysis.

**Request:**
```json
{
  "cv_content": "Full CV text content here..."
}
```

**Response:**
```json
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
      "company": "FPT Software",
      "job_url": "https://careers.fpt.com/job/001",
      "salary_range": "15-25 triệu",
      "deadline": "2026-08-31",
      "fit_score": 0.92,
      "matching_skills": ["Python", "AWS"],
      "missing_skills": ["Kubernetes"],
      "why_good_fit": "Bạn có kinh nghiệm backend mạnh...",
      "cover_letter": "Cover letter tiếng Việt tailored...",
      "interview_tips": [
        "Tip 1: ...",
        "Tip 2: ..."
      ],
      "job_description": "Full job description..."
    }
  ]
}
```

## Testing

### Local Test
```bash
curl -X POST http://localhost:3000/api/apply \
  -H "Content-Type: application/json" \
  -d '{
    "cv_content": "Your CV text here..."
  }'
```

### Using Node.js
```javascript
const response = await fetch('http://localhost:3000/api/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cv_content: 'Your CV text here...'
  })
});
const data = await response.json();
console.log(data);
```

## Architecture

```
api/
├── index.ts              ← Express app
├── types.ts              ← TypeScript types
├── lib/
│   ├── gemini.ts         ← Gemini API integration
│   └── fpt-scraper.ts    ← FPT job scraper
└── routes/
    └── apply.ts          ← /api/apply endpoint
```

## Features

- 📄 **CV Parsing** - Extracts role, skills, experience from CV text
- 🎯 **Job Matching** - Analyzes fit between candidate and FPT positions (0-1 score)
- 📝 **Cover Letter Generation** - Creates tailored cover letters in Vietnamese
- 💡 **Interview Tips** - Generates personalized interview preparation tips
- 🔍 **Skill Gap Analysis** - Identifies matching and missing skills
- 🏢 **FPT Jobs Database** - Scrapes and maintains current FPT job listings

## Environment Variables

```
GEMINI_API_KEY    - Google Generative AI API key
PORT              - Server port (default: 3000)
NODE_ENV          - Environment (development/production)
```

## Error Handling

All errors return HTTP 500 with error details:
```json
{
  "error": "Failed to process application",
  "message": "Details of what went wrong"
}
```

## Notes

- Currently uses mock FPT jobs for demo. Update `fpt-scraper.ts` with actual scraping logic
- Gemini API calls are rate-limited. Processing multiple jobs may take 1-2 minutes
- All output (cover letters, tips) is generated in Vietnamese

## Future Enhancements

- [ ] Real FPT career portal scraping
- [ ] Caching of job listings
- [ ] User authentication and saved applications
- [ ] Email integration for sending applications
- [ ] Support for multiple job sites (Vietnamworks, TopDev, LinkedIn)
