import * as cheerio from 'cheerio';

async function inspect(url: string, name: string) {
  console.log(`Inspecting ${name} (${url})...`);
  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to find a common news container with a title
    const candidates = $('article:has(h2), .story-card:has(h2), a:has(h2)');
    console.log(`Found ${candidates.length} candidates with h2.`);

    if (candidates.length > 0) {
        // Print first 3
        candidates.slice(0, 3).each((i, el) => {
             console.log(`--- Candidate ${i} HTML ---`);
             console.log($.html(el).substring(0, 500)); // Limit length
             console.log("----------------------------");
        });
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
    await inspect('https://www.lanacion.com.ar/', 'La Nación');
    await inspect('https://www.infobae.com/', 'Infobae');
}

main();
