import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import InvoiceTable from './InvoiceTable';

interface InvoiceDashboardProps {
    invoices: Invoice[];
    onView: (invoice: Invoice) => void;
    onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ invoices, onView, onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = useMemo(() => {
        if (!searchTerm) {
            return invoices;
        }
        return invoices.filter(i => 
            i.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [invoices, searchTerm]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-brand-text">Invoice Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search by client or invoice no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
                    />
                </div>
            </div>
            
            <InvoiceTable 
                invoices={filteredInvoices} 
                onView={onView}
                onUpdateStatus={onUpdateStatus}
            />
        </div>
    );
};

export default InvoiceDashboard;
