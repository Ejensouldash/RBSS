import React, { useState } from 'react';
import { AIProject, ProjectFile } from '../types';
import ProjectGrid from './project-intelligence/ProjectGrid';
import ProjectDetailView from './project-intelligence/ProjectDetailView';
import FileUploadModal from './project-intelligence/FileUploadModal';

interface ProjectIntelligenceDashboardProps {
    projects: AIProject[];
    setProjects: React.Dispatch<React.SetStateAction<AIProject[]>>;
}

const ProjectIntelligenceDashboard: React.FC<ProjectIntelligenceDashboardProps> = ({ projects, setProjects }) => {
    const [selectedProject, setSelectedProject] = useState<AIProject | null>(null);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);

    const handleSelectProject = (project: AIProject) => {
        setSelectedProject(project);
    };

    const handleBackToGrid = () => {
        setSelectedProject(null);
    };

    const handleAddNewFile = (file: ProjectFile, projectId: string) => {
        setProjects(prevProjects => {
            return prevProjects.map(p => {
                if (p.id === projectId) {
                    return { ...p, files: [...p.files, file] };
                }
                return p;
            });
        });
    };

    const handleCreateNewProject = (projectName: string, firstFile: ProjectFile) => {
        const newProject: AIProject = {
            id: `aiproj-${Date.now()}`,
            projectName: projectName,
            projectCode: `RB-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(projects.length + 1).toString().padStart(3, '0')}`,
            dateCreated: new Date().toLocaleDateString('en-GB'),
            status: 'Ongoing',
            projectValue: firstFile.extractedData.totalAmount || 0,
            coverThumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop',
            files: [firstFile],
            insights: { // Add default insights
                overview: { summary: `Project created with first document: ${firstFile.fileName}.`, totalCost: 0, totalRevenue: 0, netProfit: 0, progressPercent: 5, isPaymentOverdue: false, timeline: [], aiVerdict: 'New project created. Awaiting further data for full analysis.' },
                financial: { costByCategory: [], spendByVendor: [], expenseOverTime: [], aiSummary: '' },
                performance: { budgetAccuracy: 100, timeDeviationDays: 0, profitMarginTrend: [], aiVerdict: '', roiMonths: 0 },
                recommendations: []
            }
        };
        setProjects(prev => [...prev, newProject]);
    };
    
    return (
        <div 
            className="p-4 md:p-8 space-y-6 bg-cover bg-center min-h-full"
            style={{ backgroundImage: "linear-gradient(rgba(245, 245, 245, 0.9), rgba(245, 245, 245, 0.9)), url('https://www.transparenttextures.com/patterns/lined-paper.png')" }}
        >
            {selectedProject ? (
                <ProjectDetailView project={selectedProject} onBack={handleBackToGrid} />
            ) : (
                <ProjectGrid 
                    projects={projects} 
                    onSelectProject={handleSelectProject} 
                    onUploadNew={() => setUploadModalOpen(true)} 
                />
            )}

            {isUploadModalOpen && (
                <FileUploadModal 
                    projects={projects}
                    onClose={() => setUploadModalOpen(false)} 
                    onFileProcessed={handleAddNewFile}
                    onNewProject={handleCreateNewProject}
                />
            )}
        </div>
    );
};

export default ProjectIntelligenceDashboard;
