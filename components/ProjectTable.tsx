
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { EyeIcon } from './icons/EyeIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { ClipboardDocumentIcon } from './icons/ClipboardDocumentIcon';
import { TruckIcon } from './icons/TruckIcon';

interface ProjectTableProps {
  projects: Project[];
  onGenerateInvoice: (project: Project) => void;
  onGenerateBQ?: (project: Project) => void;
  onGenerateDO?: (project: Project) => void;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
}

const statusColorMap: Record<ProjectStatus, string> = {
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'On Hold': 'bg-red-100 text-red-800 border-red-200',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace('MYR', 'RM');
};

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onGenerateInvoice, onGenerateBQ, onGenerateDO, onStatusChange, onView, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3 font-bold">Project Name</th>
              <th scope="col" className="px-6 py-3 font-bold">Client</th>
              <th scope="col" className="px-6 py-3 font-bold">Quotation No</th>
              <th scope="col" className="px-6 py-3 text-right font-bold">Value (RM)</th>
              <th scope="col" className="px-6 py-3 text-center font-bold">Status</th>
              <th scope="col" className="px-6 py-3 text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => (
              <tr key={project.id} className="bg-white hover:bg-gray-50 transition-colors duration-200">
                <th scope="row" className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                  {project.projectName}
                </th>
                <td className="px-6 py-4 text-gray-700">{project.client.name}</td>
                <td className="px-6 py-4 text-gray-500">{project.quotationNo}</td>
                <td className="px-6 py-4 text-right font-bold text-brand-black">{formatCurrency(project.totalValue)}</td>
                <td className="px-6 py-4 text-center">
                  <select
                    value={project.status}
                    onChange={(e) => onStatusChange(project.id, e.target.value as ProjectStatus)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer ${statusColorMap[project.status]}`}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </td>
                <td className="px-6 py-4 flex justify-center items-center space-x-2">
                  <button onClick={() => onView(project)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded hover:bg-blue-50" title="View Details">
                    <EyeIcon />
                  </button>
                  <button onClick={() => onEdit(project)} className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1 rounded hover:bg-gray-100" title="Edit Project">
                    <PencilIcon />
                  </button>
                  {onGenerateBQ && (
                      <button onClick={() => onGenerateBQ(project)} className="text-orange-600 hover:text-orange-900 transition-colors duration-200 p-1 rounded hover:bg-orange-50" title="Generate BQ">
                        <ClipboardDocumentIcon />
                      </button>
                  )}
                  {onGenerateDO && (
                      <button onClick={() => onGenerateDO(project)} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-1 rounded hover:bg-indigo-50" title="Generate DO">
                        <TruckIcon />
                      </button>
                  )}
                   {project.status === 'Completed' && (
                    <button onClick={() => onGenerateInvoice(project)} className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded hover:bg-green-50" title="Generate Invoice">
                        <DollarSignIcon />
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

export default ProjectTable;
