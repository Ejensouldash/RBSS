import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { VendingMachineIcon } from './icons/VendingMachineIcon';
import MachineProfileSetup from './smartvend/MachineProfileSetup';
import { MachineProfile, VendingProduct, AIVendingAnalysis, CompanyInfo } from '../types';
import VendingProductUploader from './smartvend/VendingProductUploader';
import AnalysisDisplay from './smartvend/AnalysisDisplay';
import AnalysisLoader from './AnalysisLoader';

type AnalysisState = "setup" | "analyzing" | "complete" | "error";

interface SmartVendDashboardProps {
    companyInfo: CompanyInfo;
}

const SmartVendDashboard: React.FC<SmartVendDashboardProps> = ({ companyInfo }) => {
    const [analysisState, setAnalysisState] = useState<AnalysisState>("setup");
    const [machineProfile, setMachineProfile] = useState<MachineProfile | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AIVendingAnalysis | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleProfileAndFileSubmit = async (profile: MachineProfile, rawFileText: string) => {
        setMachineProfile(profile);
        await handleAnalyze(profile, rawFileText);
    };
    
    const handleAnalyze = useCallback(async (profile: MachineProfile, rawFileText: string) => {
        setAnalysisState("analyzing");
        setErrorMessage('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // --- STEP 1: Extract clean JSON from raw text (Flash model) ---
            const extractionSchema = {
                type: Type.OBJECT, properties: { products: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { productName: { type: Type.STRING }, category: { type: Type.STRING }, costPrice: { type: Type.NUMBER }, sellPrice: { type: Type.NUMBER }, }, required: ["productName", "category", "costPrice", "sellPrice"] } } }, required: ["products"]
            };
            const extractionResponse = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: `You are a data extraction AI. Read the messy raw text from a vending machine product file below. Your only job is to find the product list and extract it into a clean JSON object containing an array of products. The relevant columns will have headers like 'Product', 'Nama', 'Kategori', 'Harga Kos', 'Cost', 'Harga Jual', 'Sell Price', etc. Ignore all other text, summaries, or artifacts in the file.
**Raw Text:**
---
${rawFileText}
---
**Output Format:**
Return ONLY a single, valid JSON object that strictly adheres to the provided schema.`,
                config: { responseMimeType: "application/json", responseSchema: extractionSchema }
            });
            const { products: extractedProducts } = JSON.parse(extractionResponse.text);
            if (!extractedProducts || extractedProducts.length === 0) {
                throw new Error("Could not find any valid product data in the uploaded file. Please check the file content.");
            }

            // --- STEP 2: Combined Financial & Strategic Analysis ---
            const combinedSchema = {
                type: Type.OBJECT,
                properties: {
                    headerStats: { type: Type.OBJECT, properties: { roiMonths: { type: Type.NUMBER }, avgDailyProfit: { type: Type.NUMBER }, powerCostPerDay: { type: Type.NUMBER }, avgMonthlyProfit: { type: Type.NUMBER }, monthlyRestockingCost: { type: Type.NUMBER } }, required: ["roiMonths", "avgDailyProfit", "powerCostPerDay", "avgMonthlyProfit", "monthlyRestockingCost"] },
                    profitScenarios: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { turnover: { type: Type.NUMBER }, netProfit: { type: Type.NUMBER }, sales: { type: Type.NUMBER }, margin: { type: Type.NUMBER } }, required: ["turnover", "netProfit", "sales", "margin"] } },
                    productAnalysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { productName: { type: Type.STRING }, category: { type: Type.STRING }, costPrice: { type: Type.NUMBER }, sellPrice: { type: Type.NUMBER }, margin: { type: Type.NUMBER }, performance: { type: Type.STRING, enum: ['Excellent', 'Good', 'Low', 'Poor'] } }, required: ["productName", "category", "costPrice", "sellPrice", "margin", "performance"] } },
                    topPicks: { type: Type.OBJECT, properties: { highestMargin: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] }, lowestPerformer: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] } }, required: ["highestMargin", "lowestPerformer"] },
                    categoryPerformance: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, profit: { type: Type.NUMBER }, slotUsage: { type: Type.NUMBER } }, required: ["category", "profit", "slotUsage"] } },
                    roiProjection: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: { type: Type.NUMBER }, cumulativeProfit: { type: Type.NUMBER } }, required: ["month", "cumulativeProfit"] } },
                    breakEvenMonth: { type: Type.NUMBER },
                    categorySummary: { type: Type.STRING },
                    locationRecommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { icon: { type: Type.STRING }, text: { type: Type.STRING } }, required: ["icon", "text"] } },
                    locationSummary: { type: Type.STRING },
                    fullReport: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, forecast: { type: Type.STRING }, recommendations: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "forecast", "recommendations"] }
                },
                required: [
                    "headerStats", "profitScenarios", "productAnalysis", "topPicks", "categoryPerformance", "roiProjection", "breakEvenMonth",
                    "categorySummary", "locationRecommendations", "locationSummary", "fullReport"
                ]
            };
            const analysisResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a Vending Machine Financial Analyst and Business Strategist AI for the Malaysian market. Your task is to perform a complete analysis based on the provided machine profile and product list.

