import React, { useState, useMemo } from 'react';
import { ServiceItem } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface AddServiceItemModalProps {
    services: ServiceItem[];
    onClose: () => void;
    onAddServices: (selectedServices: ServiceItem[]) => void;
}

const AddServiceItemModal: React.FC<AddServiceItemModalProps> = ({ services, onClose, onAddServices }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());

    const filteredServices = useMemo(() => {
        return services.filter(s => 
            s.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

    const handleToggleSelection = (serviceId: string) => {
        setSelectedServiceIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                newSet.delete(serviceId);
            } else {
                newSet.add(serviceId);
            }
            return newSet;
        });
    };

    const handleAdd = () => {
        const selectedServices = services.filter(s => selectedServiceIds.has(s.id));
        if (selectedServices.length > 0) {
            onAddServices(selectedServices);
        }
        onClose();
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold">Select Services to Add</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-brand-red">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
                    />
                </div>
                <div className="overflow-y-auto flex-grow p-4">
                    <div className="space-y-2">
                        {filteredServices.map(service => (
                            <div 
                                key={service.id}
                                onClick={() => handleToggleSelection(service.id)}
                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors duration-150 ${selectedServiceIds.has(service.id) ? 'bg-blue-100 border-blue-400 border' : 'bg-gray-50 hover:bg-gray-100'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <input 
                                        type="checkbox"
                                        checked={selectedServiceIds.has(service.id)}
                                        readOnly
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-800">{service.description}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">{formatCurrency(service.unitPrice)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg sticky bottom-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200">
                        Cancel
                    </button>
                    <button 
                        onClick={handleAdd} 
                        disabled={selectedServiceIds.size === 0}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Add {selectedServiceIds.size > 0 ? `(${selectedServiceIds.size})` : ''} Selected Items
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddServiceItemModal;
