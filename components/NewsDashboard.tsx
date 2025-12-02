'use client';

import React, { useState, useMemo } from 'react';
import { NewsItem } from '@/lib/news-service';
import { NewsCard } from './NewsCard';
import { CategoryFilter } from './CategoryFilter';
import { SourceFilter } from './SourceFilter';
import { Search } from 'lucide-react';

interface NewsDashboardProps {
  initialNews: NewsItem[];
}

export function NewsDashboard({ initialNews }: NewsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSource, setSelectedSource] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories and sources
  const categories = useMemo(() => {
    const cats = new Set(initialNews.map(n => n.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [initialNews]);

  const sources = useMemo(() => {
    const srcs = new Set(initialNews.map(n => n.source));
    return Array.from(srcs);
  }, [initialNews]);

  // Filter news
  const filteredNews = useMemo(() => {
    return initialNews.filter(news => {
      const matchesCategory = selectedCategory === 'Todas' || news.category === selectedCategory;
      const matchesSource = selectedSource === 'Todas' || news.source === selectedSource;
      const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            news.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [initialNews, selectedCategory, selectedSource, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">NewsArg<span className="text-blue-600">.</span></h1>
          </div>
          
          <div className="relative hidden md:block w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar noticias..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <SourceFilter 
              sources={sources} 
              selectedSource={selectedSource} 
              onSelectSource={setSelectedSource} 
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Últimas Noticias</h2>
              <CategoryFilter 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />
              
              {/* Mobile Search & Source Filter */}
              <div className="lg:hidden space-y-4 mb-6">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar noticias..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    <option value="Todas">Todas las fuentes</option>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </div>
            </div>

            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredNews.map((news, index) => (
                  <NewsCard key={`${news.source}-${index}`} news={news} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No se encontraron noticias con los filtros seleccionados.</p>
                <button 
                  onClick={() => {setSelectedCategory('Todas'); setSelectedSource('Todas'); setSearchQuery('');}}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
