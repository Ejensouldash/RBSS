import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { ProfitScenario } from '../../types';

interface ProfitScenarioChartProps {
    data: ProfitScenario[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-black bg-opacity-80 text-white p-3 rounded-md border border-brand-gold shadow-lg text-sm">
          <p className="font-bold">{`Turnover: ${label}%`}</p>
          <p style={{ color: '#FFD700' }}>{`Sales: RM ${payload[1].value.toFixed(2)}`}</p>
          <p style={{ color: '#8884d8' }}>{`Net Profit: RM ${payload[0].value.toFixed(2)}`}</p>
          <p className="text-xs text-gray-300">{`Margin: ${((payload[0].value / payload[1].value) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
};

const ProfitScenarioChart: React.FC<ProfitScenarioChartProps> = ({ data }) => {
    const chartData = data.map(scenario => ({
        name: `${scenario.turnover}%`,
        'Net Profit': scenario.netProfit,
        'Sales': scenario.sales,
    }));
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-80">
            <h3 className="text-lg font-bold text-brand-text">Sales & Profit Simulation (Daily)</h3>
            <p className="text-xs text-gray-500 mb-4">Simulasi keuntungan bersih harian berdasarkan peratusan stok yang terjual.</p>
            <ResponsiveContainer width="100%" height="calc(100% - 36px)">
                <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `RM${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Net Profit" fill="#8884d8" barSize={40}/>
                    <Line type="monotone" dataKey="Sales" stroke="#FFD700" strokeWidth={2} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProfitScenarioChart;