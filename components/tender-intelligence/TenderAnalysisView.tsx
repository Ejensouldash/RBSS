import React, { useState, useMemo, useCallback, useRef } from 'react';
import { TenderIntelligenceResult, CompanyInfo } from '../../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell,
    ComposedChart, Area
} from 'recharts';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import TenderChatPanel from './TenderChatPanel';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';
import { InfoIcon } from '../icons/InfoIcon';
import ReportForPDF from './ReportForPDF'; // Import the new component

// --- Robust Script Loader ---
declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    pdfMake: any;
  }
}
const scriptPromises: Record<string, Promise<void>> = {};
const loadScript = (src: string): Promise<void> => {
    if (scriptPromises[src]) {
        return scriptPromises[src];
    }
    scriptPromises[src] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            delete scriptPromises[src];
            reject(new Error(`Failed to load script: ${src}.`));
        };
        document.head.appendChild(script);
    });
    return scriptPromises[src];
};


// --- MAIN VIEW COMPONENT ---

interface TenderAnalysisViewProps {
    analysisResult: TenderIntelligenceResult;
    companyInfo: CompanyInfo;
    tenderFile: File | null;
    onReset: () => void;
}

const TABS = [
    "Summary", "Technical Specification", "Market & Pricing", "Profitability & ROI", 
    "Risk & Compliance", "Competitiveness", "Strategic Insights", "AI Insight Chat", 
    "Market Forecast", "Report & Export"
];

const TenderAnalysisView: React.FC<TenderAnalysisViewProps> = ({ analysisResult, companyInfo, tenderFile, onReset }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    return (
        <div className="bg-slate-50 p-4 rounded-xl">
            <header className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tender Intelligence Dashboard</h1>
                    <p className="text-sm text-gray-500">Analysis for: <span className="font-semibold text-brand-red">{analysisResult.summary.tenderTitle}</span></p>
                </div>
                <button onClick={onReset} className="font-semibold text-brand-red hover:underline text-sm whitespace-nowrap">Analyze New Tender</button>
            </header>

            <div className="overflow-x-auto border-b border-gray-200">
                <nav className="flex space-x-4">
                    {TABS.map(tab => (
                        <TabButton key={tab} label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
                    ))}
                </nav>
            </div>
            
            <main className="mt-6">
                {activeTab === 'Summary' && <SummaryTab data={analysisResult.summary} />}
                {activeTab === 'Technical Specification' && <SpecificationTab data={analysisResult.technicalSpecification} />}
                {activeTab === 'Market & Pricing' && <PricingAnalysisTab data={analysisResult.pricingAnalysis} />}
                {activeTab === 'Profitability & ROI' && <ProfitabilityTab data={analysisResult.profitability} />}
                {activeTab === 'Risk & Compliance' && <RiskTab data={analysisResult.risk} />}
                {activeTab === 'Competitiveness' && <CompetitivenessTab data={analysisResult.competitiveness} />}
                {activeTab === 'Strategic Insights' && <InsightsTab data={analysisResult.strategicInsights} />}
                {activeTab === 'AI Insight Chat' && <ChatTab analysisResult={analysisResult} />}
                {activeTab === 'Market Forecast' && <ForecastTab data={analysisResult.marketForecast} />}
                {activeTab === 'Report & Export' && <ExportTab analysisResult={analysisResult} companyInfo={companyInfo} tenderFile={tenderFile} />}
            </main>
        </div>
    );
};

// --- TAB SUB-COMPONENTS ---

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus:outline-none border-b-2 ${
            isActive ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-text'
        }`}
    >
        {label}
    </button>
);

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${className}`}>
        {title && <h3 className="text-lg font-bold text-brand-text mb-4">{title}</h3>}
        {children}
    </div>
);

