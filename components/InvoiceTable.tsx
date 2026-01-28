import React from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { EyeIcon } from './icons/EyeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const statusColorMap: Record<InvoiceStatus, string> = {
  Draft: 'bg-gray-200 text-gray-800',
  Sent: 'bg-blue-200 text-blue-800',
  Paid: 'bg-green-200 text-green-800',
  Overdue: 'bg-red-200 text-red-800',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM');
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onView, onUpdateStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Invoice No</th>
              <th scope="col" className="px-6 py-3">Client Name</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Due Date</th>
              <th scope="col" className="px-6 py-3 text-right">Total (RM)</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50 transition-colors duration-200">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {invoice.invoiceNo}
                </th>
                <td className="px-6 py-4">{invoice.client.name}</td>
                <td className="px-6 py-4">{invoice.date}</td>
                <td className="px-6 py-4">{invoice.dueDate}</td>
                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(invoice.totalValue)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorMap[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center items-center space-x-2">
                  <button onClick={() => onView(invoice)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200" title="View">
                    <EyeIcon />
                  </button>
                  {invoice.status !== 'Paid' && (
                    <button onClick={() => onUpdateStatus(invoice.id, 'Paid')} className="text-green-600 hover:text-green-800 transition-colors duration-200" title="Mark as Paid">
                      <CheckCircleIcon />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;
