import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import ClientTable from './ClientTable';
import { PlusIcon } from './icons/PlusIcon';


interface ClientDashboardProps {
    clients: Client[];
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clients }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        if (!searchTerm) {
            return clients;
        }
        return clients.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-brand-text">Client Management</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search by client or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
                    />
                     <button 
                        onClick={() => alert("Add New Client form coming soon!")}
                        className="flex items-center justify-center space-x-2 bg-brand-gold text-brand-black font-bold py-2 px-4 rounded-md shadow-md hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>New Client</span>
                    </button>
                </div>
            </div>
            
            <ClientTable clients={filteredClients} />
        </div>
    );
};

export default ClientDashboard;