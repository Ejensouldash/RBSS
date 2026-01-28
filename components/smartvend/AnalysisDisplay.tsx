import React, { useState } from 'react';
import { AIVendingAnalysis, MachineProfile, CompanyInfo } from '../../types';
import HeaderCard from './HeaderCard';
import ProfitScenarioChart from './ProfitScenarioChart';
import ProductProfitabilityTable from './ProductProfitabilityTable';
import CategoryPerformancePieChart from './CategoryPerformancePieChart';
import ROIProjectionChart from './ROIProjectionChart';
import AIRecommendationCard from './AIRecommendationCard';
import AISummaryReport from './AISummaryReport';
import { TargetIcon } from '../icons/TargetIcon';
import { TrendingUpIcon } from '../icons/TrendingUpIcon';
import { BrainIcon } from '../icons/BrainIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { TruckIcon } from '../icons/TruckIcon';
import InsightChatPanel from './InsightChatPanel';
import { XMarkIcon } from '../icons/XMarkIcon';
import OperationalInsights from './OperationalInsights';

interface AnalysisDisplayProps {
    analysisResult: AIVendingAnalysis;
    machineProfile: MachineProfile;
    onReset: () => void;
    companyInfo: CompanyInfo;
}

const formatCurrency = (amount: number, digits = 2) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount).replace('MYR', '');

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysisResult, machineProfile, onReset, companyInfo }) => {
    const { headerStats } = analysisResult;
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                     <h2 className="text-2xl font-bold text-brand-text">Analysis for: {machineProfile.machineId}</h2>
                     <p className="text-md text-gray-500">{machineProfile.location} ({machineProfile.environment})</p>
                </div>
                <button onClick={onReset} className="font-semibold text-brand-red hover:underline">
                    Analyze Another Machine
                </button>
            </div>
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <HeaderCard title="Avg. Daily Profit" value={`RM ${formatCurrency(headerStats.avgDailyProfit, 2)}`} icon={<TrendingUpIcon className="w-6 h-6"/>} subtext="@ 60% turnover"/>
                <HeaderCard title="Est. Net Monthly Profit" value={`RM ${formatCurrency(headerStats.avgMonthlyProfit, 2)}`} icon={<CalendarDaysIcon className="w-6 h-6"/>} />
                <HeaderCard title="Monthly Ops Cost" value={`RM ${formatCurrency(headerStats.monthlyRestockingCost, 2)}`} icon={<TruckIcon className="w-6 h-6"/>} subtext={`Based on ${machineProfile.maintenanceFrequency} top-ups`}/>
                <HeaderCard title="Est. ROI" value={`${headerStats.roiMonths.toFixed(1)} months`} icon={<TargetIcon className="w-6 h-6"/>} />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <OperationalInsights headerStats={headerStats} machineProfile={machineProfile} />
                    <ProductProfitabilityTable products={analysisResult.productAnalysis} topPicks={analysisResult.topPicks} />
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                    <ProfitScenarioChart data={analysisResult.profitScenarios} />
                    <CategoryPerformancePieChart data={analysisResult.categoryPerformance} summary={analysisResult.categorySummary} />
                </div>
            </div>

            {/* ROI Chart - Full Width */}
            <ROIProjectionChart 
                data={analysisResult.roiProjection} 
                breakEvenMonth={analysisResult.breakEvenMonth} 
                machineCost={machineProfile.machineCost} 
            />
            
            {/* Recommendations - Full Width Below Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-brand-text mb-2">AI Location-Aware Recommendations</h3>
                <p className="text-sm text-gray-600 mb-4">{analysisResult.locationSummary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.locationRecommendations.map((rec, index) => (
                        <AIRecommendationCard key={index} icon={rec.icon} text={rec.text} />
                    ))}
                </div>
            </div>
            
            {/* AI Summary Report */}
            <AISummaryReport 
                analysisResult={analysisResult} 
                machineProfile={machineProfile} 
                companyInfo={companyInfo} 
            />

            {/* Insight Chat Floating Button & Panel */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="w-16 h-16 bg-brand-black rounded-full text-white flex items-center justify-center shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-brand-red focus:outline-none focus:ring-4 focus:ring-brand-gold focus:ring-opacity-50"
                    aria-label={isChatOpen ? "Close Insight Chat" : "Open Insight Chat"}
                >
                    {isChatOpen ? (
                        <XMarkIcon className="w-8 h-8" />
                    ) : (
                        <BrainIcon className="w-8 h-8" />
                    )}
                </button>
            </div>
            
            <InsightChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                machineProfile={machineProfile}
                analysisResult={analysisResult}
            />

        </div>
    );
};

export default AnalysisDisplay;