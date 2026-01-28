import React from 'react';
import { Page } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { QuotationIcon } from './icons/QuotationIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { InvoiceIcon } from './icons/InvoiceIcon';
import { ClientIcon } from './icons/ClientIcon';
import { CogIcon } from './icons/CogIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentMagnifyingGlassIcon } from './icons/DocumentMagnifyingGlassIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { VendingMachineIcon } from './icons/VendingMachineIcon';
import { NewsIcon } from './icons/NewsIcon';
import { FolderKanbanIcon } from './icons/FolderKanbanIcon';
import { PresentationChartBarIcon } from './icons/PresentationChartBarIcon';


interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
    page: Page;
    label: string;
    icon: React.ReactNode;
    activePage: Page;
    onClick: (page: Page) => void;
}> = ({ page, label, icon, activePage, onClick }) => (
    <button
        onClick={() => onClick(page)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-md ${
            activePage === page
                ? 'bg-brand-red text-white shadow-inner'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    return (
        <aside className="w-64 bg-brand-black text-white shadow-lg flex-col hidden md:flex">
            <div className="flex items-center justify-center p-6 border-b border-gray-700">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-brand-gold">Rozita Bina Enterprise</h1>
                    <p className="text-xs text-gray-400">All-in-One System</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                <nav className="px-4 py-4 space-y-2">
                    <NavItem page="Dashboard" label="Dashboard" icon={<DashboardIcon />} activePage={activePage} onClick={setActivePage} />
                    <NavItem page="Quotations" label="Quotations" icon={<QuotationIcon />} activePage={activePage} onClick={() => setActivePage('Quotations')}/>
                    <NavItem page="Invoices" label="Invoices" icon={<InvoiceIcon />} activePage={activePage} onClick={setActivePage} />
                    <NavItem page="Projects" label="Projects" icon={<ProjectIcon />} activePage={activePage} onClick={setActivePage} />
                    <NavItem page="Clients" label="Clients" icon={<ClientIcon />} activePage={activePage} onClick={setActivePage} />
                    <NavItem page="Services" label="Services" icon={<WrenchScrewdriverIcon />} activePage={activePage} onClick={setActivePage} />
                    
                    <div className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</div>
                    <NavItem page="Analytics" label="Analytics" icon={<ChartBarIcon />} activePage={activePage} onClick={setActivePage} />

                    <div className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Suite</div>
                     <NavItem page="AI Tender Workspace" label="AI Tender Workspace" icon={<DocumentMagnifyingGlassIcon />} activePage={activePage} onClick={setActivePage} />
                     <NavItem page="AI Tender Intelligence" label="AI Tender Intelligence" icon={<DocumentMagnifyingGlassIcon />} activePage={activePage} onClick={setActivePage} />
                     <NavItem page="AI Project Intelligence" label="AI Project Intelligence" icon={<FolderKanbanIcon />} activePage={activePage} onClick={setActivePage} />
                     <NavItem page="AI Vending Proposal Designer" label="AI Vending Designer" icon={<PresentationChartBarIcon />} activePage={activePage} onClick={setActivePage} />
                     <NavItem page="Material Intelligence" label="Material Intelligence" icon={<SparklesIcon />} activePage={activePage} onClick={setActivePage} />
                     <NavItem page="Smart Vending Analysis" label="Smart Vending Analysis" icon={<VendingMachineIcon />} activePage={activePage} onClick={setActivePage} />
                     <NavItem page="Market News Hub" label="Market News Hub" icon={<NewsIcon />} activePage={activePage} onClick={setActivePage} />

                </nav>

                <div className="p-4 border-t border-gray-700 mt-4">
                     <NavItem page="Settings" label="Settings" icon={<CogIcon />} activePage={activePage} onClick={setActivePage} />
                </div>
            </div>
             <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-700">
                &copy; {new Date().getFullYear()} Rozita Bina Ent.
                <br />
                All-in-One System
            </div>
        </aside>
    );
};

export default Sidebar;