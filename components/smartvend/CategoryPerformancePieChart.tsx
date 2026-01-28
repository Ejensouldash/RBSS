import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryPerformance } from '../../types';

interface CategoryPerformancePieChartProps {
    data: CategoryPerformance[];
    summary: string;
}

const COLORS = ['#FFD700', '#D2042D', '#000000', '#8884d8', '#82ca9d'];

const CategoryPerformancePieChart: React.FC<CategoryPerformancePieChartProps> = ({ data, summary }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-text mb-2">Category Performance (by Profit)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="profit"
                            nameKey="category"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `RM ${value.toFixed(2)}`} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-gray-50 p-3 rounded-md border text-sm text-gray-700">
                <span className="font-bold">AI Summary: </span>{summary}
            </div>
        </div>
    );
};

export default CategoryPerformancePieChart;
