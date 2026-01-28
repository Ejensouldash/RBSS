import React from 'react';

interface RegionPriceTableProps {
    data: { region: string; price: number }[];
    unit: string;
}

const RegionPriceTable: React.FC<RegionPriceTableProps> = ({ data, unit }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-brand-text mb-4">Regional Price Comparison</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                            <th className="text-left p-3 text-xs text-gray-600 uppercase font-semibold">Region</th>
                            <th className="text-right p-3 text-xs text-gray-600 uppercase font-semibold">Average Price ({unit})</th>
                        </tr>
                    </thead>
                    <tbody className="text-brand-text">
                        {data.map((item, index) => (
                             <tr key={item.region} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="p-3 font-medium">{item.region}</td>
                                <td className="text-right p-3 font-semibold">RM {item.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegionPriceTable;
