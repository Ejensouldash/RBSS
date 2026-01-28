import React, { useState, useEffect, useMemo } from 'react';
import { TenderAnalysisResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentMagnifyingGlassIcon } from './icons/DocumentMagnifyingGlassIcon';

// --- FORMATTING HELPER ---
const formatCurrency = (amount: number, digits = 2) => {
    return new Intl.NumberFormat('en-MY', { 
        style: 'currency', 
        currency: 'MYR',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(amount).replace('MYR', 'RM');
};


// --- SUB-COMPONENTS for the Dashboard ---
const GaugeChart: React.FC<{ value: number }> = ({ value }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r={radius} stroke="#E5E7EB" strokeWidth="10" fill="transparent" />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="#FFD700"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-brand-text">{Math.round(value)}%</span>
                <span className="text-xs text-gray-500">Win Rate</span>
            </div>
        </div>
    );
};

const PieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="text-center text-gray-500">No cost data available.</div>;

    let cumulative = 0;

    return (
        <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
                 <svg viewBox="0 0 32 32" className="transform -rotate-90">
                    {data.map((slice, index) => {
                        const percentage = (slice.value / total) * 100;
                        const dasharray = `${percentage} ${100 - percentage}`;
                        const dashoffset = -cumulative;
                        cumulative += percentage;
                        return (
                            <circle
                                key={index}
                                r="16" cx="16" cy="16"
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth="32"
                                strokeDasharray={dasharray}
                                strokeDashoffset={dashoffset}
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="text-sm space-y-1">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="font-semibold text-gray-700">{item.label}:</span>
                        <span className="ml-2 text-gray-500">{formatCurrency(item.value, 0)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AIStrategyExplanation: React.FC<{
    baseMarkup: number;
    baseWinRate: number;
}> = ({ baseMarkup, baseWinRate }) => {
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mt-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <SparklesIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-3">
                    <h3 className="text-md font-bold text-yellow-800">Penjelasan Strategi AI</h3>
                    <div className="mt-2 text-sm text-yellow-700 space-y-2">
                        <p>AI telah menganalisis data pasaran dan trend pesaing untuk mencadangkan harga optimum ini. Markup yang dicadangkan sebanyak <strong className="font-semibold">{baseMarkup.toFixed(1)}%</strong> direka untuk mencapai kebarangkalian menang yang tinggi (<strong className="font-semibold">{baseWinRate}%</strong>) sambil mengekalkan margin keuntungan yang sihat.</p>
                        <p>Anda boleh melaraskan markup di atas untuk melihat bagaimana ia memberi kesan kepada keuntungan dan kebarangkalian menang anda secara masa nyata.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const AITenderStrategist: React.FC<{ analysisResult: TenderAnalysisResult | null }> = ({ analysisResult }) => {
    const [markup, setMarkup] = useState(analysisResult?.summary.suggestedMarkup || 8.7);
    const [dynamicWinRate, setDynamicWinRate] = useState(analysisResult?.summary.winProbability || 0);

    useEffect(() => {
        if(analysisResult) {
            setMarkup(analysisResult.summary.suggestedMarkup);
            setDynamicWinRate(analysisResult.summary.winProbability);
        }
    }, [analysisResult]);

    useEffect(() => {
        if (!analysisResult) return;

        const baseMarkup = analysisResult.summary.suggestedMarkup;
        const baseWinRate = analysisResult.summary.winProbability;
        
        // Sensitivity factor: how much win rate changes per 1% change in markup. A higher factor means more sensitive.
        const sensitivityFactor = 5; 
        
        const markupDifference = markup - baseMarkup;
        let calculatedWinRate = baseWinRate - (markupDifference * sensitivityFactor);

        // Clamp the value between a reasonable range, e.g., 10% to 99%
        calculatedWinRate = Math.max(10, Math.min(99, calculatedWinRate));
        
        setDynamicWinRate(calculatedWinRate);

    }, [markup, analysisResult]);

    // Safely calculate total cost from its components
    const totalCost = useMemo(() => {
        if (!analysisResult) return 0;
        return analysisResult.summary.totalMaterialCost + analysisResult.summary.totalLaborCost + analysisResult.summary.totalOverheadCost;
    }, [analysisResult]);


    const { finalTenderValue, profitMargin } = useMemo(() => {
        if (!analysisResult) return { finalTenderValue: 0, profitMargin: 0 };
        const finalValue = totalCost * (1 + markup / 100);
        const profit = finalValue - totalCost;
        return { finalTenderValue: finalValue, profitMargin: profit };
    }, [analysisResult, markup, totalCost]);


    if (!analysisResult) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <DocumentMagnifyingGlassIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-brand-text">No Strategic Data</h3>
                <p className="text-gray-500 mt-1 max-w-sm">The strategic analysis could not be loaded. Please try again.</p>
            </div>
        );
    }
    
    const pieChartData = [
        { label: 'Materials', value: analysisResult.summary.totalMaterialCost, color: '#3B82F6' },
        { label: 'Labor', value: analysisResult.summary.totalLaborCost, color: '#F59E0B' },
        { label: 'Overhead', value: analysisResult.summary.totalOverheadCost, color: '#EF4444' }
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white p-4 rounded-lg border space-y-4">
                    <h4 className="font-bold text-brand-text">Ringkasan Strategik</h4>
                    <div className="flex flex-col md:flex-row justify-around items-center text-center space-y-4 md:space-y-0">
                        <div>
                            <p className="text-sm text-gray-500">Nilai Bidaan Semasa</p>
                            <p className="text-2xl font-bold text-brand-red">{formatCurrency(finalTenderValue, 0)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">Anggaran Keuntungan</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(profitMargin, 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Julat Pesaing</p>
                            <p className="text-lg font-semibold text-gray-600">
                                {formatCurrency(analysisResult.summary.competitorRange.low, 0)} - {formatCurrency(analysisResult.summary.competitorRange.high, 0)}
                            </p>
                        </div>
                    </div>
                     <div className="pt-4">
                        <label htmlFor="markup" className="block text-sm font-medium text-gray-700">Laras Markup: <span className="font-bold text-brand-red">{markup.toFixed(1)}%</span></label>
                        <input
                            id="markup"
                            type="range"
                            min="5"
                            max="20"
                            step="0.1"
                            value={markup}
                            onChange={(e) => setMarkup(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
                        />
                    </div>
                     <AIStrategyExplanation
                        baseMarkup={analysisResult.summary.suggestedMarkup}
                        baseWinRate={analysisResult.summary.winProbability}
                    />
                </div>
                 <div className="bg-white p-4 rounded-lg border flex flex-col items-center justify-center">
                    <GaugeChart value={dynamicWinRate} />
                 </div>
            </div>
            
            {/* Cost Breakdown & Table */}
            <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-bold text-brand-text mb-4">Pecahan Kos & Analisis Item</h4>
                 <div className="mb-6">
                    <PieChart data={pieChartData} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="p-2">#</th>
                                <th className="p-2 w-2/5">Item (Ringkasan)</th>
                                <th className="p-2">Kuantiti/Unit</th>
                                <th className="p-2 text-right">Harga Seunit (Anggaran)</th>
                                <th className="p-2 text-right">Jumlah</th>
                                <th className="p-2 text-center">Keyakinan Harga</th>
                                <th className="p-2">Nota AI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {analysisResult.items.map(item => (
                                <tr key={item.no}>
                                    <td className="p-2">{item.no}</td>
                                    <td className="p-2 font-medium">{item.description}</td>
                                    <td className="p-2">{item.quantity} {item.unit}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.estimatedUnitPrice)}</td>
                                    <td className="p-2 text-right font-semibold">{formatCurrency(item.totalCost)}</td>
                                    <td className="p-2 text-center">
                                        <span className={`px-2 py-1 text-xs rounded-full ${item.confidence > 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {item.confidence}%
                                        </span>
                                    </td>
                                    <td className="p-2 text-xs text-gray-500 italic">{item.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold bg-gray-100">
                            <tr>
                                <td colSpan={4} className="p-2 text-right">Jumlah Anggaran Kos:</td>
                                <td className="p-2 text-right">{formatCurrency(totalCost)}</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AITenderStrategist;