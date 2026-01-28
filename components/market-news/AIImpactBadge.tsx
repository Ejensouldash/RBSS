import React from 'react';
import { NewsImpactScore } from '../../types';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { MinusIcon } from '../icons/MinusIcon';

interface AIImpactBadgeProps {
    score: NewsImpactScore;
    value: string;
}

const badgeConfig = {
    Positive: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: <ArrowUpIcon className="w-4 h-4" />,
    },
    Negative: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: <ArrowDownIcon className="w-4 h-4" />,
    },
    Neutral: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: <MinusIcon className="w-4 h-4" />,
    },
};

const AIImpactBadge: React.FC<AIImpactBadgeProps> = ({ score, value }) => {
    const config = badgeConfig[score] || badgeConfig.Neutral;

    return (
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.textColor}`}>
            {config.icon}
            <span>{value}</span>
        </div>
    );
};

export default AIImpactBadge;