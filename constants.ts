
import { Quotation, Project, Invoice, Client, ServiceItem, CompanyInfo, AIProject } from './types';

export const INITIAL_COMPANY_INFO: CompanyInfo = {
  name: "ROZITA BINA ENTERPRISE",
  registrationNo: "201703267509 (NS0187482-H)",
  address: "No. 49, Felda Pasir Besar, 73420 Gemas, Negeri Sembilan",
  tel: "018-2889671",
  email: "rozitabina@gmail.com",
  bankInfo: "Maybank - 15123456789 (Rozita Bina Enterprise)",
  defaultTerms: `1. Sah Laku: Harga yang ditawarkan sah selama 30 hari dari tarikh sebut harga.
2. Pembayaran: Deposit 50% semasa pengesahan, baki 50% selepas kerja siap.
3. Bayaran hendaklah dibuat kepada ROZITA BINA ENTERPRISE.`,
  taxRate: 0, // G1 usually non-SST unless revenue > 500k, user can adjust
  cidbGrade: "G1 (B, CE, ME)",
  ssmExpiry: "2026-08-16",
  cidbExpiry: "2028-04-28",
  pkkStatus: "Taraf Bumiputera (Sah sehingga 28/04/2028)"
};

export const MOCK_CLIENTS: Client[] = [
    {
      id: 'client-1',
      name: 'Ahmad bin Abdullah',
      company: 'Syarikat Maju Jaya Sdn. Bhd.',
      address: '123, Jalan Industri, 70450 Senawang, Negeri Sembilan',
      email: 'ahmad@majujaya.com',
      phone: '012-3456789',
    },
    {
      id: 'client-2',
      name: 'Siti Nurhaliza',
      company: '',
      address: '45, Taman Cempaka, 70200 Seremban, Negeri Sembilan',
      email: 'siti.nurhaliza@email.com',
      phone: '019-8765432',
    },
    {
      id: 'client-3',
      name: 'John Doe',
      company: 'Global Tech Inc.',
      address: 'Lot 5, Tech Park, 71800 Nilai, Negeri Sembilan',
      email: 'john.doe@globaltech.com',
      phone: '011-1234567',
    },
];


export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: '1',
    quotationNo: 'QUO-RBE-2024-001',
    client: MOCK_CLIENTS[0],
    date: '15/07/2024',
    items: [
      { id: 'item-1', description: 'Pembinaan longkang konkrit (100 meter)', quantity: 100, unitPrice: 150, unit: 'meter' },
      { id: 'item-2', description: 'Pemasangan bumbung metal deck', quantity: 50, unitPrice: 80, unit: 'm2' },
    ],
    terms: INITIAL_COMPANY_INFO.defaultTerms,
    status: 'Approved',
  },
  {
    id: '2',
    quotationNo: 'QUO-RBE-2024-002',
    client: MOCK_CLIENTS[1],
    date: '20/07/2024',
    items: [
      { id: 'item-1', description: 'Pembaikan dinding retak dan cat semula (Luar)', quantity: 1, unitPrice: 3500, unit: 'L.S.' },
    ],
    terms: INITIAL_COMPANY_INFO.defaultTerms,
    status: 'Sent',
  },
    {
    id: '3',
    quotationNo: 'QUO-RBE-2024-003',
    client: MOCK_CLIENTS[2],
    date: '22/07/2024',
    items: [
      { id: 'item-1', description: 'Naik taraf pejabat - Partition & Wiring', quantity: 1, unitPrice: 12000, unit: 'L.S.' },
      { id: 'item-2', description: 'Turapan semula kawasan parkir (500 sq meter)', quantity: 500, unitPrice: 25, unit: 'm2' },
    ],
    terms: INITIAL_COMPANY_INFO.defaultTerms,
    status: 'Draft',
  },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-1',
        projectName: 'Projek Longkang & Bumbung Syarikat Maju Jaya',
        quotationId: '1',
        quotationNo: 'QUO-RBE-2024-001',
        client: MOCK_CLIENTS[0],
        startDate: '18/07/2024',
        status: 'Completed', // Changed to completed to test invoice generation
        totalValue: (100 * 150 + 50 * 80),
        items: MOCK_QUOTATIONS[0].items,
    }
];

export const MOCK_INVOICES: Invoice[] = [
    // This can be populated when an invoice is generated from a project
];

