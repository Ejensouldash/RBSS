
import React, { useState, useMemo } from 'react';
import { Quotation, CompanyInfo, QuotationStatus } from '../types';
import QuotationTable from './QuotationTable';
import { PlusIcon } from './icons/PlusIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ClockIcon } from './icons/ClockIcon';

interface DashboardProps {
    quotations: Quotation[];
    onAddNew: () => void;
    onEdit: (quotation: Quotation) => void;
    onView: (quotation: Quotation) => void;
    onStartProject: (quotation: Quotation) => void;
    onStatusChange: (id: string, status: QuotationStatus) => void;
    companyInfo: CompanyInfo;
}

const LicenseStatusCard: React.FC<{ label: string; expiryDate?: string }> = ({ label, expiryDate }) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    let statusColor = "bg-green-100 text-green-800 border-green-200";
    let icon = <CheckBadgeIcon className="w-5 h-5 text-green-600" />;
    
    if (daysLeft < 0) {
        statusColor = "bg-red-100 text-red-800 border-red-200";
        icon = <span className="text-xl">⚠️</span>;
    } else if (daysLeft < 90) {
        statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
        icon = <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${statusColor}`}>
            <div>
                <p className="text-xs font-bold uppercase">{label}</p>
                <p className="text-sm font-semibold">{expiryDate} ({daysLeft > 0 ? `${daysLeft} days left` : 'EXPIRED'})</p>
            </div>
            {icon}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ quotations, onAddNew, onEdit, onView, onStartProject, onStatusChange, companyInfo }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuotations = useMemo(() => {
        if (!searchTerm) {
            return quotations;
        }
        return quotations.filter(q => 
            q.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [quotations, searchTerm]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Compliance Intelligence Header */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Compliance Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <LicenseStatusCard label="SSM Registration" expiryDate={companyInfo.ssmExpiry} />
                    <LicenseStatusCard label="CIDB License" expiryDate={companyInfo.cidbExpiry} />
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 text-blue-900 border-blue-200">
                        <div>
                            <p className="text-xs font-bold uppercase">Status Bumiputera</p>
                            <p className="text-sm font-semibold">{companyInfo.pkkStatus ? 'Active' : 'Not Set'}</p>
                        </div>
                        <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-brand-text">Quotation Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search by client or quotation no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
                    />
                     <button 
                        onClick={onAddNew}
                        className="flex items-center justify-center space-x-2 bg-brand-gold text-brand-black font-bold py-2 px-4 rounded-md shadow-md hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>New Quotation</span>
                    </button>
                </div>
            </div>
            
            <QuotationTable 
                quotations={filteredQuotations} 
                onEdit={onEdit} 
                onView={onView}
                onStartProject={onStartProject}
                onStatusChange={onStatusChange}
                companyInfo={companyInfo}
            />
        </div>
    );
};

export default Dashboard;
