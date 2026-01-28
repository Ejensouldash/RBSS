import React from 'react';

interface AIRecommendationCardProps {
    icon: string;
    text: string;
}

const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ icon, text }) => {
    return (
        <div className="bg-gradient-to-tr from-yellow-50 to-amber-100 p-4 rounded-xl shadow-md border border-amber-200 h-full">
            <div className="flex items-start space-x-3">
                <span className="text-2xl">{icon}</span>
                <p className="text-sm text-yellow-900 font-medium">{text}</p>
            </div>
        </div>
    );
};

export default AIRecommendationCard;
