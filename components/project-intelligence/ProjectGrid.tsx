import React from 'react';
import { AIProject } from '../../types';
import ProjectCard from './ProjectCard';
import { FilePlus2Icon } from '../icons/FilePlus2Icon';
import { SearchIcon } from '../icons/SearchIcon';
import { FilterIcon } from '../icons/FilterIcon';
import { FolderKanbanIcon } from '../icons/FolderKanbanIcon';

interface ProjectGridProps {
    projects: AIProject[];
    onSelectProject: (project: AIProject) => void;
    onUploadNew: () => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelectProject, onUploadNew }) => {
    return (
        <div className="space-y-6 fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center space-x-3">
                    <FolderKanbanIcon className="w-8 h-8 text-brand-red" />
                    <div>
                        <h1 className="text-3xl font-bold text-brand-text">AI Project Intelligence</h1>
                        <p className="text-sm text-gray-500">Central AI-Managed Project Repository</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search projects, files, vendors..."
                            className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:ring-2 focus:ring-brand-gold focus:outline-none transition-shadow"
                        />
                    </div>
                    <button className="p-2.5 border rounded-full bg-gray-50 hover:bg-gray-100"><FilterIcon className="w-5 h-5 text-gray-600" /></button>
                    <button 
                        onClick={onUploadNew}
                        className="flex items-center gap-2 bg-brand-gold text-brand-black font-bold py-2 px-4 rounded-full shadow-md hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                    >
                        <FilePlus2Icon className="w-5 h-5" />
                        <span className="hidden sm:inline">Upload File</span>
                    </button>
                </div>
            </header>

            <main>
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map(project => (
                            <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-700">No Projects Found</h3>
                        <p className="text-gray-500 mt-2">Get started by uploading your first project document.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectGrid;