import React, { useState, useMemo } from 'react';
import { ServiceItem } from '../types';
import ServiceTable from './ServiceTable';
import ServiceFormModal from './ServiceFormModal';
import { PlusIcon } from './icons/PlusIcon';

interface ServiceDashboardProps {
    services: ServiceItem[];
    onSave: (service: ServiceItem) => void;
    onDelete: (serviceId: string) => void;
}

const ServiceDashboard: React.FC<ServiceDashboardProps> = ({ services, onSave, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);

    const filteredServices = useMemo(() => {
        if (!searchTerm) {
            return services;
        }
        return services.filter(s => 
            s.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

    const handleAddNew = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: ServiceItem) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleSaveService = (service: ServiceItem) => {
        onSave(service);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <h1 className="text-3xl font-bold text-brand-text">Service Management</h1>
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search by description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
                        />
                         <button 
                            onClick={handleAddNew}
                            className="flex items-center justify-center space-x-2 bg-brand-gold text-brand-black font-bold py-2 px-4 rounded-md shadow-md hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>New Service</span>
                        </button>
                    </div>
                </div>
                
                <ServiceTable 
                    services={filteredServices} 
                    onEdit={handleEdit}
                    onDelete={onDelete}
                />
            </div>
            
            {isModalOpen && (
                <ServiceFormModal 
                    service={editingService}
                    onSave={handleSaveService}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default ServiceDashboard;
