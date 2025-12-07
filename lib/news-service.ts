import * as cheerio from "cheerio";
import { appendFileSync } from "node:fs";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
  imageUrl?: string;
  description?: string;
}

interface ScraperConfig {
  name: string;
  url: string;
  category: string;
  articleSelector: string;
  titleSelector: string;
  linkSelector: string;
  imageSelector: string;
}

const SOURCES: ScraperConfig[] = [
  // General / Actualidad
  {
    name: "Clarín",
    url: "https://www.clarin.com/",
    category: "General",
    articleSelector: 'article, div[class*="content-"]',
    titleSelector: "h2, h3",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "La Nación",
    url: "https://www.lanacion.com.ar/",
    category: "General",
    articleSelector: "article", // Confirmed 'article' tag is used
    titleSelector: "h2",
    linkSelector: "a", // Find any link inside
    imageSelector: "img",
  },
  {
    name: "Infobae",
    url: "https://www.infobae.com/",
    category: "Actualidad",
    articleSelector: 'a[class*="story-card"]', // Broader match for story card link
    titleSelector: "h2, h3",
    linkSelector: "self",
    imageSelector: "img",
  },
  // Política
  {
    name: "Clarín",
    url: "https://www.clarin.com/politica/",
    category: "Política",
    articleSelector: 'article, div[class*="content-"]',
    titleSelector: "h2, h3",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "La Nación",
    url: "https://www.lanacion.com.ar/politica/",
    category: "Política",
    articleSelector: "article",
    titleSelector: "h2",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "Infobae",
    url: "https://www.infobae.com/politica/",
    category: "Política",
    articleSelector: 'a[class*="story-card"]',
    titleSelector: "h2, h3",
    linkSelector: "self",
    imageSelector: "img",
  },
  // Economía
  {
    name: "Clarín",
    url: "https://www.clarin.com/economia/",
    category: "Economía",
    articleSelector: 'article, div[class*="content-"]',
    titleSelector: "h2, h3",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "La Nación",
    url: "https://www.lanacion.com.ar/economia/",
    category: "Economía",
    articleSelector: "article",
    titleSelector: "h2",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "Infobae",
    url: "https://www.infobae.com/economia/",
    category: "Economía",
    articleSelector: 'a[class*="story-card"]',
    titleSelector: "h2, h3",
    linkSelector: "self",
    imageSelector: "img",
  },
  // Deportes
  {
    name: "Clarín",
    url: "https://www.clarin.com/deportes/",
    category: "Deportes",
    articleSelector: 'article, div[class*="content-"]',
    titleSelector: "h2, h3",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "La Nación",
    url: "https://www.lanacion.com.ar/deportes/",
    category: "Deportes",
    articleSelector: "article",
    titleSelector: "h2",
    linkSelector: "a",
    imageSelector: "img",
  },
  {
    name: "Infobae",
    url: "https://www.infobae.com/deportes/",
    category: "Deportes",
    articleSelector: 'a[class*="story-card"]',
    titleSelector: "h2, h3",
    linkSelector: "self",
    imageSelector: "img",
  },
];

const shouldLogToFile = process.env.NODE_ENV !== "production";

function logToFile(fileName: string, message: string) {
  if (!shouldLogToFile) return;
  try {
    appendFileSync(fileName, message);
  } catch (writeError) {
    console.warn(`No se pudo escribir en ${fileName}:`, writeError);
  }
}

async function scrapeNews(config: ScraperConfig): Promise<NewsItem[]> {
  console.log(`Starting scrape for ${config.name} (${config.category})...`);
  logToFile(
    "scrape-debug.log",
    `Starting scrape for ${config.name} (${config.url})\n`
  );
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(config.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const html = await response.text();
    logToFile(
      "scrape-debug.log",
      `Fetched ${config.name}: ${html.length} bytes\n`
    );
    console.log(`Fetched ${config.name}: ${html.length} bytes`);

    const $ = cheerio.load(html);
    const items: NewsItem[] = [];

    const elements = $(config.articleSelector);
    logToFile(
      "scrape-debug.log",
      `Found ${elements.length} elements for selector "${config.articleSelector}" in ${config.name}\n`
    );
    console.log(
      `Found ${elements.length} elements for selector "${config.articleSelector}" in ${config.name}`
    );

    elements.each((_, element) => {
      if (items.length >= 10) return false; // Limit to 10 items

      const $element = $(element);

      // Title
      const title = $element.find(config.titleSelector).first().text().trim();
      if (!title) return;

      // Link
      let link = "";
      if (config.linkSelector === "self") {
        link = $element.attr("href") || "";
      } else {
        link = $element.find(config.linkSelector).first().attr("href") || "";
      }

      // Normalize link
      if (link && !link.startsWith("http")) {
        const baseUrl = new URL(config.url).origin;
        link = baseUrl + (link.startsWith("/") ? link : "/" + link);
      }

      // Image
      let imageUrl = $element.find(config.imageSelector).first().attr("src");
      // Handle lazy loading attributes if present (common in news sites)
      if (!imageUrl) {
        imageUrl =
          $element.find(config.imageSelector).first().attr("data-src") ||
          $element.find(config.imageSelector).first().attr("data-original");
      }

      if (title && link) {
        items.push({
          title,
          link,
          pubDate: new Date().toISOString(), // Scraping doesn't always give date, default to now
          source: config.name,
          category: config.category,
          imageUrl: imageUrl || undefined,
          description: "", // Scraping description is hard/inconsistent from card
        });
      }
    });

    return items;
  } catch (error) {
    logToFile(
      "scrape-error.log",
      `Error scraping ${config.name} (${config.url}): ${error}\n`
    );
    console.error(`Error scraping ${config.name} (${config.url}):`, error);
    return [];
  }
}

export async function getNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  // Process in parallel but with some concurrency limit if needed (Promise.all is fine for this scale)
  const promises = SOURCES.map((source) => scrapeNews(source));
  const results = await Promise.all(promises);

  results.forEach((items) => allNews.push(...items));

  // Sort by date (which is just "now" for scraped items, so effectively random/source order unless we find dates)
  // For now, we'll just return them mixed.
  return allNews;
}
