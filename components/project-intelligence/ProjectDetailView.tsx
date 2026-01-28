import React, { useState } from 'react';
import { AIProject, ProjectFile } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { DashboardIcon } from '../icons/DashboardIcon';
import { BanknotesIcon } from '../icons/BanknotesIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';
import { ChartTrendingUpIcon } from '../icons/ChartTrendingUpIcon';
import { LightBulbIcon } from '../icons/LightBulbIcon';
import { ChatBubbleOvalLeftEllipsisIcon } from '../icons/ChatBubbleOvalLeftEllipsisIcon';
import { ClipboardDocumentIcon } from '../icons/ClipboardDocumentIcon';

interface ProjectDetailViewProps {
    project: AIProject;
    onBack: () => void;
}

const TABS = [
    { name: 'Overview', icon: DashboardIcon },
    { name: 'Financials', icon: BanknotesIcon },
    { name: 'Documents', icon: ArchiveBoxIcon },
    { name: 'AI Summary', icon: BrainCircuitIcon },
    { name: 'Performance', icon: ChartTrendingUpIcon },
    { name: 'Recommendations', icon: LightBulbIcon },
    { name: 'Chat', icon: ChatBubbleOvalLeftEllipsisIcon },
    { name: 'Export', icon: ClipboardDocumentIcon },
];

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack }) => {
    const [activeTab, setActiveTab] = useState(TABS[0].name);

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/80 p-6 space-y-4 fade-in-up">
            <header className="flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-red">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to All Projects
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-brand-text">{project.projectName}</h1>
                    <p className="text-sm text-brand-red font-semibold">{project.projectCode}</p>
                </div>
            </header>

            <div className="flex border-b border-gray-200">
                {TABS.map(tab => (
                    <button 
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.name ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-text'}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.name}
                    </button>
                ))}
            </div>
            
            <main className="min-h-[60vh] p-4">
                {activeTab === 'Overview' && <OverviewTab project={project} />}
                {activeTab === 'Financials' && <FinancialsTab project={project} />}
                {activeTab === 'Documents' && <DocumentsTab files={project.files} />}
                {activeTab === 'AI Summary' && <div>AI Summary Content...</div>}
                {activeTab === 'Performance' && <PerformanceTab project={project} />}
                {activeTab === 'Recommendations' && <RecommendationsTab project={project} />}
                {activeTab === 'Chat' && <div>Project Chat...</div>}
                {activeTab === 'Export' && <div>Export & Report...</div>}
            </main>
        </div>
    );
};

// --- TAB SUB-COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => (
    <div className={`bg-white/50 p-6 rounded-xl shadow-md border border-gray-200/50 ${className}`}>
        {title && <h3 className="text-lg font-bold text-brand-text mb-4">{title}</h3>}
        {children}
    </div>
);

const KPICard: React.FC<{ title: string; value: string; color: string; }> = ({ title, value, color }) => (
    <div className="p-4 bg-gray-50 rounded-lg text-center border-l-4" style={{ borderColor: color }}>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
);

const OverviewTab: React.FC<{ project: AIProject }> = ({ project }) => {
    const { overview } = project.insights;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard title="Total Cost" value={formatCurrency(overview.totalCost).replace(/\.00$/, '')} color="#D2042D" />
                    <KPICard title="Revenue" value={formatCurrency(overview.totalRevenue).replace(/\.00$/, '')} color="#16a34a" />
                    <KPICard title="Net Profit" value={formatCurrency(overview.netProfit).replace(/\.00$/, '')} color={overview.netProfit >= 0 ? "#16a34a" : "#D2042D"} />
                    <KPICard title="Progress" value={`${overview.progressPercent}%`} color="#ca8a04" />
                </div>
                <Card title="AI Project Summary">
                    <p className="text-sm text-gray-700">{overview.summary}</p>
                </Card>
                <Card title="AI Verdict">
                     <p className="text-sm font-semibold text-gray-800">{overview.aiVerdict}</p>
                </Card>
            </div>
            <Card title="Project Timeline">
                <ul className="space-y-4">
                    {overview.timeline.map((item, index) => (
                         <li key={index} className="flex items-start">
                             <div className="flex-shrink-0 w-3 h-3 bg-brand-red rounded-full mt-1.5 mr-3"></div>
                             <div>
                                <p className="font-semibold text-sm">{item.event}</p>
                                <p className="text-xs text-gray-500">{item.date}</p>
                             </div>
                         </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

const FinancialsTab: React.FC<{ project: AIProject }> = ({ project }) => {
    const { financial } = project.insights;
    const PIE_COLORS = ['#FFD700', '#D2042D', '#000000', '#8884d8', '#82ca9d'];
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cost by Category">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financial.costByCategory} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(val) => `RM${val / 1000}k`} />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" fill="#D2042D" name="Cost" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
             <Card title="Spend by Vendor">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={financial.spendByVendor} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                             {financial.spendByVendor.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Expense Over Time" className="lg:col-span-2">
                 <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={financial.expenseOverTime}>
                         <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(val) => `RM${val / 1000}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area type="monotone" dataKey="amount" stroke="#FFD700" fill="#FFD700" fillOpacity={0.3} name="Expenses" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const DocumentsTab: React.FC<{ files: ProjectFile[] }> = ({ files }) => {
    return (
        <Card title="All Project Documents">
            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="text-left bg-gray-50">
                        <tr>
                            <th className="p-3">File Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">AI Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-semibold">{file.fileName}</td>
                                <td className="p-3">{file.category}</td>
                                <td className="p-3">{file.uploadDate}</td>
                                <td className="p-3">{file.extractedData.totalAmount ? formatCurrency(file.extractedData.totalAmount) : '-'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                        file.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                        file.status === 'Anomaly' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {file.status}
                                    </span>
                                </td>
                                <td className="p-3 text-xs text-gray-600">{file.summary}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </Card>
    );
}

const PerformanceTab: React.FC<{ project: AIProject }> = ({ project }) => {
    const { performance } = project.insights;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Key Performance Indicators">
                <div className="space-y-4">
                    <KPICard title="Budget Accuracy" value={`${performance.budgetAccuracy}%`} color="#16a34a" />
                    <KPICard title="Time Deviation" value={`${performance.timeDeviationDays} days`} color={performance.timeDeviationDays <= 0 ? "#16a34a" : "#ca8a04"} />
                    <KPICard title="Est. ROI" value={`${performance.roiMonths} mths`} color="#0ea5e9" />
                </div>
            </Card>
            <Card title="AI Performance Verdict">
                 <p className="text-sm text-gray-700">{performance.aiVerdict}</p>
            </Card>
        </div>
    );
};

const RecommendationsTab: React.FC<{ project: AIProject }> = ({ project }) => {
    const { recommendations } = project.insights;
    return (
        <Card title="AI Insights & Recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50/50 rounded-lg border border-yellow-200">
                        <span className="text-xl mt-1">{rec.icon}</span>
                        <p className="text-sm text-yellow-900">{rec.text}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ProjectDetailView;