const SummaryTab: React.FC<{ data: TenderIntelligenceResult['summary'] }> = ({ data }) => {
     const radarDataForChart = useMemo(() => data.feasibilityRadar.map(d => ({...d, fullMark: 100})), [data.feasibilityRadar]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoBox label="Win Rate" value={`${data.winRate}%`} className="text-green-600" />
                    <InfoBox label="Profit Margin" value={`${data.profitMargin.toFixed(1)}%`} className="text-blue-600" />
                    <InfoBox label="Feasibility" value={`${data.feasibilityScore}%`} className="text-purple-600" />
                    <InfoBox label="Est. ROI" value={`${data.roiMonths} mths`} className="text-amber-600" />
                </div>
                 <Card>
                    <p className="text-lg font-semibold">AI Verdict:</p>
                    <p className="text-gray-600">{data.aiVerdict}</p>
                 </Card>
                 <Card>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <h4 className="font-semibold text-gray-700">Tender Details</h4>
                             <ul className="text-sm space-y-1 mt-2 text-gray-600">
                                 <li><strong>Category:</strong> {data.tenderCategory}</li>
                                 <li><strong>AI Detected:</strong> <span className="font-bold text-purple-700">{data.detectedCategory}</span></li>
                                 <li><strong>Closing Date:</strong> {data.closingDate}</li>
                                 <li><strong>Total Items:</strong> {data.totalItems}</li>
                             </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">Financials</h4>
                             <ul className="text-sm space-y-1 mt-2 text-gray-600">
                                 <li><strong>Indicative Price:</strong> RM {data.indicativePrice.toLocaleString()}</li>
                                 <li><strong>Final Bid:</strong> RM {data.finalTenderValue.toLocaleString()}</li>
                             </ul>
                        </div>
                     </div>
                 </Card>
            </div>
            <Card title="Feasibility Overview">
                 <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarDataForChart}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" fontSize={12} />
                        <Radar name="Score" dataKey="value" stroke="#D2042D" fill="#D2042D" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};
const InfoBox: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className="bg-slate-100 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-3xl font-bold ${className}`}>{value}</p>
    </div>
);

const SpecificationTab: React.FC<{ data: TenderIntelligenceResult['technicalSpecification'] }> = ({ data }) => (
    <Card title="Technical Specification & Pricing">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="p-2">Item</th><th className="p-2">Description</th>
                        <th className="p-2">Qty</th><th className="p-2">Unit</th>
                        <th className="p-2 text-right">Market Price</th><th className="p-2 text-right">Suggested Price</th>
                        <th className="p-2 text-center">Margin</th><th className="p-2">Note</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i} className={`border-b ${item.hasWarning ? 'bg-red-50' : ''}`}>
                            <td className="p-2 font-semibold">{item.item}</td>
                            <td className="p-2 text-gray-600">{item.description}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-center">{item.unit}</td>
                            <td className="p-2 text-right">RM {item.marketPrice.toFixed(2)}</td>
                            <td className="p-2 text-right font-bold">
                                <div className="flex items-center justify-end gap-1">
                                    <span>RM {item.suggestedPrice.toFixed(2)}</span>
                                    <span title={item.aiTooltip} className="cursor-help text-gray-400 hover:text-blue-600">
                                        <InfoIcon />
                                    </span>
                                </div>
                            </td>
                            <td className="p-2 text-center text-green-700">{item.marginPercent.toFixed(1)}%</td>
                            <td className="p-2 text-xs text-gray-500 italic">{item.note}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

