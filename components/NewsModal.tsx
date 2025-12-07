'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '@/lib/news-service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Calendar, Sparkles, X, Loader2 } from 'lucide-react';

interface NewsModalProps {
  news: NewsItem;
  onClose: () => void;
}

export function NewsModal({ news, onClose }: NewsModalProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generar resumen al abrir el modal
  useEffect(() => {
    const generateSummary = async () => {
      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: news.link, title: news.title }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al generar resumen');
        }

        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [news.link, news.title]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          {news.imageUrl && (
            <div className="h-48 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className={`${news.imageUrl ? 'absolute bottom-0 left-0 right-0 p-4' : 'p-4 border-b dark:border-gray-700'}`}>
            <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
              {news.source}
            </span>
            <h2 className={`text-xl font-bold ${news.imageUrl ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {news.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* AI Summary Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
              <span className="font-semibold text-purple-800 dark:text-purple-300">
                Resumen generado por IA
              </span>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-purple-600" size={32} />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Generando resumen...</span>
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 py-4">
                <p>⚠️ {error}</p>
                <p className="text-sm mt-2 text-gray-500">Puedes leer el artículo completo en el enlace de abajo.</p>
              </div>
            )}

            {summary && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {summary}
                </div>
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {formatDistanceToNow(new Date(news.pubDate), { addSuffix: true, locale: es })}
              </span>
            </div>
            {news.category && (
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {news.category}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Leer artículo completo <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
