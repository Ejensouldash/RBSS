import React from 'react';
import { AIProject, AIProjectStatus } from '../../types';

interface ProjectCardProps {
    project: AIProject;
    onSelect: () => void;
}

const statusStyles: Record<AIProjectStatus, { bg: string; text: string; }> = {
    Ongoing: { bg: 'bg-blue-100', text: 'text-blue-800' },
    Completed: { bg: 'bg-green-100', text: 'text-green-800' },
    'On Hold': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Pending Payment': { bg: 'bg-purple-100', text: 'text-purple-800' },
};

const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
        return `RM ${(amount / 1000).toFixed(1)}k`;
    }
    return `RM ${amount.toFixed(0)}`;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
    const style = statusStyles[project.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
        <div 
            onClick={onSelect}
            className="group bg-white rounded-xl shadow-lg border border-gray-200/50 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col"
        >
            <div className="relative h-40">
                <img src={project.coverThumbnail} alt={project.projectName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full ${style.bg} ${style.text}`}>
                    {project.status}
                </span>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-brand-red font-semibold">{project.projectCode}</p>
                <h3 className="text-lg font-bold text-brand-text flex-grow">{project.projectName}</h3>
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-xs text-gray-500">Files</p>
                        <p className="font-semibold">{project.files.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className="font-semibold">{formatCurrency(project.insights.overview.totalCost)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
