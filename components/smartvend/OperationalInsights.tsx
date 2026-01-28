import React from 'react';
import { AIVendingAnalysis, MachineProfile } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { MinusIcon } from '../icons/MinusIcon';

interface OperationalInsightsProps {
    headerStats: AIVendingAnalysis['headerStats'];
    machineProfile: MachineProfile;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', '');

const OperationalInsights: React.FC<OperationalInsightsProps> = ({ headerStats, machineProfile }) => {
    
    // Gross profit is based on avg daily profit (which is calculated on 60% turnover by the AI) times 30 days.
    const grossMonthlyProfit = headerStats.avgDailyProfit * 30 + machineProfile.monthlyElectricityCost + headerStats.monthlyRestockingCost;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-text mb-4">Monthly Profit Breakdown</h3>
            <div className="space-y-3 text-sm">
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                    <div className="flex items-center space-x-2">
                        <PlusIcon className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Avg. Gross Monthly Profit</span>
                    </div>
                    <span className="font-semibold text-green-800">RM {formatCurrency(grossMonthlyProfit)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                    <div className="flex items-center space-x-2">
                         <MinusIcon className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Monthly Electricity Cost</span>
                    </div>
                    <span className="font-semibold text-red-800">RM {formatCurrency(machineProfile.monthlyElectricityCost)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                     <div className="flex items-center space-x-2">
                         <MinusIcon className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Monthly Restocking Cost</span>
                    </div>
                    <span className="font-semibold text-red-800">RM {formatCurrency(headerStats.monthlyRestockingCost)}</span>
                </div>
                
                <div className="border-t my-2"></div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <span className="font-bold text-lg text-blue-800">Est. Net Monthly Profit</span>
                    <span className="font-bold text-lg text-blue-800">RM {formatCurrency(headerStats.avgMonthlyProfit)}</span>
                </div>

            </div>
        </div>
    );
};

export default OperationalInsights;