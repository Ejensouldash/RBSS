import React from 'react';
import { VendingProductAnalysis } from '../../types';

interface ProductProfitabilityTableProps {
    products: VendingProductAnalysis[];
    topPicks: {
        highestMargin: { name: string, value: number };
        lowestPerformer: { name: string, value: number };
    }
}

const performanceConfig = {
    Excellent: 'bg-green-100 text-green-800',
    Good: 'bg-blue-100 text-blue-800',
    Low: 'bg-yellow-100 text-yellow-800',
    Poor: 'bg-red-100 text-red-800',
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', '');

const ProductProfitabilityTable: React.FC<ProductProfitabilityTableProps> = ({ products, topPicks }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-text mb-4">Product Profitability Analysis</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-brand-text">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Product</th>
                            <th scope="col" className="px-4 py-3 text-center">Cost (RM)</th>
                            <th scope="col" className="px-4 py-3 text-center">Sell (RM)</th>
                            <th scope="col" className="px-4 py-3 text-center">Margin</th>
                            <th scope="col" className="px-4 py-3 text-center">Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{product.productName}</td>
                                <td className="px-4 py-3 text-center">{formatCurrency(product.costPrice)}</td>
                                <td className="px-4 py-3 text-center">{formatCurrency(product.sellPrice)}</td>
                                <td className="px-4 py-3 text-center font-semibold">
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div className="bg-brand-gold h-4 rounded-full text-xs text-black flex items-center justify-center" style={{ width: `${Math.min(product.margin, 100)}%` }}>
                                            {product.margin.toFixed(0)}%
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${performanceConfig[product.performance]}`}>
                                        {product.performance}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    🏆 <span className="font-bold">Highest Margin:</span> {topPicks.highestMargin.name} ({topPicks.highestMargin.value.toFixed(0)}%)
                </div>
                 <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    ⚠️ <span className="font-bold">Low Performer:</span> {topPicks.lowestPerformer.name} ({topPicks.lowestPerformer.value.toFixed(0)}%) – Consider removal.
                </div>
            </div>
        </div>
    );
};

export default ProductProfitabilityTable;
