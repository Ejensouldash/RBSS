import React, { useState, useCallback } from 'react';
import { CompanyInfo, TenderIntelligenceResult } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { DocumentMagnifyingGlassIcon } from './icons/DocumentMagnifyingGlassIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { extractTextFromFile } from '../utils/fileExtractor';
import TenderAnalysisView from './tender-intelligence/TenderAnalysisView';
import AnalysisLoader from './AnalysisLoader';
import { XMarkIcon } from './icons/XMarkIcon';

type AnalysisState = "idle" | "extracting" | "analyzingCategory" | "promptingForCategory" | "promptingForPrice" | "analyzing" | "complete" | "error";

const FileUploadSection: React.FC<{ onFileUpload: (files: FileList) => void }> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileUpload(e.dataTransfer.files);
        }
    };
    return (
        <div 
            className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-xl transition-colors duration-300 min-h-[400px] ${isDragging ? 'border-brand-gold bg-yellow-50' : 'border-gray-300 bg-gray-50'}`}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        >
            <ArrowUpTrayIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-brand-text">Drag & Drop Tender PDF Here</h3>
            <p className="text-gray-500 mt-1">or</p>
            <label htmlFor="file-upload" className="mt-4 px-6 py-2 bg-brand-black text-white font-semibold rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
                Select File
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={(e) => e.target.files && onFileUpload(e.target.files)} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" />
            <p className="text-xs text-gray-400 mt-4">Supports PDF, Word, Excel & Text documents</p>
        </div>
    );
};

const IndicativePriceModal: React.FC<{
    onConfirm: (price: number) => void;
    onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
    const [price, setPrice] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceValue = parseFloat(price);
        if (!isNaN(priceValue) && priceValue > 0) {
            onConfirm(priceValue);
        } else {
            alert('Please enter a valid, positive number for the price.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold text-brand-text mb-2">Indicative Tender Value Required</h3>
                <p className="text-sm text-gray-600 mb-6">Please enter the tender's ceiling price (Harga Siling) for accurate analysis.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="indicative-price" className="block text-sm font-medium text-gray-700">Jumlah Harga Indikatif (RM)</label>
                        <input
                            id="indicative-price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="e.g., 200000"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-brand-gold text-brand-black font-semibold rounded-md hover:opacity-90">Confirm & Start Analysis</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryModal: React.FC<{
    suggestedCategory: string;
    onConfirm: (category: string) => void;
    onCancel: () => void;
}> = ({ suggestedCategory, onConfirm, onCancel }) => {
    const [category, setCategory] = useState(suggestedCategory);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category.trim()) {
            onConfirm(category.trim());
        } else {
            alert('Please confirm or enter a tender category.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold text-brand-text mb-2">Confirm Tender Category</h3>
                <p className="text-sm text-gray-600 mb-6">The AI has detected the category below. Please confirm it's correct or enter the right one for accurate analysis.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="tender-category" className="block text-sm font-medium text-gray-700">Jenis Bidang / Kategori Tender</label>
                        <input
                            id="tender-category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="cth: Membekal Makanan / ICT / Kerja Jalan"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-brand-gold text-brand-black font-semibold rounded-md hover:opacity-90">Confirm Category</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TenderIntelligenceDashboard: React.FC<{ companyInfo: CompanyInfo }> = ({ companyInfo }) => {
    const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
    const [analysisResult, setAnalysisResult] = useState<TenderIntelligenceResult | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [tenderCategory, setTenderCategory] = useState('');
    const [suggestedCategory, setSuggestedCategory] = useState('');

    const handleFileUpload = useCallback(async (files: FileList) => {
        const file = files[0];
        if (!file) return;

        setUploadedFile(file);
        setAnalysisState("extracting");
        setErrorMessage('');
        setExtractedText('');

        try {
            const text = await extractTextFromFile(file);
            if (!text || !text.trim()) {
                throw new Error("No readable text detected. Please upload a digital (text-based) tender file.");
            }
            setExtractedText(text);
            handleCategoryAnalysis(text);
        } catch (error: any) {
            console.error("Extraction Error:", error);
            setErrorMessage(error.message || "Failed to read the file. Please ensure it's a supported format and not corrupted.");
            setAnalysisState("error");
        }
    }, []);
    
    const handleCategoryAnalysis = useCallback(async (text: string) => {
        setAnalysisState("analyzingCategory");
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: { category: { type: Type.STRING }, confidence: { type: Type.NUMBER } }, required: ['category', 'confidence'] };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the following Malaysian tender document text and determine its primary category (e.g., "Pembekalan Makanan Bermasak", "Kerja-kerja Awam", "Perkakasan ICT", "Perkhidmatan Sewaan Kenderaan"). Provide your confidence level from 0.0 to 1.0. Respond ONLY with a valid JSON object matching the schema. \n\nTEXT: \n${text.substring(0, 4000)}`,
                config: { responseMimeType: 'application/json', responseSchema: schema }
            });
            const { category, confidence } = JSON.parse(response.text);

            if (confidence > 0.7) {
                setTenderCategory(category);
                setAnalysisState("promptingForPrice");
            } else {
                setSuggestedCategory(category || 'General Supply');
                setAnalysisState("promptingForCategory");
            }
        } catch (error) {
             console.error("Category analysis error:", error);
             setSuggestedCategory('General Supply'); // Fallback
             setAnalysisState("promptingForCategory");
        }
    }, []);

    const handleStartAnalysis = useCallback(async (indicativePrice: number) => {
        if (!extractedText || !tenderCategory) return;
        setAnalysisState("analyzing");
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const schema = {
                 type: Type.OBJECT,
                properties: {
                    summary: { type: Type.OBJECT, properties: { tenderTitle: { type: Type.STRING }, tenderCategory: { type: Type.STRING }, detectedCategory: { type: Type.STRING }, closingDate: { type: Type.STRING }, totalItems: { type: Type.NUMBER }, finalTenderValue: { type: Type.NUMBER }, indicativePrice: { type: Type.NUMBER }, winRate: { type: Type.NUMBER }, profitMargin: { type: Type.NUMBER }, feasibilityScore: { type: Type.NUMBER }, roiMonths: { type: Type.NUMBER }, aiVerdict: { type: Type.STRING }, feasibilityRadar: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["subject", "value"] } } }, required: ["tenderTitle", "tenderCategory", "detectedCategory", "closingDate", "totalItems", "finalTenderValue", "indicativePrice", "winRate", "profitMargin", "feasibilityScore", "roiMonths", "aiVerdict", "feasibilityRadar"] },
                    technicalSpecification: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, description: { type: Type.STRING }, quantity: { type: Type.NUMBER }, unit: { type: Type.STRING }, marketPrice: { type: Type.NUMBER }, suggestedPrice: { type: Type.NUMBER }, marginPercent: { type: Type.NUMBER }, note: { type: Type.STRING }, hasWarning: { type: Type.BOOLEAN }, aiTooltip: { type: Type.STRING } }, required: ["item", "description", "quantity", "unit", "marketPrice", "suggestedPrice", "marginPercent", "note", "hasWarning", "aiTooltip"] } } }, required: ["items"] },
                    pricingAnalysis: { type: Type.OBJECT, properties: { priceComparisonChartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, marketPrice: { type: Type.NUMBER }, suggestedPrice: { type: Type.NUMBER } }, required: ["name", "marketPrice", "suggestedPrice"] } }, priceDifferenceChartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, differencePercent: { type: Type.NUMBER } }, required: ["name", "differencePercent"] } }, priceDistributionChartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] } }, supplierBenchmark: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { supplier: { type: Type.STRING }, price: { type: Type.NUMBER }, leadTime: { type: Type.STRING } }, required: ["supplier", "price", "leadTime"] } }, aiRecommendation: { type: Type.STRING } }, required: ["priceComparisonChartData", "priceDifferenceChartData", "priceDistributionChartData", "supplierBenchmark", "aiRecommendation"] },
                    profitability: { type: Type.OBJECT, properties: { roiGaugeMonths: { type: Type.NUMBER }, profitSimulationChartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { turnoverPercent: { type: Type.NUMBER }, netProfit: { type: Type.NUMBER }, sales: { type: Type.NUMBER } }, required: ["turnoverPercent", "netProfit", "sales"] } }, costBreakdownChartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] } }, summary: { type: Type.STRING } }, required: ["roiGaugeMonths", "profitSimulationChartData", "costBreakdownChartData", "summary"] },
                    risk: { type: Type.OBJECT, properties: { riskMatrixData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, likelihood: { type: Type.NUMBER }, impact: { type: Type.NUMBER } }, required: ["category", "likelihood", "impact"] } }, complianceChecklist: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, status: { type: Type.STRING, enum: ["✅", "⚠️", "❌"] }, note: { type: Type.STRING } }, required: ["item", "status", "note"] } }, ictCompliance: { type: Type.OBJECT, properties: { detected: { type: Type.BOOLEAN }, category: { type: Type.STRING }, requirement: { type: Type.STRING }, analysis: { type: Type.STRING }, compliant: { type: Type.BOOLEAN }, recommendation: { type: Type.STRING } }, required: ["detected", "category", "requirement", "analysis", "compliant", "recommendation"] }, aiAdvisory: { type: Type.STRING } }, required: ["riskMatrixData", "complianceChecklist", "aiAdvisory"] },
                    competitiveness: { type: Type.OBJECT, properties: { winRateGauge: { type: Type.NUMBER }, winRateBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] } }, simulation: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: ["text"] }, aiJustification: { type: Type.STRING } }, required: ["winRateGauge", "winRateBreakdown", "simulation", "aiJustification"] },
                    strategicInsights: { type: Type.OBJECT, properties: { recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { icon: { type: Type.STRING, enum: ["💡", "📦", "📅", "🔍"] }, text: { type: Type.STRING } }, required: ["icon", "text"] } }, aiSummary: { type: Type.STRING } }, required: ["recommendations", "aiSummary"] },
                    marketForecast: { type: Type.OBJECT, properties: { priceTrendProjection: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: { type: Type.STRING }, low: { type: Type.NUMBER }, high: { type: Type.NUMBER }, trend: { type: Type.NUMBER } }, required: ["month", "low", "high", "trend"] } }, demandGrowth: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sector: { type: Type.STRING }, growthPercent: { type: Type.NUMBER } }, required: ["sector", "growthPercent"] } }, aiForecast: { type: Type.STRING } }, required: ["priceTrendProjection", "demandGrowth", "aiForecast"] }
                },
                required: ["summary", "technicalSpecification", "pricingAnalysis", "profitability", "risk", "competitiveness", "strategicInsights", "marketForecast"]
            };

            const prompt = `You are a universal, world-class Malaysian tender strategist for 'Rozita Bina Enterprise'. Your task is to analyze the provided tender document for the category '${tenderCategory}' and generate a complete, premium intelligence report as a single JSON object.

**CONTEXT & ABSOLUTE CONSTRAINTS:**
1.  **Tender Category:** ${tenderCategory} (Adapt all logic and pricing to this specific field).
2.  **Indicative Tender Value (Harga Siling):** RM ${indicativePrice.toLocaleString()}
3.  **MANDATORY Win Rate:** Your final calculated 'winRate' MUST be >= 80%.
4.  **MANDATORY Profit Margin:** Your final calculated overall 'profitMargin' MUST be >= 30%.
5.  **Tender Document Text:**
    ---
    ${extractedText}
    ---

**CORE DIRECTIVE:**
Analyze the tender text, identify all items, and devise a winning bid strategy that strictly adheres to the constraints above. You must simulate "self-research" to generate realistic, current Malaysian market prices for all items based on the '${tenderCategory}' context. Adjust your 'suggestedPrice' for each item to achieve the required win rate and profit margin, while staying competitive against the indicative price. If the text is messy, use your intelligence to reconstruct the item list. For the cost breakdown, estimate the split between Material/Labor/Overhead based on the category.

**TRANSPARENCY & JUSTIFICATION RULE (CRUCIAL):**
For EACH item in 'technicalSpecification', you MUST populate the 'aiTooltip' with a detailed, actionable justification for your 'suggestedPrice'. Justify your pricing based on the tender category.
- **Example for ICT:** 'Surveyed from Lazada & Shopee. Benchmarked against Dell, HP. Suggestion: Dell Optiplex 3000 SFF fits this budget.'
- **Example for Catering:** 'Based on current bulk food prices from NSK/Mydin. Priced per-head including transport and service costs.'
- **Example for Stationery:** 'Bulk pricing model from major suppliers like Pelikan/Faber-Castell. Includes packaging.'

**SPECIAL ICT TENDER VALIDATION RULE:**
- If the tender category is ICT-related, you MUST check for OEM compliance and populate the 'risk.ictCompliance' object with specific, actionable brand recommendations (e.g., "Replace with a complete Dell Optiplex or HP ProDesk set."). If not ICT, omit the 'ictCompliance' object from the 'risk' object's 'required' list.

**OUTPUT INSTRUCTIONS:**
- Populate ALL fields in the provided JSON schema, including the new 'supplierBenchmark'.
- Your final bid ('finalTenderValue') should be competitive, ideally slightly below the 'indicativePrice'.
- Set 'detectedCategory' to the confirmed '${tenderCategory}'.
- Respond with a single, valid JSON object ONLY. No other text or explanations.`;
            
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { 
                    temperature: 0.2, 
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            const parsedResult: TenderIntelligenceResult = JSON.parse(response.text);
            
            setAnalysisResult(parsedResult);
            setAnalysisState("complete");

        } catch (error) {
            console.error("Gemini API Error:", error);
            setErrorMessage("The AI system encountered an error during analysis. This could be due to high traffic or an issue understanding the document's format. Please try again.");
            setAnalysisState("error");
        }
    }, [extractedText, tenderCategory]);

    const handleReset = () => {
        setAnalysisState("idle");
        setAnalysisResult(null);
        setUploadedFile(null);
        setExtractedText('');
        setErrorMessage('');
        setTenderCategory('');
        setSuggestedCategory('');
    };

    const renderContent = () => {
        switch (analysisState) {
            case "idle":
                return <FileUploadSection onFileUpload={handleFileUpload} />;
            case "extracting":
                 return <AnalysisLoader title="Reading & Cleaning Tender Document..." steps={[`Opening ${uploadedFile?.name || 'file'}...`, "Performing AI-based text reconstruction..."]} />;
            case "analyzingCategory":
                 return <AnalysisLoader title="AI is Detecting Tender Category..." steps={["Analyzing document keywords...", "Determining primary field..."]} />;
            case "promptingForCategory":
                return <CategoryModal suggestedCategory={suggestedCategory} onConfirm={(category) => { setTenderCategory(category); setAnalysisState("promptingForPrice"); }} onCancel={handleReset} />;
            case "promptingForPrice":
                return <IndicativePriceModal onConfirm={handleStartAnalysis} onCancel={handleReset} />;
            case "analyzing":
                return <AnalysisLoader title={`Running AI Tender Analysis for '${tenderCategory}'...`} steps={["Calculating win rate strategy...", "Estimating market prices...", "Simulating ROI and margins...", "Assessing feasibility and risk...", "Building intelligence dashboard..."]} />;
            case "complete":
                return analysisResult ? <TenderAnalysisView analysisResult={analysisResult} companyInfo={companyInfo} onReset={handleReset} tenderFile={uploadedFile} /> : null;
            case "error":
                return (
                    <div className="text-center min-h-[400px] flex flex-col justify-center items-center">
                        <p className="text-lg font-semibold text-brand-red">Sorry, an error occurred.</p>
                        <p className="text-gray-500 mt-2 max-w-md">{errorMessage}</p>
                        <button onClick={handleReset} className="mt-6 px-6 py-2 bg-brand-black text-white rounded-md hover:bg-gray-800">
                           Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-brand-red" />
                    <div>
                        <h1 className="text-3xl font-bold text-brand-text">AI Tender Intelligence</h1>
                        <p className="text-sm text-gray-500">Universal Multi-Category Analysis Engine</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default TenderIntelligenceDashboard;