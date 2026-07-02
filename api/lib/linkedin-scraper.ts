import logger from "./logger.js";

export const SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";
export const DETAIL_URL = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface LinkedInJobCard {
  id: string;
  title: string;
  company: string | null;
  companyUrl: string | null;
  location: string | null;
  date: string | null;
  url: string;
}

export interface LinkedInJobDetail extends LinkedInJobCard {
  description: string | null;
  seniority: string | null;
  employmentType: string | null;
  jobFunction: string | null;
  industries: string | null;
  applyUrl: string | null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html));
}

export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 4;
  let delay = 500;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "X-Requested-With": "XMLHttpRequest",
        },
        redirect: "follow",
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt === maxRetries) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        const jitter = Math.floor(Math.random() * 500);
        logger.warn(`LinkedIn rate limited (status ${response.status}). Retrying in ${delay + jitter}ms...`);
        await new Promise((r) => setTimeout(r, delay + jitter));
        delay = Math.min(delay * 2, 6000);
        continue;
      }

      if (response.status === 404) return "";
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 6000);
    }
  }
  throw new Error("Request failed after max retries");
}

export function parseJobCards(html: string): LinkedInJobCard[] {
  const results: LinkedInJobCard[] = [];
  const chunks = html.split(/data-entity-urn="urn:li:jobPosting:/).slice(1);

  for (const chunk of chunks) {
    const idMatch = chunk.match(/^(\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const linkMatch = chunk.match(/class="base-card__full-link[^"]*"[^>]*href="([^"]+)"/i);
    const url = linkMatch ? decodeHtmlEntities(linkMatch[1]).split("?")[0] : "";

    let title: string | null = null;
    const h3 = chunk.match(/class="base-search-card__title"[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3) title = clean(h3[1]);
    if (!title) {
      const sr = chunk.match(/class="sr-only"[^>]*>([\s\S]*?)<\/span>/i);
      if (sr) title = clean(sr[1]);
    }
    if (!title) continue;

    let company: string | null = null;
    let companyUrl: string | null = null;
    const sub = chunk.match(/class="base-search-card__subtitle"[^>]*>([\s\S]*?)<\/h4>/i);
    if (sub) {
      const a = sub[1].match(/href="([^"]+)"/i);
      if (a) companyUrl = decodeHtmlEntities(a[1]).split("?")[0];
      company = clean(sub[1]) || null;
    }

    const loc = chunk.match(/class="job-search-card__location"[^>]*>([\s\S]*?)<\/span>/i);
    const location = loc ? clean(loc[1]) || null : null;
    const dt = chunk.match(/class="job-search-card__listdate[^"]*"[^>]*datetime="([^"]+)"/i);
    const date = dt ? dt[1] : null;

    results.push({
      id,
      title,
      company,
      companyUrl,
      location,
      date,
      url: url || `https://www.linkedin.com/jobs/view/${id}`,
    });
  }

  return results;
}

export function parseJobDetail(html: string, id: string): LinkedInJobDetail {
  const title = html.match(
    /class="(?:top-card-layout__title|topcard__title)[^"]*"[^>]*>([\s\S]*?)<\/h[12]>/i
  )?.[1];

  const orgMatch = html.match(
    /class="topcard__org-name-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
  );
  const company = orgMatch ? clean(orgMatch[2]) || null : null;
  const companyUrl = orgMatch ? decodeHtmlEntities(orgMatch[1]).split("?")[0] : null;

  const locMatch = html.match(
    /class="topcard__flavor topcard__flavor--bullet"[^>]*>([\s\S]*?)<\/span>/i
  );
  const location = locMatch ? clean(locMatch[1]) || null : null;

  let description: string | null = null;
  const desc = html.match(
    /class="(?:show-more-less-html__markup|description__text[^"]*)"[^>]*>([\s\S]*?)<\/div>/i
  );
  if (desc) {
    const withBreaks = desc[1]
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n");
    description = decodeHtmlEntities(stripTags(withBreaks)).replace(/\n{3,}/g, "\n\n").trim() || null;
  }

  const criteria: Record<string, string> = {};
  const itemRe =
    /class="description__job-criteria-subheader"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?class="description__job-criteria-text[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  let cm: RegExpExecArray | null;
  while ((cm = itemRe.exec(html)) !== null) {
    criteria[clean(cm[1]).toLowerCase()] = clean(cm[2]);
  }

  const applyMatch = html.match(/class="topcard__link[^"]*"[^>]*href="([^"]+)"/i);
  const applyUrl = applyMatch ? decodeHtmlEntities(applyMatch[1]).split("?")[0] : null;

  return {
    id,
    title: title ? clean(title) : "(untitled)",
    company,
    companyUrl,
    location,
    date: null,
    url: `https://www.linkedin.com/jobs/view/${id}`,
    description,
    seniority: criteria["seniority level"] ?? null,
    employmentType: criteria["employment type"] ?? null,
    jobFunction: criteria["job function"] ?? null,
    industries: criteria["industries"] ?? null,
    applyUrl,
  };
}

export async function fetchLinkedInJobs(query: string, location: string, limit: number = 3): Promise<LinkedInJobDetail[]> {
  logger.info(`Searching LinkedIn for jobs matching "${query}" in "${location}"`);
  
  const params = new URLSearchParams();
  if (query) params.set("keywords", query);
  if (location) params.set("location", location);
  
  const searchUrl = `${SEARCH_URL}?${params.toString()}`;
  
  try {
    const searchHtml = await htmlFetch(searchUrl);
    const cards = parseJobCards(searchHtml).slice(0, limit);
    logger.info(`Found ${cards.length} matching jobs on LinkedIn. Fetching details...`);
    
    const details: LinkedInJobDetail[] = [];
    for (const card of cards) {
      try {
        const detailUrl = `${DETAIL_URL}/${card.id}`;
        const detailHtml = await htmlFetch(detailUrl);
        if (detailHtml) {
          const detail = parseJobDetail(detailHtml, card.id);
          // Merge card metadata if missing from detail page
          details.push({
            ...card,
            ...detail,
            title: detail.title !== "(untitled)" ? detail.title : card.title,
            company: detail.company || card.company,
            location: detail.location || card.location,
          });
        }
      } catch (err) {
        logger.error(`Failed to fetch details for LinkedIn job ${card.id}:`, err);
      }
    }
    
    return details;
  } catch (err) {
    logger.error("LinkedIn job search failed:", err);
    return [];
  }
}
