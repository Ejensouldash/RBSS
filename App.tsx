
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import QuotationForm from './components/QuotationForm';
import QuotationPreviewModal from './components/QuotationPreviewModal';
import InvoicePreviewModal from './components/InvoicePreviewModal';
import BQPreviewModal from './components/BQPreviewModal';
import DOPreviewModal from './components/DOPreviewModal';
import ProjectDetailModal from './components/ProjectDetailModal';
import ProjectFormModal from './components/ProjectFormModal';
import { MOCK_QUOTATIONS, MOCK_CLIENTS, MOCK_SERVICES, INITIAL_COMPANY_INFO, MOCK_PROJECTS, MOCK_INVOICES, MOCK_AIPROJECTS } from './constants';
import { Quotation, Client, ServiceItem, CompanyInfo, Project, Invoice, InvoiceStatus, Page, QuotationStatus, ProjectStatus, AIProject } from './types';
import ProjectDashboard from './components/ProjectDashboard';
import InvoiceDashboard from './components/InvoiceDashboard';
import ClientDashboard from './components/ClientDashboard';
import ServiceDashboard from './components/ServiceDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SettingsPage from './components/SettingsPage';
import AICompanion from './components/AICompanion';
import AITenderWorkspace from './components/AITenderWorkspace';
import MaterialPriceDashboard from './components/MaterialPriceDashboard';
import SmartVendDashboard from './components/SmartVendDashboard';
import MarketNewsDashboard from './components/MarketNewsDashboard';
import TenderIntelligenceDashboard from './components/TenderIntelligenceDashboard';
import ProjectIntelligenceDashboard from './components/ProjectIntelligenceDashboard';
import AIVendingProposalDesignerDashboard from './components/AIVendingProposalDesignerDashboard';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('Dashboard');
    
    // Replace useState with useLocalStorage for persistence
    const [quotations, setQuotations] = useLocalStorage<Quotation[]>('rbss-quotations', MOCK_QUOTATIONS);
    const [projects, setProjects] = useLocalStorage<Project[]>('rbss-projects', MOCK_PROJECTS);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('rbss-invoices', MOCK_INVOICES);
    const [clients, setClients] = useLocalStorage<Client[]>('rbss-clients', MOCK_CLIENTS);
    const [services, setServices] = useLocalStorage<ServiceItem[]>('rbss-services', MOCK_SERVICES);
    const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('rbss-companyInfo', INITIAL_COMPANY_INFO);
    const [aiProjects, setAiProjects] = useLocalStorage<AIProject[]>('rbss-aiProjects', MOCK_AIPROJECTS);
    
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
    const [previewingQuotation, setPreviewingQuotation] = useState<Quotation | null>(null);
    const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);
    const [previewingBQ, setPreviewingBQ] = useState<Project | Quotation | null>(null);
    const [previewingDO, setPreviewingDO] = useState<Project | null>(null);
    
    // Project Management States
    const [viewingProject, setViewingProject] = useState<Project | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleSaveQuotation = (quotation: Quotation, isNewClient: boolean) => {
        if (isNewClient) {
            setClients(prev => [...prev, quotation.client]);
        }
        
        const index = quotations.findIndex(q => q.id === quotation.id);
        if (index > -1) {
            const newQuotations = [...quotations];
            newQuotations[index] = quotation;
            setQuotations(newQuotations);
        } else {
            setQuotations(prev => [...prev, quotation]);
        }
        setEditingQuotation(null);
        setActivePage('Dashboard'); // Redirect to dashboard after save
    };

    const handleUpdateQuotationStatus = (id: string, status: QuotationStatus) => {
        setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    };

    const handleStartProject = (quotation: Quotation) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            projectName: `Projek berdasarkan ${quotation.quotationNo}`,
            quotationId: quotation.id,
            quotationNo: quotation.quotationNo,
            client: quotation.client,
            startDate: new Date().toLocaleDateString('en-GB'),
            status: 'In Progress',
            totalValue: quotation.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
            items: quotation.items,
        };
        setProjects(prev => [...prev, newProject]);
        
        const updatedQuotations = quotations.map(q => q.id === quotation.id ? { ...q, status: 'Approved' as QuotationStatus } : q);
        setQuotations(updatedQuotations);
        setActivePage('Projects');
    };

    const handleUpdateProjectStatus = (id: string, status: ProjectStatus) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    };
    
    const handleUpdateProjectDetails = (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        setEditingProject(null);
    };
    
    const handleGenerateInvoice = (project: Project) => {
        const taxRate = companyInfo.taxRate / 100;
        const totalValueWithTax = project.totalValue * (1 + taxRate);
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 30); // 30 days due date

        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            invoiceNo: `INV-RBE-${today.getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
            quotationNo: project.quotationNo,
            client: project.client,
            date: today.toLocaleDateString('en-GB'),
            dueDate: dueDate.toLocaleDateString('en-GB'),
            items: project.items,
            totalValue: totalValueWithTax,
            status: 'Draft',
        };
        setInvoices(prev => [...prev, newInvoice]);
        setPreviewingInvoice(newInvoice); // Immediately preview
        setActivePage('Invoices');
    };

    const handleUpdateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
    };

    const handleSaveService = (service: ServiceItem) => {
        const index = services.findIndex(s => s.id === service.id);
        if (index > -1) {
            setServices(prev => {
                const newServices = [...prev];
                newServices[index] = service;
                return newServices;
            });
        } else {
            setServices(prev => [...prev, service]);
        }
    };
    
    const handleDeleteService = (serviceId: string) => {
        setServices(prev => prev.filter(s => s.id !== serviceId));
    };
    
    const handleAddNewQuotation = () => {
        setEditingQuotation(null);
        setActivePage('Quotations');
    };

    const handleEditQuotation = (quotation: Quotation) => {
        setEditingQuotation(quotation);
        setActivePage('Quotations');
    };

    // Render standard CRUD pages (these unmount when switched to ensure clean state)
    const renderStandardPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <Dashboard
                    quotations={quotations}
                    onAddNew={handleAddNewQuotation}
                    onEdit={handleEditQuotation}
                    onView={setPreviewingQuotation}
                    onStatusChange={handleUpdateQuotationStatus}
                    onStartProject={handleStartProject}
                    companyInfo={companyInfo}
                />;
            case 'Quotations':
                return <QuotationForm
                        initialQuotation={editingQuotation}
                        clients={clients}
                        services={services}
                        onSave={handleSaveQuotation}
                        onCancel={() => { setEditingQuotation(null); setActivePage('Dashboard'); }}
                        quotationCount={quotations.length}
                        companyInfo={companyInfo}
                    />;
            case 'Projects':
                 return <ProjectDashboard 
                    projects={projects} 
                    onGenerateInvoice={handleGenerateInvoice} 
                    onGenerateBQ={(project) => setPreviewingBQ(project)}
                    onGenerateDO={(project) => setPreviewingDO(project)}
                    onStatusChange={handleUpdateProjectStatus}
                    onViewProject={setViewingProject}
                    onEditProject={setEditingProject}
                 />;
            case 'Invoices':
                return <InvoiceDashboard invoices={invoices} onView={setPreviewingInvoice} onUpdateStatus={handleUpdateInvoiceStatus} />;
            case 'Clients':
                return <ClientDashboard clients={clients} />;
            case 'Services':
                return <ServiceDashboard services={services} onSave={handleSaveService} onDelete={handleDeleteService} />;
            case 'Analytics':
                return <AnalyticsDashboard quotations={quotations} projects={projects} />;
            case 'Settings':
                return <SettingsPage companyInfo={companyInfo} onSave={setCompanyInfo} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex h-screen bg-brand-bg font-sans">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 overflow-y-auto">
                {/* Standard pages are rendered conditionally */}
                {renderStandardPage()}

                {/* AI Suite pages are always mounted but hidden when inactive to preserve state/background processes */}
                <div className={activePage === 'AI Tender Workspace' ? 'block min-h-full' : 'hidden'}>
                    <AITenderWorkspace companyInfo={companyInfo} />
                </div>
                <div className={activePage === 'Material Intelligence' ? 'block min-h-full' : 'hidden'}>
                    <MaterialPriceDashboard />
                </div>
                <div className={activePage === 'AI Tender Intelligence' ? 'block min-h-full' : 'hidden'}>
                    <TenderIntelligenceDashboard companyInfo={companyInfo} />
                </div>
                <div className={activePage === 'AI Project Intelligence' ? 'block min-h-full' : 'hidden'}>
                    <ProjectIntelligenceDashboard projects={aiProjects} setProjects={setAiProjects} />
                </div>
                <div className={activePage === 'AI Vending Proposal Designer' ? 'block min-h-full' : 'hidden'}>
                    <AIVendingProposalDesignerDashboard companyInfo={companyInfo} />
                </div>
                <div className={activePage === 'Smart Vending Analysis' ? 'block min-h-full' : 'hidden'}>
                    <SmartVendDashboard companyInfo={companyInfo} />
                </div>
                <div className={activePage === 'Market News Hub' ? 'block min-h-full' : 'hidden'}>
                    <MarketNewsDashboard />
                </div>
            </main>
            
            {/* Modals */}
            {previewingQuotation && (
                <QuotationPreviewModal
                    quotation={previewingQuotation}
                    companyInfo={companyInfo}
                    onClose={() => setPreviewingQuotation(null)}
                />
            )}
            {previewingInvoice && (
                <InvoicePreviewModal
                    invoice={previewingInvoice}
                    companyInfo={companyInfo}
                    onClose={() => setPreviewingInvoice(null)}
                />
            )}
            {previewingBQ && (
                <BQPreviewModal
                    data={previewingBQ}
                    companyInfo={companyInfo}
                    onClose={() => setPreviewingBQ(null)}
                />
            )}
            {previewingDO && (
                <DOPreviewModal
                    project={previewingDO}
                    companyInfo={companyInfo}
                    onClose={() => setPreviewingDO(null)}
                />
            )}
            {viewingProject && (
                <ProjectDetailModal 
                    project={viewingProject}
                    onClose={() => setViewingProject(null)}
                />
            )}
            {editingProject && (
                <ProjectFormModal
                    project={editingProject}
                    onSave={handleUpdateProjectDetails}
                    onClose={() => setEditingProject(null)}
                />
            )}

            <AICompanion activePage={activePage} setActivePage={setActivePage} />
        </div>
    );
};
export default App;
export type { Page };
