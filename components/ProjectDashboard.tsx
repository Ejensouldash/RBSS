
import React from 'react';
import { Project, ProjectStatus } from '../types';
import ProjectTable from './ProjectTable';

interface ProjectDashboardProps {
    projects: Project[];
    onGenerateInvoice: (project: Project) => void;
    onGenerateBQ: (project: Project) => void;
    onGenerateDO: (project: Project) => void;
    onStatusChange: (id: string, status: ProjectStatus) => void;
    onViewProject: (project: Project) => void;
    onEditProject: (project: Project) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onGenerateInvoice, onGenerateBQ, onGenerateDO, onStatusChange, onViewProject, onEditProject }) => {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-brand-text">Project Management</h1>
                 <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search by project or client..."
                        className="w-full md:w-64 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
                    />
                </div>
            </div>
            
            <ProjectTable 
                projects={projects} 
                onGenerateInvoice={onGenerateInvoice} 
                onGenerateBQ={onGenerateBQ}
                onGenerateDO={onGenerateDO}
                onStatusChange={onStatusChange}
                onView={onViewProject}
                onEdit={onEditProject}
            />
        </div>
    );
};

export default ProjectDashboard;
