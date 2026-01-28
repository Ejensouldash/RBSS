
import React from 'react';
import { Project } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClientIcon } from './icons/ClientIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';
import { ClipboardDocumentIcon } from './icons/ClipboardDocumentIcon';

interface ProjectDetailModalProps {
    project: Project;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM');
};

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b bg-white flex justify-between items-center z-10 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-brand-text truncate max-w-md">{project.projectName}</h2>
                            <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusStyle(project.status)}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Quotation Ref: <span className="font-mono text-brand-black">{project.quotationNo}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Split Layout Content */}
                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    
                    {/* LEFT COLUMN: Main Scope of Work (65%) */}
                    <div className="md:w-[65%] flex flex-col border-r border-gray-200 bg-white overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ClipboardDocumentIcon className="w-5 h-5 text-brand-red" />
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Scope of Work & Pricing</h3>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                        <tr>
                                            <th className="px-4 py-3 w-12 text-center">#</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3 text-center w-20">Unit</th>
                                            <th className="px-4 py-3 text-center w-20">Qty</th>
                                            <th className="px-4 py-3 text-right w-28">Rate (RM)</th>
                                            <th className="px-4 py-3 text-right w-28">Total (RM)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {project.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3 text-center text-gray-400">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{item.description}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{item.unit || '-'}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice).replace('RM', '')}</td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(item.quantity * item.unitPrice).replace('RM', '')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t font-bold text-gray-800">
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-right uppercase text-xs">Total Project Value</td>
                                            <td className="px-4 py-3 text-right text-brand-red text-base">{formatCurrency(project.totalValue)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Info (35%) */}
                    <div className="md:w-[35%] bg-gray-50/50 p-6 overflow-y-auto space-y-6">
                        
                        {/* Client Card */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                <ClientIcon className="w-4 h-4 text-blue-600" />
                                <h4 className="text-xs font-bold uppercase text-gray-500">Client Details</h4>
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900">{project.client.name}</p>
                                {project.client.company && <p className="text-xs font-semibold text-gray-600">{project.client.company}</p>}
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">{project.client.address}</p>
                                <div className="mt-3 pt-2 border-t border-dashed border-gray-200 text-xs flex flex-col gap-1">
                                    <span className="flex justify-between"><span>Phone:</span> <span className="font-mono text-gray-700">{project.client.phone}</span></span>
                                    <span className="flex justify-between"><span>Email:</span> <span className="text-gray-700 truncate">{project.client.email}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline & Financials Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarDaysIcon className="w-4 h-4 text-purple-600" />
                                    <h4 className="text-xs font-bold uppercase text-gray-500">Timeline</h4>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">Start Date</p>
                                        <p className="font-semibold text-gray-800">{project.startDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase">Target End</p>
                                        <p className={`font-semibold ${project.endDate ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                            {project.endDate || 'Not Set'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <BanknotesIcon className="w-4 h-4 text-green-600" />
                                    <h4 className="text-xs font-bold uppercase text-gray-500">Financials</h4>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs text-gray-500">Total Contract</p>
                                    <p className="text-lg font-bold text-green-700">{formatCurrency(project.totalValue)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-yellow-800 mb-2">Project Notes / Status</h4>
                            {project.notes ? (
                                <p className="text-xs text-gray-800 whitespace-pre-line leading-relaxed">{project.notes}</p>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No notes added yet.</p>
                            )}
                        </div>

                    </div>
                </div>
                
                {/* Footer Actions */}
                <div className="p-4 bg-white border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-md transition-colors">
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailModal;
