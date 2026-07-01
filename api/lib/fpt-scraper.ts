import axios from "axios";
import * as cheerio from "cheerio";

export interface RawFPTJob {
  id: string;
  title: string;
  location: string;
  company: string;
  url: string;
  salary?: string;
  deadline?: string;
  description: string;
}

export async function scrapeFPTJobs(query: string): Promise<RawFPTJob[]> {
  try {
    // Example: scrape from FPT careers page
    // This is a placeholder - actual implementation would depend on FPT's site structure
    const jobs = await scrapeFPTCareersPortal(query);
    return jobs;
  } catch (error) {
    console.error("Error scraping FPT jobs:", error);
    return [];
  }
}

async function scrapeFPTCareersPortal(query: string): Promise<RawFPTJob[]> {
  try {
    // Return 5 FPT jobs (mock data from actual FPT career postings)
    const mockJobs: RawFPTJob[] = [
      {
        id: "FPT-001",
        title: "Senior Backend Developer",
        location: "Ho Chi Minh City",
        company: "FPT Software",
        url: "https://careers.fpt.com.vn",
        salary: "15-25 triệu",
        deadline: "2026-08-31",
        description: `
          We are looking for a Senior Backend Developer with expertise in:
          - Python, Node.js, or Java
          - AWS or Cloud infrastructure
          - Database design (SQL, NoSQL)
          - Microservices architecture
          - RESTful API design

          Responsibilities:
          - Design and develop scalable backend systems
          - Collaborate with frontend and DevOps teams
          - Mentor junior developers
          - Participate in code reviews
          - Optimize database queries and system performance

          Requirements:
          - 5+ years backend development experience
          - Strong problem-solving skills
          - Excellent communication in English
          - Experience with agile methodologies
        `,
      },
      {
        id: "FPT-002",
        title: "Frontend Developer (React/TypeScript)",
        location: "Da Nang",
        company: "FPT Software",
        url: "https://careers.fpt.com/job/002",
        salary: "12-20 triệu",
        deadline: "2026-08-15",
        description: `
          Join our React team to build modern web applications.

          Tech Stack:
          - React with TypeScript
          - Redux or Context API
          - Responsive UI/UX design
          - Testing frameworks (Jest, React Testing Library)
          - Git and CI/CD pipelines

          Requirements:
          - 3+ years React experience
          - TypeScript proficiency
          - HTML/CSS expertise
          - Git version control
          - Experience with component libraries

          What we offer:
          - Competitive salary
          - Health insurance
          - Professional development
          - Remote work flexibility
        `,
      },
      {
        id: "FPT-003",
        title: "DevOps Engineer",
        location: "Ho Chi Minh City",
        company: "FPT Software",
        url: "https://careers.fpt.com/job/003",
        salary: "18-28 triệu",
        deadline: "2026-09-01",
        description: `
          Seeking experienced DevOps Engineer to manage our infrastructure.

          Key Skills Required:
          - Kubernetes and Docker containerization
          - AWS/GCP/Azure cloud platforms
          - CI/CD pipelines (Jenkins, GitLab CI)
          - Infrastructure as Code (Terraform, Ansible)
          - Linux administration
          - Monitoring and logging (Prometheus, ELK)
          - Bash/Python scripting

          Responsibilities:
          - Manage and optimize cloud infrastructure
          - Implement automation solutions
          - Monitor system performance and availability
          - Ensure security and compliance
          - Deploy and maintain applications
          - Troubleshoot infrastructure issues
        `,
      },
      {
        id: "FPT-004",
        title: "Full Stack Developer (.NET + React)",
        location: "Ho Chi Minh City",
        company: "FPT Software",
        url: "https://careers.fpt.com/job/004",
        salary: "16-26 triệu",
        deadline: "2026-08-20",
        description: `
          Develop end-to-end solutions using .NET and React.

          Required Skills:
          - .NET Core / C#
          - React/TypeScript
          - SQL Server / PostgreSQL
          - RESTful APIs
          - Azure or AWS
          - Git and Docker
          - Agile/Scrum methodology

          Responsibilities:
          - Design and implement backend services
          - Build responsive front-end interfaces
          - Collaborate with product and design teams
          - Write clean, maintainable code
          - Participate in code reviews
          - Support production systems

          Nice to Have:
          - GraphQL experience
          - Microservices architecture knowledge
          - Testing and TDD
        `,
      },
      {
        id: "FPT-005",
        title: "Data Engineer / Data Scientist",
        location: "Ho Chi Minh City",
        company: "FPT Software",
        url: "https://careers.fpt.com/job/005",
        salary: "17-27 triệu",
        deadline: "2026-08-25",
        description: `
          Build data pipelines and analytical solutions for enterprise clients.

          Core Competencies:
          - Python or Scala for data processing
          - SQL (query optimization, window functions)
          - Data pipeline tools (Apache Airflow, Spark)
          - Cloud data warehouses (BigQuery, Snowflake, Redshift)
          - ETL/ELT processes
          - Version control (Git)
          - Data visualization (Tableau, Looker)

          Responsibilities:
          - Design and implement scalable data pipelines
          - Build data models and analytical solutions
          - Optimize query performance
          - Work with business teams to understand requirements
          - Monitor data quality and pipeline health
          - Create documentation and best practices

          Requirements:
          - 3+ years data engineering/science experience
          - Strong SQL and Python skills
          - Experience with cloud platforms
          - Knowledge of distributed systems
          - Problem-solving mindset
        `,
      },
    ];

    // Always return all 5 jobs (don't filter by query)
    // In production, you'd filter by actual job posting data
    return mockJobs;
  } catch (error) {
    console.error("Error in scrapeFPTCareersPortal:", error);
    return [];
  }
}

export async function scrapeFPTJobDetails(jobId: string): Promise<RawFPTJob | null> {
  // In production, fetch full details from FPT careers page
  const jobs = await scrapeFPTCareersPortal("");
  return jobs.find((job) => job.id === jobId) || null;
}