**Machine Profile:**
${JSON.stringify(profile, null, 2)}

**Clean Product List:**
${JSON.stringify(extractedProducts, null, 2)}

**Your Combined Task:**
Perform a full quantitative AND qualitative analysis.
1.  **Quantitative Analysis**: Calculate all financial metrics. Crucially, you must use the 'maintenanceFrequency' to determine restocking costs. Assume each restocking trip (based on the frequency) costs RM25 in fuel and labor.
    - Calculate 'monthlyRestockingCost'. (e.g., 'Weekly' = 4 trips/month * RM25 = RM100).
    - Calculate 'avgDailyProfit' and 'avgMonthlyProfit' (This is NET PROFIT after deducting monthly electricity and monthly restocking costs).
    - Also calculate ROI, power cost per day, profit scenarios (for 30%, 60%, 90% daily stock turnover), detailed product margins and performance, top/bottom performers, category profit/slot usage, and a monthly ROI projection until break-even.
2.  **Qualitative Analysis**: Based on the financial results and machine profile (especially location '${profile.location}' and environment '${profile.environment}'), generate all written insights: a category summary, specific location-aware recommendations (with emojis for icons), a location demand summary, and a full professional report (summary, forecast, recommendations).

**Output Rules:**
Return ONLY a single, valid JSON object containing ALL the calculated financial data AND written insights, strictly adhering to the combined schema.`,
                config: { temperature: 0.3, responseMimeType: "application/json", responseSchema: combinedSchema }
            });

            const finalResult: AIVendingAnalysis = JSON.parse(analysisResponse.text);
            setAnalysisResult(finalResult);
            setAnalysisState("complete");

        } catch (error) {
            console.error("Gemini API Error:", error);
            setErrorMessage("An error occurred during AI analysis. The model may be overloaded, or the uploaded file could not be understood. Please try again with a clearer file.");
            setAnalysisState("error");
        }
    }, []);

    const handleReset = () => {
        setAnalysisState("setup");
        setMachineProfile(null);
        setAnalysisResult(null);
        setErrorMessage('');
    };

    const renderContent = () => {
        switch (analysisState) {
            case "setup":
                return (
                    <div className="max-w-4xl mx-auto">
                        <MachineProfileSetup onSubmit={(profile) => {
                            setMachineProfile(profile);
                        }} />
                        {machineProfile && <VendingProductUploader 
                            machineProfile={machineProfile} 
                            onSubmit={handleProfileAndFileSubmit}
                        />}
                    </div>
                );
            case "analyzing":
                return (
                    <AnalysisLoader 
                        title="AI Menganalisis Perniagaan Vending Anda..."
                        steps={[
                            "Langkah 1: Membaca & membersihkan fail produk...",
                            "Langkah 2: Menjalankan analisis kewangan & strategik...",
                            "Menyusun papan pemuka..."
                        ]}
                    />
                );
            case "complete":
                return analysisResult && machineProfile ? (
                    <AnalysisDisplay 
                        analysisResult={analysisResult} 
                        machineProfile={machineProfile}
                        onReset={handleReset}
                        companyInfo={companyInfo}
                    />
                ) : null;
            case "error":
                return (
                     <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-red-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-brand-red">Analysis Failed</h2>
                        <p className="text-gray-600 mt-2 max-w-md">{errorMessage}</p>
                        <button onClick={handleReset} className="mt-6 px-6 py-2 bg-brand-red text-white font-semibold rounded-md">
                            Start Over
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="p-4 md:p-8 space-y-6 bg-brand-bg min-h-full">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center space-x-3">
                    <VendingMachineIcon className="w-8 h-8 text-brand-red" />
                    <div>
                        <h1 className="text-3xl font-bold text-brand-text">AI Smart Vending Analysis</h1>
                        <p className="text-sm text-gray-500">Profitability Simulation & Business Intelligence Dashboard</p>
                    </div>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default SmartVendDashboard;