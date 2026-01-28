import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { NewsArticle, DailySummary, MarketNewsData, NewsCategory } from '../types';
import { NewsIcon } from './icons/NewsIcon';
import NewsCategoryTabs from './market-news/NewsCategoryTabs';
import DailySummaryPanel from './market-news/DailySummaryPanel';
import NewsCard from './market-news/NewsCard';
import NewsSentimentGraph from './market-news/NewsSentimentGraph';

const ALL_CATEGORIES: NewsCategory[] = ['Fuel & Energy', 'Construction & Materials', 'Economy & Finance', 'Government Projects', 'Global Market Trends'];

const MarketNewsDashboard: React.FC = () => {
    const [marketData, setMarketData] = useState<MarketNewsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<NewsCategory | 'All'>('All');

    const fetchNewsData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const today = new Date().toISOString().split('T')[0];

            const schema = {
                type: Type.OBJECT,
                properties: {
                    articles: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                source: { type: Type.STRING },
                                date: { type: Type.STRING },
                                summary: { type: Type.STRING },
                                aiAnalysis: { type: Type.STRING },
                                category: { type: Type.STRING, enum: ALL_CATEGORIES },
                                impactScore: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                                predictedImpactValue: { type: Type.STRING },
                            },
                            required: ["id", "title", "source", "date", "summary", "aiAnalysis", "category", "impactScore", "predictedImpactValue"]
                        }
                    },
                    dailySummaries: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                date: { type: Type.STRING },
                                summaryPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["date", "summaryPoints"]
                        }
                    }
                },
                required: ["articles", "dailySummaries"]
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Act as a sophisticated AI market analyst for a Malaysian construction firm. Your task is to generate a realistic, simulated digest of recent market news and its impact on the construction industry in Malaysia. Today's date is ${today}.
You must provide your response as a single, valid JSON object that strictly adheres to the provided schema.
The news should be diverse, covering topics like fuel prices (RON95, diesel), raw material costs (steel, cement), major government infrastructure projects (like MRT3), currency fluctuations (MYR vs USD), and global economic trends affecting Malaysia.
For each news article, provide a concise summary and a sharp AI analysis explaining the direct impact on construction costs or strategy. The 'predictedImpactValue' should be a short string like "+2.5%" or "-RM120/tan".
Generate exactly 12 news articles spanning the last 15 days.
Also, generate exactly 7 daily summaries for the past 7 consecutive days, ending today. Each summary should contain 3-4 bullet points of the most critical market movements for that day.`,
                config: {
                    temperature: 0.4,
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            const result: MarketNewsData = JSON.parse(response.text);
            // Sort articles and summaries by date just in case
            result.articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            result.dailySummaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMarketData(result);
        } catch (err) {
            console.error("Failed to fetch market news data:", err);
            setError("Failed to load market intelligence data. The AI system may be under high load. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNewsData();
    }, [fetchNewsData]);

    const filteredArticles = useMemo(() => {
        if (!marketData) return [];
        if (activeCategory === 'All') return marketData.articles;
        return marketData.articles.filter(article => article.category === activeCategory);
    }, [marketData, activeCategory]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <div className="text-center">
                    <NewsIcon className="w-16 h-16 text-brand-red animate-pulse mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-brand-text">Loading Market Intelligence...</h2>
                    <p className="text-gray-500">The AI is analyzing the latest market news.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
                    <h2 className="text-2xl font-bold text-brand-red">Error</h2>
                    <p className="text-gray-600 mt-2">{error}</p>
                    <button onClick={fetchNewsData} className="mt-4 px-6 py-2 bg-brand-red text-white font-semibold rounded-md">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8 space-y-6 bg-brand-bg min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center space-x-3">
                    <NewsIcon className="w-8 h-8 text-brand-red" />
                    <div>
                        <h1 className="text-3xl font-bold text-brand-text">AI Market News Hub</h1>
                        <p className="text-sm text-gray-500">Automated News Analysis for Strategic Decision-Making</p>
                    </div>
                </div>
                <button onClick={fetchNewsData} disabled={isLoading} className="mt-2 md:mt-0 px-4 py-2 bg-brand-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 disabled:opacity-50">
                    {isLoading ? 'Refreshing...' : 'Refresh News'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <NewsCategoryTabs 
                        categories={['All', ...ALL_CATEGORIES]} 
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {filteredArticles.map(article => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    {marketData && marketData.dailySummaries.length > 0 && (
                        <DailySummaryPanel summaries={marketData.dailySummaries} />
                    )}
                    {marketData && marketData.articles.length > 0 && (
                        <NewsSentimentGraph articles={marketData.articles} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketNewsDashboard;