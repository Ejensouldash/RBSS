

import React, { useMemo } from 'react';
import { Quotation, Project, ProjectStatus } from '../types';
import { RevenueIcon } from './icons/RevenueIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ApprovalIcon } from './icons/ApprovalIcon';
import { SentIcon } from './icons/SentIcon';

interface AnalyticsDashboardProps {
    quotations: Quotation[];
    projects: Project[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount).replace('MYR', 'RM');
};

const KPICard: React.FC<{ title: string; value: string; icon: React.FC<{className?: string}>, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-text">{value}</p>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ quotations, projects }) => {
    
    const analytics = useMemo(() => {
        const totalRevenue = projects
            .filter(p => p.status === 'Completed')
            .reduce((sum, p) => sum + p.totalValue, 0);

        const activeProjects = projects.filter(p => p.status === 'In Progress').length;

        const sentQuotations = quotations.filter(q => q.status !== 'Draft').length;

        const approvedQuotations = quotations.filter(q => q.status === 'Approved').length;
        
        const approvalRate = sentQuotations > 0 ? (approvedQuotations / sentQuotations) * 100 : 0;

        const projectStatusCounts = projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<ProjectStatus, number>);

        return {
            totalRevenue,
            activeProjects,
            sentQuotations,
            approvalRate,
            projectStatusCounts,
            totalProjects: projects.length,
        };
    }, [quotations, projects]);

    const statusColors: Record<ProjectStatus, string> = {
        'In Progress': 'bg-yellow-500',
        'Completed': 'bg-green-500',
        'On Hold': 'bg-red-500',
    }

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-50/50">
            <h1 className="text-3xl font-bold text-brand-text">Analytics Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Revenue" value={formatCurrency(analytics.totalRevenue)} icon={RevenueIcon} color="bg-green-500" />
                <KPICard title="Active Projects" value={String(analytics.activeProjects)} icon={BriefcaseIcon} color="bg-blue-500" />
                <KPICard title="Approval Rate" value={`${analytics.approvalRate.toFixed(1)}%`} icon={ApprovalIcon} color="bg-purple-500" />
                <KPICard title="Quotations Sent" value={String(analytics.sentQuotations)} icon={SentIcon} color="bg-yellow-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Sales Trend - Taking more space */}
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-brand-text mb-4">Sales Trend (Mock)</h2>
                    <div className="h-64 flex items-end justify-around bg-gray-50 p-4 rounded-md">
                       {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => (
                           <div key={month} className="flex flex-col items-center">
                               <div 
                                 className="w-8 md:w-10 bg-blue-400 rounded-t-md hover:bg-brand-red transition-colors"
                                 style={{ height: `${month === 'Jul' ? '80%' : (Math.random() * 50 + 10)}%`}}
                                 title={`${month}: RM ${month === 'Jul' ? '30,000' : '10,000'}`}
                                ></div>
                               <span className="text-xs mt-2 text-gray-500">{month}</span>
                           </div>
                       ))}
                    </div>
                     <p className="text-xs text-gray-400 mt-2 text-center">Note: This is a visual representation with mock data for months Jan-Jun.</p>
                </div>

                {/* Project Status */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <h2 className="text-lg font-semibold text-brand-text mb-4">Project Status Breakdown</h2>
                     <div className="space-y-4 mt-6">
                        {(Object.keys(analytics.projectStatusCounts) as Array<keyof typeof analytics.projectStatusCounts>).map((status) => {
                            const count = analytics.projectStatusCounts[status];
                            const percentage = analytics.totalProjects > 0 ? (count / analytics.totalProjects) * 100 : 0;
                            return (
                                <div key={status}>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium text-gray-600">{status}</span>
                                        <span className="text-gray-500">{count} Project(s)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className={`${statusColors[status] || 'bg-gray-500'} h-2.5 rounded-full`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;