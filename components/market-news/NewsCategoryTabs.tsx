import React from 'react';
import { NewsCategory } from '../../types';

interface NewsCategoryTabsProps {
    categories: (NewsCategory | 'All')[];
    activeCategory: NewsCategory | 'All';
    setActiveCategory: (category: NewsCategory | 'All') => void;
}

const NewsCategoryTabs: React.FC<NewsCategoryTabsProps> = ({ categories, activeCategory, setActiveCategory }) => {
    return (
        <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 overflow-x-auto">
            <div className="flex space-x-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
                            activeCategory === category 
                                ? 'bg-brand-red text-white shadow' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NewsCategoryTabs;