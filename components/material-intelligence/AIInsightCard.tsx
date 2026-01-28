import React from 'react';
import { LightBulbIcon } from '../icons/LightBulbIcon';

interface AIInsightCardProps {
    insight: string;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
    // Function to make parts of the text bold based on keywords
    const formatInsight = (text: string) => {
        const keywords = ['naik', 'turun', 'stabil', 'meningkat', 'berkurang', 'Cadangan:'];
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (keywords.some(kw => part.toLowerCase() === kw.toLowerCase())) {
                return <span key={index} className="font-bold text-brand-red">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="bg-yellow-50 border-l-4 border-brand-gold p-6 rounded-r-lg shadow-md">
            <div className="flex items-center space-x-3 mb-3">
                <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-lg font-semibold text-brand-text">AI Insight</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
                {formatInsight(insight)}
            </p>
        </div>
    );
};

export default AIInsightCard;
