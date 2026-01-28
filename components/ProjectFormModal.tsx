
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ProjectFormModalProps {
    project: Project;
    onSave: (updatedProject: Project) => void;
    onClose: () => void;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ project, onSave, onClose }) => {
    const [formData, setFormData] = useState<Project>(project);

    useEffect(() => {
        setFormData(project);
    }, [project]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Edit Project</h3>
                        <p className="text-xs text-gray-500">Ref: {project.quotationNo}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-brand-red transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Project Name - Full Width */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project Name</label>
                            <input
                                type="text"
                                name="projectName"
                                value={formData.projectName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-sm"
                                required
                            />
                        </div>

                        {/* Status & Value Row */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none bg-white text-sm"
                            >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Value (RM) <span className="text-[10px] lowercase font-normal">(Locked)</span></label>
                            <input
                                type="text"
                                value={new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(formData.totalValue)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-semibold"
                            />
                        </div>

                        {/* Dates Row */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                            <input
                                type="text"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-sm"
                                placeholder="DD/MM/YYYY"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Completion</label>
                            <input
                                type="text"
                                name="endDate"
                                value={formData.endDate || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-sm"
                                placeholder="DD/MM/YYYY"
                            />
                        </div>

                        {/* Notes - Full Width */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project Notes / Remarks</label>
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-sm resize-none"
                                placeholder="Enter project updates, material status, or issues here..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 rounded bg-brand-black text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;
