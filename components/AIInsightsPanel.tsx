import React from 'react';
import { Page } from '../App';

interface AIInsightsPanelProps {
    activePage: Page;
}

const InsightCard: React.FC<{ title: string; value: string; colorClass: string; subtext?: string }> = ({ title, value, colorClass, subtext }) => (
    <div className="bg-white p-4 rounded-lg border">
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

const SuggestionItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-md">
        {children}
    </div>
);

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ activePage }) => {

    const renderCostTrendChart = () => (
        <div className="h-40 flex items-end justify-around bg-gray-100 p-4 rounded-md">
           {[{month: 'May', h: 40}, {month: 'Jun', h: 60}, {month: 'Jul', h: 50}, {month: 'Aug', h: 80}].map((bar) => (
               <div key={bar.month} className="flex flex-col items-center">
                   <div 
                     className="w-8 bg-blue-300 rounded-t-sm hover:bg-brand-red transition-colors"
                     style={{ height: `${bar.h}%`}}
                     title={`Trend: ${bar.h}%`}
                   ></div>
                   <span className="text-xs mt-2 text-gray-500">{bar.month}</span>
               </div>
           ))}
        </div>
    );


    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
                <h4 className="font-bold text-brand-text mb-2">Key Insights for This Quotation</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InsightCard title="Profitability Prediction" value="11.5%" colorClass="text-green-600" subtext="Based on current material costs" />
                    <InsightCard title="Risk Level" value="Low" colorClass="text-blue-600" subtext="Standard residential project" />
                </div>
            </div>

            <div>
                <h4 className="font-bold text-brand-text mb-2">Material Cost Trend (Cement)</h4>
                {renderCostTrendChart()}
                <p className="text-xs text-gray-400 mt-2 text-center">Note: Price index is trending upwards. Consider locking in supplier prices.</p>
            </div>

            <div>
                <h4 className="font-bold text-brand-text mb-2">Smart Suggestions</h4>
                <div className="space-y-2">
                    <SuggestionItem>
                        Harga semasa untuk <strong className="font-semibold">pasir</strong> ialah <strong>RM72/m³</strong>. Cadangan markup: <strong>9%</strong>.
                    </SuggestionItem>
                    <SuggestionItem>
                       Consider adding <strong className="font-semibold">"Site Cleaning & Debris Disposal"</strong> as an optional item. It increases value and profit.
                    </SuggestionItem>
                     <SuggestionItem>
                        Your competitor, <strong className="font-semibold">Bina Cekap Sdn Bhd</strong>, often bids 5-7% lower on similar projects. Adjust your final price accordingly.
                    </SuggestionItem>
                </div>
            </div>
        </div>
    );
};

export default AIInsightsPanel;
