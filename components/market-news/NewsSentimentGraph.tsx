import React, { useMemo } from 'react';
import { NewsArticle } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NewsSentimentGraphProps {
    articles: NewsArticle[];
}

const NewsSentimentGraph: React.FC<NewsSentimentGraphProps> = ({ articles }) => {
    const sentimentData = useMemo(() => {
        const sentimentByDate: Record<string, { Positive: number; Negative: number; Neutral: number }> = {};

        articles.forEach(article => {
            const date = new Date(article.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            if (!sentimentByDate[date]) {
                sentimentByDate[date] = { Positive: 0, Negative: 0, Neutral: 0 };
            }
            sentimentByDate[date][article.impactScore]++;
        });
        
        return Object.entries(sentimentByDate)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => {
                const dateA = a.date.split(' ').reverse().join('-');
                const dateB = b.date.split(' ').reverse().join('-');
                return new Date(dateA).getTime() - new Date(dateB).getTime()
            });

    }, [articles]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-80">
            <h3 className="text-lg font-bold text-brand-text mb-4">Market Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} angle={-45} textAnchor="end" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '20px' }}/>
                    <Bar dataKey="Positive" stackId="a" fill="#10B981" name="Positive" />
                    <Bar dataKey="Negative" stackId="a" fill="#EF4444" name="Negative" />
                    <Bar dataKey="Neutral" stackId="a" fill="#A1A1AA" name="Neutral" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default NewsSentimentGraph;