// Updated MOCK_SERVICES based on SSM Activity List (Jenis Perniagaan)
export const MOCK_SERVICES: ServiceItem[] = [
    { id: 'serv-1', description: 'Pembersihan Kawasan & Potong Rumput (Per Sqft)', unitPrice: 0.50 },
    { id: 'serv-2', description: 'Pendawaian Elektrik (Wiring Point)', unitPrice: 180 },
    { id: 'serv-3', description: 'Pemasangan & Baiki Penghawa Dingin (1.0HP Service)', unitPrice: 150 },
    { id: 'serv-4', description: 'Pembinaan Longkang Konkrit (Per Meter)', unitPrice: 150 },
    { id: 'serv-5', description: 'Pemasangan Kanopi & Khemah (Sewa Harian)', unitPrice: 350 },
    { id: 'serv-6', description: 'Kerja-kerja Landskap (Lump Sum)', unitPrice: 2500 },
    { id: 'serv-7', description: 'Membekal Makanan Bermasak (Per Head)', unitPrice: 15 },
    { id: 'serv-8', description: 'Perkhidmatan Dobi (Per Kg)', unitPrice: 4 },
    { id: 'serv-9', description: 'Pemasangan Vending Machine (Setup Fee)', unitPrice: 500 },
    { id: 'serv-10', description: 'Penyelenggaraan Peralatan ICT/Komputer', unitPrice: 120 },
    { id: 'serv-11', description: 'Kerja Pembersihan Bangunan (Lump Sum)', unitPrice: 1500 },
    { id: 'serv-12', description: 'Angkat Tanah dan Pasir (Per Lori)', unitPrice: 350 },
    { id: 'serv-13', description: 'Bekalan Alat Tulis (Pukal)', unitPrice: 500 },
];

export const MOCK_AIPROJECTS: AIProject[] = [
    {
        id: 'aiproj-1',
        projectName: 'Naik Taraf Pejabat Global Tech Inc.',
        projectCode: 'RB-202407-001',
        dateCreated: '25/07/2024',
        status: 'Ongoing',
        projectValue: 24500,
        coverThumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
        files: [
            {
                id: 'file-1',
                fileName: 'Quotation-GTI.pdf',
                fileType: 'PDF',
                category: 'Cost',
                uploadDate: '25/07/2024',
                summary: 'Initial quotation for office renovation including partitions and wiring.',
                extractedData: {
                    docNo: 'QUO-RBE-2024-003',
                    vendor: 'Rozita Bina Enterprise',
                    date: '22/07/2024',
                    totalAmount: 24500,
                    confidenceScore: 0.98,
                },
                status: 'Verified',
            },
            {
                id: 'file-2',
                fileName: 'PO-98871.pdf',
                fileType: 'PDF',
                category: 'Procurement',
                uploadDate: '26/07/2024',
                summary: 'Purchase order from Global Tech Inc. confirming the project.',
                extractedData: { docNo: 'PO-98871', vendor: 'Global Tech Inc.', date: '26/07/2024', totalAmount: 24500, confidenceScore: 0.99 },
                status: 'Verified',
            },
            {
                id: 'file-3',
                fileName: 'Invoice_Cement_Supplier.jpg',
                fileType: 'Image',
                category: 'Financial',
                uploadDate: '28/07/2024',
                summary: 'Invoice for cement and building materials from NS Cement Supply.',
                extractedData: { docNo: 'INV-NSC-1089', vendor: 'NS Cement Supply', date: '28/07/2024', totalAmount: 3250, confidenceScore: 0.85 },
                status: 'Verified',
            },
            {
                id: 'file-4',
                fileName: 'invoice_duplicate.pdf',
                fileType: 'PDF',
                category: 'Financial',
                uploadDate: '29/07/2024',
                summary: 'Duplicate of invoice INV-NSC-1089 from NS Cement Supply.',
                extractedData: { docNo: 'INV-NSC-1089', vendor: 'NS Cement Supply', date: '28/07/2024', totalAmount: 3250, confidenceScore: 0.95 },
                status: 'Anomaly',
                anomalyReason: 'Duplicate invoice detected.'
            }
        ],
        insights: {
            overview: {
                summary: 'Project is currently in the initial phase of material procurement and site preparation. All primary documents (Quotation, PO) are verified. One financial document flagged for review.',
                totalCost: 3250,
                totalRevenue: 0,
                netProfit: -3250,
                progressPercent: 15,
                isPaymentOverdue: false,
                timeline: [
                    { event: 'Quotation Created', date: '22/07/2024', docId: 'file-1' },
                    { event: 'Project Confirmed (PO)', date: '26/07/2024', docId: 'file-2' },
                    { event: 'Material Purchased', date: '28/07/2024', docId: 'file-3' },
                ],
                aiVerdict: 'Project is on track. Key risk: monitor material costs which are trending slightly higher than quoted.'
            },
            financial: {
                costByCategory: [ { name: 'Material', value: 3250 }, { name: 'Labour', value: 0 }, { name: 'Overhead', value: 0 } ],
                spendByVendor: [ { name: 'NS Cement Supply', value: 3250 } ],
                expenseOverTime: [ { date: 'Week 30', amount: 3250 } ],
                aiSummary: 'Current expenditure is RM3,250, all attributed to materials. No revenue collected yet.'
            },
            performance: {
                budgetAccuracy: 98,
                timeDeviationDays: -1, // 1 day ahead of schedule
                profitMarginTrend: [ { date: 'Jul', margin: -100 } ],
                aiVerdict: 'Performance level: Excellent. Project is running ahead of schedule with initial costs aligned with budget.',
                roiMonths: 0
            },
            recommendations: [
                { icon: '📦', text: 'Confirm next material delivery from "Maju Jaya Hardware" to avoid delays.' },
                { icon: '📅', text: 'Schedule initial site inspection for next Monday.' },
                { icon: '💡', text: 'Send client a progress update email (Week 1).' }
            ]
        }
    }
];
