
import React from 'react';
import { FilterType } from './BlogContent';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
      <button
        onClick={() => onFilterChange('recent')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          activeFilter === 'recent'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Recentes
      </button>
      <button
        onClick={() => onFilterChange('top')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          activeFilter === 'top'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Populares
      </button>
    </div>
  );
};

export default FilterTabs;
