import React from 'react';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { MinusIcon } from '../icons/MinusIcon';

interface PriceIndicatorProps {
    material: string;
    price: string;
    change: number; // positive for up, negative for down, 0 for stable
}

const PriceIndicator: React.FC<PriceIndicatorProps> = ({ material, price, change }) => {
    const trendIcon = change > 0 ? <ArrowUpIcon className="w-5 h-5 text-red-500" /> :
                      change < 0 ? <ArrowDownIcon className="w-5 h-5 text-green-500" /> :
                      <MinusIcon className="w-5 h-5 text-gray-500" />;

    const changeColor = change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-500';

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{material}</p>
                <p className="text-2xl font-bold text-brand-text mt-1">{price}</p>
            </div>
            <div className="flex items-center mt-3">
                {trendIcon}
                <span className={`ml-1 text-sm font-semibold ${changeColor}`}>{Math.abs(change)}%</span>
                <span className="ml-1 text-xs text-gray-400">/ 24h</span>
            </div>
        </div>
    );
};

export default PriceIndicator;