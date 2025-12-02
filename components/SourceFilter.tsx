import React from 'react';

interface SourceFilterProps {
  sources: string[];
  selectedSource: string;
  onSelectSource: (source: string) => void;
}

export function SourceFilter({ sources, selectedSource, onSelectSource }: SourceFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Fuentes</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onSelectSource('Todas')}
          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedSource === 'Todas'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          Todas las fuentes
        </button>
        {sources.map((source) => (
          <button
            key={source}
            onClick={() => onSelectSource(source)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedSource === source
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {source}
          </button>
        ))}
      </div>
    </div>
  );
}
