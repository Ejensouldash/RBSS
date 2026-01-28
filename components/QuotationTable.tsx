
import React from 'react';
import { Quotation, QuotationStatus, CompanyInfo } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { EyeIcon } from './icons/EyeIcon';
import { RocketIcon } from './icons/RocketIcon';
import { PrinterIcon } from './icons/PrinterIcon';

interface QuotationTableProps {
  quotations: Quotation[];
  onEdit: (quotation: Quotation) => void;
  onView: (quotation: Quotation) => void;
  onStartProject: (quotation: Quotation) => void;
  onStatusChange: (id: string, status: QuotationStatus) => void;
  companyInfo: CompanyInfo;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM');
};

const QuotationTable: React.FC<QuotationTableProps> = ({ quotations, onEdit, onView, onStartProject, onStatusChange, companyInfo }) => {
    
  const calculateTotal = (quotation: Quotation): number => {
      const subtotal = quotation.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const taxRate = companyInfo.taxRate / 100;
      return subtotal * (1 + taxRate);
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-300';
          case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-300';
          case 'Approved': return 'bg-green-100 text-green-800 border-green-300';
          case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
          default: return 'bg-gray-100 text-gray-800';
      }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3 font-bold">Quotation No</th>
              <th scope="col" className="px-6 py-3 font-bold">Client Name</th>
              <th scope="col" className="px-6 py-3 font-bold">Date</th>
              <th scope="col" className="px-6 py-3 text-right font-bold">Total (RM)</th>
              <th scope="col" className="px-6 py-3 text-center font-bold">Status</th>
              <th scope="col" className="px-6 py-3 text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="bg-white hover:bg-yellow-50 transition-colors duration-150">
                <th scope="row" className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                  {quotation.quotationNo}
                </th>
                <td className="px-6 py-4 text-gray-700">{quotation.client.name}</td>
                <td className="px-6 py-4 text-gray-500">{quotation.date}</td>
                <td className="px-6 py-4 text-right font-bold text-brand-black">{formatCurrency(calculateTotal(quotation))}</td>
                <td className="px-6 py-4 text-center">
                  <select 
                    value={quotation.status} 
                    onChange={(e) => onStatusChange(quotation.id, e.target.value as QuotationStatus)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer ${getStatusColor(quotation.status)}`}
                  >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 flex justify-center items-center space-x-3">
                  <button onClick={() => onView(quotation)} className="text-gray-500 hover:text-brand-red transition-colors duration-200 tooltip" title="View PDF / BQ">
                    <PrinterIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => onEdit(quotation)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200" title="Edit">
                    <PencilIcon />
                  </button>
                  {quotation.status === 'Approved' && (
                    <button onClick={() => onStartProject(quotation)} className="text-purple-600 hover:text-purple-900 transition-colors duration-200" title="Convert to Project">
                        <RocketIcon />
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

export default QuotationTable;
