'use client';

import React, { useState } from "react";
import { NewsItem } from "@/lib/news-service";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Sparkles } from "lucide-react";
import { NewsModal } from "./NewsModal";

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700">
        {news.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              {news.source}
            </div>
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          {!news.imageUrl && (
            <div className="mb-2 inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-bold px-2 py-1 rounded-full w-fit">
              {news.source}
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3 leading-tight">
            <button
              onClick={() => setShowModal(true)}
              className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {news.title}
            </button>
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
            {(news.description || "").replace(/<[^>]*>?/gm, "")}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {formatDistanceToNow(new Date(news.pubDate), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              <Sparkles size={14} /> Ver resumen IA
            </button>
          </div>
        </div>
      </div>

      {showModal && <NewsModal news={news} onClose={() => setShowModal(false)} />}
    </>
  );
}
