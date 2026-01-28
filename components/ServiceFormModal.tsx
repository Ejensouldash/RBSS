import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ServiceFormModalProps {
    service: ServiceItem | null;
    onSave: (service: ServiceItem) => void;
    onClose: () => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ service, onSave, onClose }) => {
    const [description, setDescription] = useState(service?.description || '');
    const [unitPrice, setUnitPrice] = useState(service?.unitPrice || 0);

    const handleSave = () => {
        if (!description.trim() || unitPrice <= 0) {
            alert('Please fill in a valid description and a unit price greater than zero.');
            return;
        }
        onSave({
            id: service?.id || `new-${Date.now()}`,
            description,
            unitPrice,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{service ? 'Edit Service' : 'Add New Service'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-brand-red">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Service Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="e.g., Pemasangan bumbung metal deck (per sq meter)"
                        />
                    </div>
                    <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                            Default Unit Price (RM)
                        </label>
                        <input
                            type="number"
                            id="unitPrice"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(Number(e.target.value))}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="e.g., 80"
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-brand-black text-white hover:bg-gray-800">
                        Save Service
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceFormModal;
