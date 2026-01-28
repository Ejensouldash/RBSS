import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MaterialSelector from './material-intelligence/MaterialSelector';
import LiveChart from './material-intelligence/LiveChart';
import AIInsightCard from './material-intelligence/AIInsightCard';
import ForecastPanel from './material-intelligence/ForecastPanel';
import RegionPriceTable from './material-intelligence/RegionPriceTable';
import PriceIndicator from './material-intelligence/PriceIndicator';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { MaterialIntelligenceData, MaterialPriceSummary } from '../types';

const MATERIALS = [
    "Simen Portland (50kg bag)",
    "Pasir Halus (per tan)",
    "Batu Baur 3/4\" (per tan)",
    "Besi Tetulang Y12 (per tan)",
    "Bata Merah (Clay Brick, per 1000 pcs)",
    "Papan Lapis 12mm (Plywood 4'x8', per sheet)",
    "Cat Emulsi (Emulsion Paint, 5L)",
    "Atap Genting Konkrit (Concrete Roof Tile, per piece)",
    "Bitumen (per tan)",
    "Diesel (per liter)"
];

const MaterialPriceDashboard: React.FC = () => {
    const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0]);
    const [allMaterialData, setAllMaterialData] = useState<Record<string, MaterialIntelligenceData>>({});
    const [isPrefetching, setIsPrefetching] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const fetchMaterialData = useCallback(async (materialName: string): Promise<MaterialIntelligenceData> => {
        const schema = {
            type: Type.OBJECT,
            properties: {
                materialName: { type: Type.STRING },
                unit: { type: Type.STRING },
                currentPrice: {
                    type: Type.OBJECT, properties: {
                        value: { type: Type.NUMBER },
                        changePercent24h: { type: Type.NUMBER }
                    }, required: ['value', 'changePercent24h']
                },
                historicalData: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            date: { type: Type.STRING },
                            price: { type: Type.NUMBER }
                        }, required: ['date', 'price']
                    }
                },
                forecast: {
                    type: Type.OBJECT, properties: {
                        next7Days: {
                            type: Type.OBJECT, properties: {
                                low: { type: Type.NUMBER },
                                high: { type: Type.NUMBER },
                                trend: { type: Type.STRING, enum: ['uptrend', 'downtrend', 'stable'] }
                            }, required: ['low', 'high', 'trend']
                        },
                        probabilityPercent: { type: Type.NUMBER }
                    }, required: ['next7Days', 'probabilityPercent']
                },
                aiInsight: { type: Type.STRING },
                aiReasoning: { type: Type.STRING },
                regionalPrices: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            region: { type: Type.STRING },
                            price: { type: Type.NUMBER }
                        }, required: ['region', 'price']
                    }
                }
            },
            required: ["materialName", "unit", "currentPrice", "historicalData", "forecast", "aiInsight", "aiReasoning", "regionalPrices"]
        };

        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        const prompt = `Act as a Malaysian construction market analyst AI. Analyze the market for "${materialName}".
        The current date is ${today}.
        Generate a hyper-realistic market data report. Consider all economic factors: global commodity prices, MYR/USD exchange rate, fuel costs, weather, local demand from projects, etc.
        Provide a complete day-by-day historical price analysis starting from January 1, 2024, until the current date (${today}). The dates in historicalData must be sequential and end on today's date.
        Return ONLY a valid JSON object adhering to the specified schema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return JSON.parse(response.text);
    }, []);

    useEffect(() => {
        const prefetchAllMaterials = async () => {
            setIsPrefetching(true);
            setError(null);
            try {
                const promises = MATERIALS.map(name => fetchMaterialData(name));
                const results = await Promise.all(promises);
                
                const dataRecord: Record<string, MaterialIntelligenceData> = {};
                results.forEach((data, index) => {
                    // Use the original material name from the constant array as the key
                    dataRecord[MATERIALS[index]] = data;
                });

                setAllMaterialData(dataRecord);
                setLastUpdated(new Date().toLocaleString('en-GB'));
            } catch (e) {
                console.error(e);
                setError("Gagal memuatkan data pasaran awal. Sila cuba muat semula halaman.");
            } finally {
                setIsPrefetching(false);
            }
        };

        prefetchAllMaterials();
    }, [fetchMaterialData]);
    
    const handleUpdateNow = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            const newData = await fetchMaterialData(selectedMaterial);
            setAllMaterialData(prev => ({
                ...prev,
                [selectedMaterial]: newData,
            }));
            setLastUpdated(new Date().toLocaleString('en-GB'));
        } catch (e) {
            console.error(e);
            setError(`Gagal mengemas kini data untuk ${selectedMaterial}.`);
        } finally {
            setIsRefreshing(false);
        }
    }, [selectedMaterial, fetchMaterialData]);

    const currentMaterialData = allMaterialData[selectedMaterial];
    
    const priceSummaries = useMemo(() => {
        return MATERIALS.slice(0, 4)
            .map(materialName => {
                const data = allMaterialData[materialName];
                if (!data) return null;
                return {
                    materialName: data.materialName,
                    unit: data.unit,
                    currentPrice: data.currentPrice.value,
                    changePercent24h: data.currentPrice.changePercent24h,
                };
            })
            .filter((summary): summary is MaterialPriceSummary => summary !== null);
    }, [allMaterialData]);


    const formatPrice = (price?: number) => {
        if (price === undefined) return 'N/A';
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(price).replace('MYR', 'RM');
    };
    
    const isLoading = isPrefetching || isRefreshing;

    return (
        <div className="p-4 md:p-8 space-y-6 bg-brand-bg min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-8 h-8 text-brand-red" />
                    <div>
                        <h1 className="text-3xl font-bold text-brand-text">AI Material Price Intelligence</h1>
                        <p className="text-sm text-gray-500">Live Market Analysis & Forecasting Dashboard</p>
                    </div>
                </div>
                <div className="text-right mt-2 md:mt-0">
                    <button onClick={handleUpdateNow} className="text-sm bg-brand-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 disabled:opacity-50" disabled={isLoading || isPrefetching}>
                        {isRefreshing ? 'Updating...' : 'Update Now'}
                    </button>
                    {lastUpdated && !isPrefetching && <p className="text-xs text-gray-500 mt-1">Last Updated: {lastUpdated}</p>}
                </div>
            </div>

            {/* Price Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {isPrefetching ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-gray-200 p-4 rounded-lg shadow-md h-[110px] animate-pulse"></div>
                    ))
                ) : (
                    priceSummaries.map(summary => (
                         <PriceIndicator 
                            key={summary.materialName}
                            material={`${summary.materialName} / ${summary.unit}`} 
                            price={formatPrice(summary.currentPrice)} 
                            change={summary.changePercent24h} 
                        />
                    ))
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <MaterialSelector
                        materials={MATERIALS}
                        selectedMaterial={selectedMaterial}
                        onSelectMaterial={setSelectedMaterial}
                        disabled={isPrefetching}
                    />
                    {isPrefetching ? (
                        <div className="bg-white p-6 rounded-lg shadow-md h-[450px] flex flex-col justify-center items-center">
                            <SparklesIcon className="w-12 h-12 text-brand-gold animate-pulse mb-4"/>
                            <p className="text-gray-600 font-semibold">Menganalisis pasaran untuk semua bahan...</p>
                            <p className="text-sm text-gray-500">Ini mungkin mengambil sedikit masa.</p>
                        </div>
                    ) : error && !currentMaterialData ? (
                         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg h-[450px] flex justify-center items-center">
                            <p>{error}</p>
                        </div>
                    ) : currentMaterialData && (
                        <>
                            <LiveChart data={currentMaterialData} />
                            <RegionPriceTable data={currentMaterialData.regionalPrices} unit={currentMaterialData.unit} />
                        </>
                    )}
                </div>

                {/* AI Insights Sidebar */}
                <div className="space-y-6">
                     {isPrefetching ? (
                        <div className="bg-white p-6 rounded-lg shadow-md h-full min-h-[400px] flex flex-col justify-center items-center">
                            <p className="text-gray-500">Loading AI Insights...</p>
                        </div>
                     ) : currentMaterialData && (
                        <>
                           <AIInsightCard insight={currentMaterialData.aiInsight} />
                           <ForecastPanel forecast={currentMaterialData.forecast} reasoning={currentMaterialData.aiReasoning} unit={currentMaterialData.unit} />
                        </>
                     )}
                </div>
            </div>
        </div>
    );
};

export default MaterialPriceDashboard;