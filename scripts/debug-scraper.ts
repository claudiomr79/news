import * as cheerio from "cheerio";

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
  {
    name: "La Nación",
    url: "https://www.lanacion.com.ar/",
    category: "General",
    articleSelector: "article.com-article",
    titleSelector: "h2.com-title a",
    linkSelector: "h2.com-title a",
    imageSelector: "figure.com-image img",
  },
  {
    name: "Infobae",
    url: "https://www.infobae.com/",
    category: "Actualidad",
    articleSelector: "a.d23-story-card-ctn",
    titleSelector: "h2.d23-story-card-hl, h3",
    linkSelector: "self",
    imageSelector: "figure img",
  },
];

async function scrapeNews(config: ScraperConfig) {
  console.log(`Starting scrape for ${config.name} (${config.category})...`);
  try {
    const response = await fetch(config.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = await response.text();
    console.log(`Fetched ${config.name}: ${html.length} bytes`);
    console.log(`HTML Preview: ${html.substring(0, 500)}...`);

    const $ = cheerio.load(html);

    const selectors = [
      config.articleSelector,
      "article",
      "h2 a",
      ".story-card",
      "a",
    ];

    for (const sel of selectors) {
      const count = $(sel).length;
      console.log(`Selector "${sel}": found ${count} elements`);
    }

    console.log("--- H2 Parent Inspection ---");
    $("h2").each((i, el) => {
      if (i >= 5) return false;
      const parent = $(el).parent();
      const link = parent.is("a") ? parent : parent.find("a").first();
      console.log(
        `H2 [${i}]: parent=${parent.prop(
          "tagName"
        )} parent_class="${parent.attr("class")}" link_href="${link.attr(
          "href"
        )}"`
      );
    });
  } catch (error) {
    console.error(`Error scraping ${config.name}:`, error);
  }
}

async function main() {
  for (const source of SOURCES) {
    await scrapeNews(source);
    console.log("--------------------------------------------------");
  }
}

main();
