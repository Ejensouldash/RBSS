import React from 'react';
import { ServiceItem } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ServiceTableProps {
  services: ServiceItem[];
  onEdit: (service: ServiceItem) => void;
  onDelete: (serviceId: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM');
};

const ServiceTable: React.FC<ServiceTableProps> = ({ services, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-3/5">Description</th>
              <th scope="col" className="px-6 py-3 text-right">Default Unit Price (RM)</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="bg-white border-b hover:bg-gray-50 transition-colors duration-200">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-normal">
                  {service.description}
                </th>
                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(service.unitPrice)}</td>
                <td className="px-6 py-4 flex justify-center items-center space-x-2">
                  <button onClick={() => onEdit(service)} className="text-gray-600 hover:text-gray-900 transition-colors duration-200" title="Edit Service">
                    <PencilIcon />
                  </button>
                  <button onClick={() => onDelete(service.id)} className="text-red-600 hover:text-red-900 transition-colors duration-200" title="Delete Service">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceTable;
