import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Groq({ apiKey });
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Eliminar scripts, estilos y navegación
    $('script, style, nav, header, footer, aside, .comments, .related, .advertisement').remove();

    // Intentar obtener el contenido del artículo
    const selectors = [
      'article',
      '[class*="article-body"]',
      '[class*="story-body"]',
      '[class*="content-body"]',
      '[class*="nota-body"]',
      '.cuerpo-nota',
      '.article-content',
      'main p',
    ];

    let content = '';
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > 200) {
        content = text;
        break;
      }
    }

    // Si no encontramos contenido específico, tomar todos los párrafos
    if (!content) {
      content = $('p').text().trim();
    }

    // Limitar a ~3000 caracteres para no exceder tokens
    return content.slice(0, 3000);
  } catch (error) {
    console.error('Error fetching article:', error);
    throw new Error('No se pudo obtener el contenido del artículo');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, title } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json(
        { error: 'API key de Groq no configurada. Configura GROQ_API_KEY en las variables de entorno.' },
        { status: 500 }
      );
    }

    // Obtener contenido del artículo
    const articleContent = await fetchArticleContent(url);

    if (articleContent.length < 100) {
      return NextResponse.json(
        { error: 'No se pudo extraer suficiente contenido del artículo' },
        { status: 400 }
      );
    }

    // Generar resumen con Groq (Llama 3)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `Eres un periodista experto que resume noticias de forma clara y concisa en español. 
Genera un resumen estructurado con:
- **Resumen:** (2-3 oraciones con lo más importante)
- **Puntos clave:** (3-5 puntos en lista)
- **Contexto:** (1-2 oraciones de contexto adicional si es relevante)

Mantén un tono neutral y objetivo.`,
        },
        {
          role: 'user',
          content: `Resume esta noticia titulada "${title}":\n\n${articleContent}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content || 'No se pudo generar el resumen';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Error al generar el resumen' },
      { status: 500 }
    );
  }
}
