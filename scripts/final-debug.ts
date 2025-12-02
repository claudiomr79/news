import * as cheerio from 'cheerio';

interface NewsItem {
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
    name: 'Clarín', 
    url: 'https://www.clarin.com/', 
    category: 'General',
    articleSelector: 'article, div[class*="content-"]', 
    titleSelector: 'h2, h3',
    linkSelector: 'a',
    imageSelector: 'img'
  },
  { 
    name: 'La Nación', 
    url: 'https://www.lanacion.com.ar/', 
    category: 'General',
    articleSelector: 'article', // Confirmed 'article' tag is used
    titleSelector: 'h2',
    linkSelector: 'a', // Find any link inside
    imageSelector: 'img'
  },
  { 
    name: 'Infobae', 
    url: 'https://www.infobae.com/', 
    category: 'Actualidad',
    articleSelector: 'a[class*="story-card"]', // Broader match for story card link
    titleSelector: 'h2, h3',
    linkSelector: 'self',
    imageSelector: 'img'
  },
];

async function scrapeNews(config: ScraperConfig): Promise<NewsItem[]> {
  console.log(`Starting scrape for ${config.name} (${config.category})...`);
  try {
    const response = await fetch(config.url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = await response.text();
    console.log(`Fetched ${config.name}: ${html.length} bytes`);
    
    const $ = cheerio.load(html);
    const items: NewsItem[] = [];
    
    const elements = $(config.articleSelector);
    console.log(`Found ${elements.length} elements for selector "${config.articleSelector}" in ${config.name}`);

    elements.each((i, element) => {
      if (items.length >= 10) return false; // Limit to 10 items

      const $element = $(element);
      
      // Title
      const title = $element.find(config.titleSelector).first().text().trim();
      console.log(`[${i}] Title: ${title}`); // Debug title

      if (!title) {
          // console.log(`[${i}] No title found`);
          return;
      }

      // Link
      let link = '';
      if (config.linkSelector === 'self') {
        link = $element.attr('href') || '';
      } else {
        link = $element.find(config.linkSelector).first().attr('href') || '';
      }
      
      // console.log(`[${i}] Link: ${link}`); // Debug link

      // Normalize link
      if (link && !link.startsWith('http')) {
        const baseUrl = new URL(config.url).origin;
        link = baseUrl + (link.startsWith('/') ? link : '/' + link);
      }

      // Image
      let imageUrl = $element.find(config.imageSelector).first().attr('src');
      // Handle lazy loading attributes if present (common in news sites)
      if (!imageUrl) {
          imageUrl = $element.find(config.imageSelector).first().attr('data-src') || 
                     $element.find(config.imageSelector).first().attr('data-original');
      }

      if (title && link) {
        items.push({
          title,
          link,
          pubDate: new Date().toISOString(), // Scraping doesn't always give date, default to now
          source: config.name,
          category: config.category,
          imageUrl: imageUrl || undefined,
          description: '' // Scraping description is hard/inconsistent from card
        });
      }
    });

    console.log(`Extracted ${items.length} items from ${config.name}`);
    return items;
  } catch (error) {
    console.error(`Error scraping ${config.name} (${config.url}):`, error);
    return [];
  }
}

async function main() {
    for (const source of SOURCES) {
        await scrapeNews(source);
        console.log('-----------------------------------');
    }
}

main();
