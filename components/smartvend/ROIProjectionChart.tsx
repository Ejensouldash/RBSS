import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { ROIProjectionPoint } from '../../types';

interface ROIProjectionChartProps {
    data: ROIProjectionPoint[];
    breakEvenMonth: number;
    machineCost: number;
}

const ROIProjectionChart: React.FC<ROIProjectionChartProps> = ({ data, breakEvenMonth, machineCost }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-96">
             <h3 className="text-lg font-bold text-brand-text mb-4">ROI Projection</h3>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -15 }} />
                    <YAxis tickFormatter={(value) => `RM ${value / 1000}k`} />
                    <Tooltip formatter={(value: number) => `RM ${value.toFixed(2)}`} />
                    <Area type="monotone" dataKey="cumulativeProfit" stroke="#D2042D" fill="#D2042D" fillOpacity={0.2} name="Cumulative Profit" />
                    <ReferenceLine y={machineCost} stroke="#000000" strokeDasharray="3 3">
                        <Label value="Machine Cost" position="insideTopLeft" fill="#000000" fontSize={12} />
                    </ReferenceLine>
                    <ReferenceLine x={breakEvenMonth} stroke="#FFD700" strokeWidth={2}>
                        <Label value={`Break-even: ${breakEvenMonth.toFixed(1)} months`} angle={-90} position="insideLeft" fill="#000000" fontSize={12} fontWeight="bold" offset={10}/>
                    </ReferenceLine>
                </AreaChart>
             </ResponsiveContainer>
        </div>
    );
};

export default ROIProjectionChart;