const PricingAnalysisTab: React.FC<{ data: TenderIntelligenceResult['pricingAnalysis'] }> = ({ data }) => (
     <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Market Price vs. Suggested Price">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.priceComparisonChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="name" fontSize={10} />
                        <YAxis tickFormatter={(val) => `RM${val/1000}k`} fontSize={10}/>
                        <Tooltip formatter={(value: number) => `RM ${value.toLocaleString()}`} /> <Legend wrapperStyle={{ fontSize: "10px" }}/>
                        <Bar dataKey="marketPrice" name="Market Avg" fill="#8884d8" />
                        <Bar dataKey="suggestedPrice" name="Suggested" fill="#FFD700" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Pricing Strategy">
                <p className="text-center text-5xl font-bold text-green-600 my-8">
                    {Math.abs(data.priceDifferenceChartData[0]?.differencePercent || 0).toFixed(1)}%
                </p>
                <p className="text-center text-gray-600 -mt-4 mb-8">Below Market Average</p>
                <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-md border">{data.aiRecommendation}</p>
            </Card>
        </div>
        <Card title="AI Supplier Benchmarking">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-2">Simulated Supplier</th>
                            <th className="p-2 text-right">Comparable Bid Price (RM)</th>
                            <th className="p-2">Est. Lead Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.supplierBenchmark?.map((supplier, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-2 font-semibold">{supplier.supplier}</td>
                                <td className="p-2 text-right">RM {supplier.price.toLocaleString()}</td>
                                <td className="p-2">{supplier.leadTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
     </div>
);

const ProfitabilityTab: React.FC<{ data: TenderIntelligenceResult['profitability'] }> = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
            <Card title="Profit vs. Sales Simulation">
                <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={data.profitSimulationChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="turnoverPercent" unit="%" fontSize={10} />
                        <YAxis tickFormatter={(val) => `RM${val/1000}k`} fontSize={10}/>
                        <Tooltip formatter={(value: number) => `RM ${value.toLocaleString()}`} /> <Legend wrapperStyle={{ fontSize: "10px" }}/>
                        <Area type="monotone" dataKey="sales" name="Sales" fill="#8884d8" stroke="#8884d8" />
                        <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#FFD700" strokeWidth={2}/>
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-md border">{data.summary}</p>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card title="ROI Projection" className="text-center">
                <p className="text-6xl font-bold text-amber-600 mt-8">{data.roiGaugeMonths}</p>
                <p className="text-lg text-gray-500">Months</p>
            </Card>
            <Card title="Cost Breakdown">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={data.costBreakdownChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {data.costBreakdownChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#FFD700', '#D2042D', '#000000'][index % 3]} />)}
                        </Pie>
                         <Tooltip formatter={(value: number) => `RM ${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    </div>
);

const RiskTab: React.FC<{ data: TenderIntelligenceResult['risk'] }> = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Risk & Compliance">
             <h4 className="font-semibold text-gray-800 mb-2 text-sm">General Compliance Checklist</h4>
            <ul className="space-y-2">
                {data.complianceChecklist.map((item, i) => (
                    <li key={i} className="flex items-start">
                        <span className="mr-2">{item.status}</span>
                        <div>
                            <p className="font-semibold">{item.item}</p>
                            <p className="text-xs text-gray-500">{item.note}</p>
                        </div>
                    </li>
                ))}
            </ul>

            {data.ictCompliance && data.ictCompliance.detected && (
                <>
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">ICT Specification Validation</h4>
                        <div className="p-4 bg-slate-50 rounded-lg border">
                             <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Category:</span>
                                    <span>{data.ictCompliance.category}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Requirement:</span>
                                    <span className="font-bold">{data.ictCompliance.requirement}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Analysis:</span>
                                    <span>{data.ictCompliance.analysis}</span>
                                </li>
                                <li className="flex justify-between items-center pt-2 mt-2 border-t">
                                    <span className="font-semibold text-gray-600">Compliance:</span>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        data.ictCompliance.compliant
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {data.ictCompliance.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                     <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800"><span className="font-bold">AI Recommendation:</span> {data.ictCompliance.recommendation}</p>
                    </div>
                </>
            )}
        </Card>
        <Card title="AI Risk Advisory">
            <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-md border">{data.aiAdvisory}</p>
        </Card>
    </div>
);

const CompetitivenessTab: React.FC<{ data: TenderIntelligenceResult['competitiveness'] }> = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Win Rate" className="text-center">
             <p className="text-7xl font-bold text-green-600 my-8">{data.winRateGauge}%</p>
             <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-md border">{data.aiJustification}</p>
        </Card>
         <Card title="Win Rate Factors">
            {data.winRateBreakdown.map(item => (
                <div key={item.name} className="mb-2">
                    <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{item.name}</span><span>{item.value}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-brand-gold h-2.5 rounded-full" style={{width: `${item.value}%`}}></div></div>
                </div>
            ))}
             <p className="text-center text-sm text-gray-600 mt-4 p-2 bg-slate-100 rounded-md">{data.simulation.text}</p>
        </Card>
    </div>
);

const InsightsTab: React.FC<{ data: TenderIntelligenceResult['strategicInsights'] }> = ({ data }) => (
    <Card title="Strategic Insights & Next Steps">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="text-xl">{rec.icon}</span>
                    <p className="text-sm">{rec.text}</p>
                </div>
            ))}
        </div>
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
            <h4 className="font-bold text-blue-800">AI Summary</h4>
            <p className="text-sm text-blue-700 mt-1">{data.aiSummary}</p>
        </div>
    </Card>
);

const ChatTab: React.FC<{ analysisResult: TenderIntelligenceResult }> = ({ analysisResult }) => (
    <TenderChatPanel analysisResult={analysisResult} isOpen={true} onToggle={() => {}} />
);

const ForecastTab: React.FC<{ data: TenderIntelligenceResult['marketForecast'] }> = ({ data }) => (
     <Card title="Future Market Forecast (3-6 Months)">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                 <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.priceTrendProjection}>
                        <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="month" fontSize={10}/>
                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} fontSize={10}/>
                        <Tooltip /> <Legend wrapperStyle={{ fontSize: "10px" }} />
                        <Line type="monotone" dataKey="trend" name="Price Trend" stroke="#8884d8" />
                        <Area type="monotone" dataKey="high" fill="#ccc" stroke="#ccc" name="High"/>
                        <Area type="monotone" dataKey="low" fill="#fff" stroke="#ccc" name="Low"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="p-4 bg-slate-50 rounded-md border">
                <h4 className="font-semibold mb-2">Demand Growth</h4>
                {data.demandGrowth.map(item => (
                    <div key={item.sector} className="flex justify-between text-sm py-1">
                        <span>{item.sector}</span>
                        <span className="font-bold text-green-600">+{item.growthPercent}%</span>
                    </div>
                ))}
                 <p className="text-xs text-gray-600 mt-4 pt-4 border-t">{data.aiForecast}</p>
            </div>
         </div>
     </Card>
);

const ExportTab: React.FC<{ analysisResult: TenderIntelligenceResult, companyInfo: CompanyInfo, tenderFile: File | null }> = ({ analysisResult, companyInfo, tenderFile }) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleGeneratePdf = useCallback(async () => {
        setIsGeneratingPdf(true);
        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js')
            ]);

            const pdfMake = window.pdfMake;
            const html2canvas = window.html2canvas;
            if (!pdfMake || !html2canvas || !reportRef.current) {
                throw new Error("PDF libraries could not be loaded.");
            }

            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const chartsImage = canvas.toDataURL('image/png');

            const formatCurrency = (amount: number, digits = 2) => `RM ${amount.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

            const specItemsBody = [
                [{ text: '#', style: 'tableHeader' }, { text: 'Description', style: 'tableHeader' }, { text: 'Qty', style: 'tableHeader' }, { text: 'Unit', style: 'tableHeader' }, { text: 'Market Price', style: 'tableHeader' }, { text: 'Suggested Price', style: 'tableHeader' }]
            ];
            analysisResult.technicalSpecification.items.forEach(item => {
                specItemsBody.push([
                    item.item,
                    item.description,
                    { text: item.quantity, alignment: 'center' },
                    { text: item.unit, alignment: 'center' },
                    { text: formatCurrency(item.marketPrice), alignment: 'right' },
                    { text: formatCurrency(item.suggestedPrice), alignment: 'right', bold: true }
                ]);
            });

            const docDefinition: any = {
                pageSize: 'A4',
                pageMargins: [40, 80, 40, 60],
                header: {
                    columns: [
                        companyInfo.logo ? { image: companyInfo.logo, width: 70, margin: [40, 20, 0, 0] } : {},
                        {
                            stack: [
                                { text: companyInfo.name, style: 'header' },
                                { text: 'AI Tender Intelligence Report', style: 'subheader' }
                            ],
                            alignment: 'right', margin: [0, 25, 40, 0]
                        }
                    ]
                },
                footer: (currentPage: number, pageCount: number) => ({
                    columns: [
                        { text: 'Generated by RBE-AI', alignment: 'left', style: 'footer' },
                        { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', style: 'footer' }
                    ],
                    margin: [40, 20, 40, 0]
                }),
                content: [
                    { text: `Analysis For: ${analysisResult.summary.tenderTitle}`, style: 'h1' },
                    { text: `Source File: ${tenderFile?.name || 'N/A'}`, style: 'p' },
                    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 10, 0, 20] },
                    { text: 'Executive Summary', style: 'h2' },
                    {
                        columns: [
                            { stack: [{ text: 'Win Rate', style: 'summaryLabel' }, { text: `${analysisResult.summary.winRate}%`, style: 'summaryValue', color: '#059669' }] },
                            { stack: [{ text: 'Profit Margin', style: 'summaryLabel' }, { text: `${analysisResult.summary.profitMargin.toFixed(1)}%`, style: 'summaryValue', color: '#2563eb' }] },
                            { stack: [{ text: 'Final Bid', style: 'summaryLabel' }, { text: formatCurrency(analysisResult.summary.finalTenderValue, 0), style: 'summaryValue', color: '#D2042D' }] },
                        ], margin: [0, 0, 0, 15]
                    },
                    { text: 'AI Verdict:', style: 'p', bold: true },
                    { text: analysisResult.summary.aiVerdict, style: 'p' },
                    
                    { text: 'Visual Analysis', style: 'h2' },
                    { image: chartsImage, width: 515, margin: [0, 0, 0, 20] },

                    { text: 'Strategic Insights', style: 'h2' },
                    {
                        ul: analysisResult.strategicInsights.recommendations.map(rec => `${rec.icon} ${rec.text}`),
                        style: 'p', margin: [10, 0, 0, 15]
                    },
                    { text: analysisResult.strategicInsights.aiSummary, style: 'p', italics: true },

                    { text: 'Technical Specification & Pricing', style: 'h2', pageBreak: 'before' },
                    {
                        style: 'itemsTable',
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                            body: specItemsBody
                        },
                        layout: 'lightHorizontalLines'
                    }
                ],
                styles: {
                    header: { fontSize: 24, bold: true }, subheader: { fontSize: 10, color: '#333' },
                    h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 5], color: '#D2042D' },
                    h2: { fontSize: 14, bold: true, margin: [0, 15, 0, 8] },
                    p: { fontSize: 10, color: '#333', lineHeight: 1.4 },
                    summaryLabel: { fontSize: 9, color: '#555' },
                    summaryValue: { fontSize: 16, bold: true },
                    itemsTable: { margin: [0, 5, 0, 15], fontSize: 9 },
                    tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#333' },
                    footer: { fontSize: 8, italics: true, color: '#aaa' }
                }
            };

            const fileName = `RozitaBinaEnterprise_TenderAnalysis_${analysisResult.summary.detectedCategory.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdfMake.createPdf(docDefinition).download(fileName);
            alert('✅ Analisis tender berjaya dijana dan disimpan sebagai PDF.');

        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            alert(`Sorry, there was an error generating the PDF: ${error.message}. Please try again.`);
        } finally {
            setIsGeneratingPdf(false);
        }
    }, [analysisResult, companyInfo, tenderFile]);

    return (
        <>
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '900px', background: 'white', padding: '1rem' }} ref={reportRef}>
                <ReportForPDF analysisResult={analysisResult} />
            </div>
            <Card className="text-center">
                <h3 className="text-2xl font-bold">Generate Tender Report</h3>
                <p className="text-gray-500 my-4">Export the complete analysis, including all charts and insights, into a professional PDF document.</p>
                <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="px-8 py-3 bg-brand-red text-white font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                >
                    {isGeneratingPdf ? 'Generating...' : '📄 Export Tender Report (PDF)'}
                </button>
            </Card>
        </>
    );
};

export default TenderAnalysisView;