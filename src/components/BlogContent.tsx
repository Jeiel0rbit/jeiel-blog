
import React, { useState } from 'react';
import PostsList from './PostsList';
import FilterTabs from './FilterTabs';
import NewsletterAlert from './NewsletterAlert';

export type FilterType = 'recent' | 'top';

const BlogContent = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-8 xl:col-span-9">
        <NewsletterAlert />
        
        <div className="mb-4">
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
        
        <PostsList filter={activeFilter} />
      </div>
      
      {/* Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="sticky top-4 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Sobre o blog
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Desenvolvido com API do TabNews. Todos os posts são atualizados automaticamente com base na publicação no TabNews. Desde de setembro de 2024 escrevendo conteúdos de tecnologia.
           </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogContent;
