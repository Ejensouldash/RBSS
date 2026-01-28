import React from 'react';
import { NewsArticle } from '../../types';
import AIImpactBadge from './AIImpactBadge';
import { FuelIcon } from '../icons/FuelIcon';
import { ConstructionIcon } from '../icons/ConstructionIcon';
import { EconomyIcon } from '../icons/EconomyIcon';
import { GovernmentIcon } from '../icons/GovernmentIcon';
import { GlobeIcon } from '../icons/GlobeIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface NewsCardProps {
    article: NewsArticle;
}

const categoryConfig = {
    'Fuel & Energy': { icon: <FuelIcon className="w-5 h-5 text-orange-500" />, color: 'text-orange-600' },
    'Construction & Materials': { icon: <ConstructionIcon className="w-5 h-5 text-yellow-600" />, color: 'text-yellow-700' },
    'Economy & Finance': { icon: <EconomyIcon className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' },
    'Government Projects': { icon: <GovernmentIcon className="w-5 h-5 text-indigo-500" />, color: 'text-indigo-600' },
    'Global Market Trends': { icon: <GlobeIcon className="w-5 h-5 text-teal-500" />, color: 'text-teal-600' },
};

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
    const config = categoryConfig[article.category] || categoryConfig['Global Market Trends'];
    const formattedDate = new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className={`flex items-center space-x-2 text-xs font-bold uppercase ${config.color}`}>
                        {config.icon}
                        <span>{article.category}</span>
                    </div>
                    <AIImpactBadge score={article.impactScore} value={article.predictedImpactValue} />
                </div>
                <h3 className="text-lg font-bold text-brand-text mt-3">{article.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                    {article.source} &bull; {formattedDate}
                </p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{article.summary}</p>
            </div>
            <div className="mt-auto p-4 bg-yellow-50 border-t border-yellow-200 rounded-b-lg">
                <div className="flex items-center space-x-2">
                     <SparklesIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                     <p className="text-xs text-yellow-800 font-semibold">
                         <span className="font-bold">AI Analysis:</span> {article.aiAnalysis}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;