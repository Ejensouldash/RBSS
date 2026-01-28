import React, { useState, useMemo } from 'react';
import { MaterialIntelligenceData } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';

interface LiveChartProps {
    data: MaterialIntelligenceData;
}

const calculateMovingAverage = (data: {price: number}[], windowSize: number) => {
    const sma = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
        const window = data.slice(i, i + windowSize);
        const sum = window.reduce((acc, val) => acc + val.price, 0);
        sma.push(sum / windowSize);
    }
    return sma;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-black bg-opacity-80 text-white p-3 rounded-md border border-brand-gold shadow-lg">
        <p className="font-bold">{`Date: ${label}`}</p>
        <p className="text-sm">{`Price: RM ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const LiveChart: React.FC<LiveChartProps> = ({ data }) => {
    const [timeRange, setTimeRange] = useState<string>('YTD'); // 30D, 90D, YTD

    const chartData = useMemo(() => {
        let historical = data.historicalData;
        if (timeRange === '30D') {
            historical = data.historicalData.slice(-30);
        } else if (timeRange === '90D') {
            historical = data.historicalData.slice(-90);
        }
        // For 'YTD', we use the full historical data array provided.

        const sma7 = calculateMovingAverage(historical, 7);
        
        return historical.map((point, index) => ({
            date: new Date(point.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            price: point.price,
            sma7: index >= 6 ? sma7[index - 6] : null,
        }));
    }, [data.historicalData, timeRange]);
    
    const lastHistoricalPoint = chartData[chartData.length - 1];
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + 7);

    const forecastData = lastHistoricalPoint ? [
        { date: lastHistoricalPoint.date, price: lastHistoricalPoint.price },
        { date: forecastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), price: (data.forecast.next7Days.low + data.forecast.next7Days.high) / 2 }
    ] : [];

    const yDomain = useMemo(() => {
        if (chartData.length === 0) return [0, 100];
        const prices = chartData.map(p => p.price);
        const min = Math.min(...prices) * 0.98;
        const max = Math.max(...prices) * 1.02;
        return [min, max];
    }, [chartData]);


    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-700 h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-semibold text-white">Live Price Trend: <span className="text-brand-gold">{data.materialName}</span></h2>
                 <div className="flex space-x-1 bg-gray-800 p-1 rounded-md">
                     {[
                         { label: '30D', value: '30D' },
                         { label: '90D', value: '90D' },
                         { label: 'YTD', value: 'YTD' }
                     ].map(range => (
                         <button 
                            key={range.value} 
                            onClick={() => setTimeRange(range.value)}
                            className={`px-3 py-1 text-xs font-medium rounded ${timeRange === range.value ? 'bg-brand-gold text-brand-black' : 'text-gray-400 hover:bg-gray-700'}`}
                         >{range.label}</button>
                     ))}
                 </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tick={{ fill: '#A0AEC0' }} />
                    <YAxis stroke="#A0AEC0" fontSize={12} domain={yDomain} tickFormatter={(value) => `RM ${value.toFixed(2)}`} tick={{ fill: '#A0AEC0' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>

                    <Line type="monotone" dataKey="price" stroke="#FFD700" strokeWidth={2} dot={false} name="Daily Price" />
                    <Line type="monotone" dataKey="sma7" stroke="#D2042D" strokeWidth={1} dot={false} name="7-Day Avg" strokeOpacity={0.7}/>
                    
                    {forecastData.length > 0 && (
                        <>
                            <Line data={forecastData} type="monotone" dataKey="price" stroke="#38B2AC" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="7-Day Forecast" />
                            <ReferenceArea x1={forecastData[0].date} x2={forecastData[1].date} y1={data.forecast.next7Days.low} y2={data.forecast.next7Days.high} stroke="none" fill="#38B2AC" fillOpacity={0.1} />
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LiveChart;