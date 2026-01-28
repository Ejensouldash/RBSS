import React from 'react';
import { MaterialIntelligenceData } from '../../types';

interface ForecastPanelProps {
    forecast: MaterialIntelligenceData['forecast'];
    reasoning: string;
    unit: string;
}

const ForecastPanel: React.FC<ForecastPanelProps> = ({ forecast, reasoning, unit }) => {

    const probabilityColor = forecast.probabilityPercent > 80 ? 'bg-green-500' : 
                             forecast.probabilityPercent > 60 ? 'bg-yellow-500' : 
                             'bg-red-500';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-brand-text mb-4">AI Price Forecast (Next 7 Days)</h2>
            <div className="text-center mb-4">
                <p className="text-4xl font-bold text-brand-red">
                    RM {forecast.next7Days.low.toFixed(2)} - RM {forecast.next7Days.high.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Projected price range {unit}</p>
            </div>
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Forecast Confidence</span>
                    <span className={`text-sm font-bold ${probabilityColor.replace('bg-','text-')}`}>{forecast.probabilityPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className={`${probabilityColor} h-2.5 rounded-full`} 
                        style={{ width: `${forecast.probabilityPercent}%` }}
                    ></div>
                </div>
            </div>
            <div>
                 <h3 className="text-sm font-semibold text-brand-text mb-2">Reasoning:</h3>
                 <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border">{reasoning}</p>
            </div>
        </div>
    );
};

export default ForecastPanel;
