import React, { useState, useMemo } from 'react';
import { TenderIntelligenceResult } from '../../types';

interface MarginAdjusterProps {
    analysisResult: TenderIntelligenceResult;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM ');

const MarginAdjuster: React.FC<MarginAdjusterProps> = ({ analysisResult }) => {
    // The base total cost is the sum of market prices, representing the actual cost to the business.
    const baseTotalCost = useMemo(() => 
        analysisResult.items.reduce((sum, item) => sum + item.marketPrice, 0),
        [analysisResult.items]
    );

    const [marginPercent, setMarginPercent] = useState(analysisResult.summary.potentialMarginPercent);

    const { suggestedBidPrice, estimatedProfit } = useMemo(() => {
        const profit = baseTotalCost * (marginPercent / 100);
        const bidPrice = baseTotalCost + profit;
        return { suggestedBidPrice: bidPrice, estimatedProfit: profit };
    }, [baseTotalCost, marginPercent]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-text mb-4">Margin & Price Adjuster</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="margin-slider" className="block text-sm font-medium text-gray-700">
                        Set Your Desired Profit Margin: <span className="font-bold text-brand-red text-lg">{marginPercent.toFixed(1)}%</span>
                    </label>
                    <input
                        id="margin-slider"
                        type="range"
                        min="5"
                        max="50"
                        step="0.5"
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red mt-2"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-800 font-semibold">Suggested Total Bid Price</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(suggestedBidPrice)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                        <p className="text-sm text-green-800 font-semibold">Estimated Profit</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(estimatedProfit)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarginAdjuster;
