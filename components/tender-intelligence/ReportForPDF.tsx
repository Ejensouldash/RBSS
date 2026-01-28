import React from 'react';
import { TenderIntelligenceResult } from '../../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell,
    ComposedChart, Area
} from 'recharts';

interface ReportForPDFProps {
    analysisResult: TenderIntelligenceResult;
}

const formatCurrency = (amount: number, digits = 0) => `RM ${amount.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const ReportForPDF: React.FC<ReportForPDFProps> = ({ analysisResult }) => {
    const { summary, pricingAnalysis, profitability, competitiveness, marketForecast } = analysisResult;
    const radarData = summary.feasibilityRadar.map(d => ({ ...d, fullMark: 100 }));

    return (
        <div className="p-4 bg-white font-sans">
            <h2 className="text-xl font-bold text-center mb-6">Visual Analysis Summary</h2>
            <div className="grid grid-cols-2 gap-8">
                
                {/* Feasibility Radar Chart */}
                <div className="chart-container">
                    <h3 className="chart-title">Feasibility Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <Radar name="Score" dataKey="value" stroke="#D2042D" fill="#D2042D" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Cost Breakdown Pie Chart */}
                <div className="chart-container">
                    <h3 className="chart-title">Cost Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={profitability.costBreakdownChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {profitability.costBreakdownChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#FFD700', '#D2042D', '#000000'][index % 3]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Price Comparison Bar Chart */}
                <div className="chart-container col-span-2">
                    <h3 className="chart-title">Market Price vs. Suggested Price</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pricingAnalysis.priceComparisonChartData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis tickFormatter={(val: number) => `RM${val / 1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="marketPrice" name="Market Avg" fill="#8884d8" />
                            <Bar dataKey="suggestedPrice" name="Suggested" fill="#FFD700" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Profit Simulation Chart */}
                <div className="chart-container">
                    <h3 className="chart-title">Profit vs. Sales Simulation</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={profitability.profitSimulationChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="turnoverPercent" unit="%" />
                            <YAxis tickFormatter={(val: number) => `RM${val / 1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Area type="monotone" dataKey="sales" name="Sales" fill="#8884d8" stroke="#8884d8" />
                            <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#FFD700" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Market Forecast Chart */}
                <div className="chart-container">
                    <h3 className="chart-title">Market Forecast</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={marketForecast.priceTrendProjection}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="trend" name="Price Trend" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>
            <style>{`
                .chart-container {
                    border: 1px solid #eee;
                    padding: 1rem;
                    border-radius: 8px;
                    background: #f9f9f9;
                }
                .chart-title {
                    font-size: 1rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
};

export default ReportForPDF;