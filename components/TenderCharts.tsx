import React from 'react';
import { TenderAnalysisResult } from '../types';

const formatCurrency = (amount: number, digits = 0) => {
    return new Intl.NumberFormat('en-MY', { 
        style: 'currency', 
        currency: 'MYR',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(amount).replace('MYR', 'RM');
};

const GaugeChart: React.FC<{ value: number }> = ({ value }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r={radius} stroke="#E5E7EB" strokeWidth="15" fill="transparent" />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="#FFD700"
                    strokeWidth="15"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-brand-text">{value}%</span>
                <span className="text-sm text-gray-500">Win Probability</span>
            </div>
        </div>
    );
};

const PieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="text-center text-gray-500">No cost data.</div>;

    let cumulative = 0;
    const radius = 16;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex flex-col items-center space-y-4">
             <svg viewBox="0 0 32 32" className="w-40 h-40 transform -rotate-90">
                {data.map((slice, index) => {
                    const percentage = (slice.value / total) * 100;
                    const dasharray = `${percentage} ${100 - percentage}`;
                    const dashoffset = -cumulative;
                    cumulative += percentage;
                    return (
                        <circle
                            key={index}
                            r={radius} cx={radius} cy={radius}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={radius*2}
                            strokeDasharray={dasharray}
                            strokeDashoffset={dashoffset}
                        />
                    );
                })}
            </svg>
            <div className="text-md space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="font-semibold text-gray-700">{item.label}:</span>
                        <span className="ml-2 text-gray-600">{formatCurrency(item.value, 0)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TenderCharts: React.FC<{ analysisResult: TenderAnalysisResult }> = ({ analysisResult }) => {
     const pieData = [
        { label: 'Materials Cost', value: analysisResult.summary.totalMaterialCost, color: '#3B82F6' },
        { label: 'Labor Cost', value: analysisResult.summary.totalLaborCost, color: '#F59E0B' },
        { label: 'Overhead Cost', value: analysisResult.summary.totalOverheadCost, color: '#EF4444' }
    ];

    return (
        <div className="p-4 bg-white">
            <h3 className="text-center text-xl font-bold mb-6">Visual Cost Analysis</h3>
            <div className="flex justify-around items-center">
                <PieChart data={pieData} />
                <GaugeChart value={analysisResult.summary.winProbability} />
            </div>
        </div>
    );
};

export default TenderCharts;