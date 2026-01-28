
// types.ts

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected';
export type ProjectStatus = 'In Progress' | 'Completed' | 'On Hold';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export type Page = 'Dashboard' | 'Quotations' | 'Projects' | 'Invoices' | 'Clients' | 'Services' | 'Analytics' | 'Settings' | 'AI Tender Workspace' | 'Material Intelligence' | 'Smart Vending Analysis' | 'Market News Hub' | 'AI Tender Intelligence' | 'AI Project Intelligence' | 'AI Vending Proposal Designer';

export interface Client {
  id: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string; // Added to support "L.S.", "nos", "m2", etc.
}

export interface Quotation {
  id: string;
  quotationNo: string;
  client: Client;
  date: string;
  items: QuotationItem[];
  terms: string;
  status: QuotationStatus;
}

export interface Project {
    id: string;
    projectName: string;
    quotationId: string;
    quotationNo: string;
    client: Client;
    startDate: string;
    endDate?: string; // New field
    notes?: string;   // New field
    status: ProjectStatus;
    totalValue: number;
    items: QuotationItem[];
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    quotationNo: string;
    client: Client;
    date: string;
    dueDate: string;
    items: QuotationItem[];
    totalValue: number;
    status: InvoiceStatus;
}

export interface ServiceItem {
    id: string;
    description: string;
    unitPrice: number;
}

export interface CompanyInfo {
    name: string;
    registrationNo: string;
    address: string;
    tel: string;
    email: string;
    bankInfo: string;
    logo?: string;
    defaultTerms: string;
    taxRate: number;
    cidbGrade?: string;
    ssmExpiry?: string;
    cidbExpiry?: string;
    pkkStatus?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

// For AI Tender Workspace
export interface BQItem {
    no: string;
    perihalanKerja: string;
    unit: string;
    kuantiti: number;
    hargaSeunit: number;
    jumlah: number;
}

export interface BQSection {
    id: string;
    title: string;
    items: BQItem[];
    subtotal: number;
}

export interface DetailedBQAnalysisResult {
    sections: BQSection[];
    grandTotal: number;
}

export interface TenderItemAnalysis {
    no: number;
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
    totalCost: number;
    confidence: number;
    notes: string;
}

export interface TenderSummary {
    suggestedMarkup: number;
    totalMaterialCost: number;
    totalLaborCost: number;
    totalOverheadCost: number;
    totalTenderValue: number;
    competitorRange: {
        low: number;
        high: number;
    };
    winProbability: number;
}

export interface TenderAnalysisResult {
    items: TenderItemAnalysis[];
    summary: TenderSummary;
}

export interface CombinedAnalysisResult {
    detailedBQ: DetailedBQAnalysisResult;
    strategicSummary: TenderAnalysisResult;
}

// For AI Material Intelligence
export interface MaterialPricePoint {
    date: string;
    price: number;
}

export interface MaterialIntelligenceData {
    materialName: string;
    unit: string;
    currentPrice: {
        value: number;
        changePercent24h: number;
    };
    historicalData: MaterialPricePoint[];
    forecast: {
        next7Days: {
            low: number;
            high: number;
            trend: 'uptrend' | 'downtrend' | 'stable';
        };
        probabilityPercent: number;
    };
    aiInsight: string;
    aiReasoning: string;
    regionalPrices: {
        region: string;
        price: number;
    }[];
}

export interface MaterialPriceSummary {
    materialName: string;
    unit: string;
    currentPrice: number;
    changePercent24h: number;
}

// For Smart Vending Analysis
export type MachineType = 'Drink' | 'Snack' | 'Combo';
export type MachineEnvironment = 'College' | 'Office' | 'Hospital' | 'Factory' | 'Public Space';
export type MaintenanceFrequency = 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
export type ProductPerformance = 'Excellent' | 'Good' | 'Low' | 'Poor';

export interface MachineProfile {
    machineId: string;
    machineModel: string;
    machineType: MachineType;
    slotCapacity: number;
    totalStock: number;
    powerConsumptionW: number;
    machineCost: number;
    monthlyElectricityCost: number;
    location: string;
    environment: MachineEnvironment;
    maintenanceFrequency: MaintenanceFrequency;
}

export interface VendingProduct {
    productName: string;
    category: string;
    costPrice: number;
    sellPrice: number;
}

export interface VendingProductAnalysis extends VendingProduct {
    margin: number;
    performance: ProductPerformance;
}

export interface ProfitScenario {
    turnover: number;
    netProfit: number;
    sales: number;
    margin: number;
}

export interface CategoryPerformance {
    category: string;
    profit: number;
    slotUsage: number;
}

export interface ROIProjectionPoint {
    month: number;
    cumulativeProfit: number;
}

export interface AIRecommendation {
    icon: string;
    text: string;
}

export interface AIVendingAnalysis {
    headerStats: {
        roiMonths: number;
        avgDailyProfit: number;
        powerCostPerDay: number;
        avgMonthlyProfit: number;
        monthlyRestockingCost: number;
    };
    profitScenarios: ProfitScenario[];
    productAnalysis: VendingProductAnalysis[];
    topPicks: {
        highestMargin: { name: string; value: number };
        lowestPerformer: { name: string; value: number };
    };
    categoryPerformance: CategoryPerformance[];
    categorySummary: string;
    roiProjection: ROIProjectionPoint[];
    breakEvenMonth: number;
    locationRecommendations: AIRecommendation[];
    locationSummary: string;
    fullReport: {
        summary: string;
        forecast: string;
        recommendations: string[];
    };
}

export interface InsightChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// For AI Market News Hub
export type NewsCategory = 'Fuel & Energy' | 'Construction & Materials' | 'Economy & Finance' | 'Government Projects' | 'Global Market Trends';
export type NewsImpactScore = 'Positive' | 'Negative' | 'Neutral';

export interface NewsArticle {
    id: string;
    title: string;
    source: string;
    date: string;
    summary: string;
    aiAnalysis: string;
    category: NewsCategory;
    impactScore: NewsImpactScore;
    predictedImpactValue: string;
}

export interface DailySummary {
    date: string;
    summaryPoints: string[];
}

export interface MarketNewsData {
    articles: NewsArticle[];
    dailySummaries: DailySummary[];
}

// For AI Tender Intelligence
export interface TenderIntelligenceResult {
    summary: {
        tenderTitle: string;
        tenderCategory: string;
        detectedCategory: string;
        closingDate: string;
        totalItems: number;
        finalTenderValue: number;
        indicativePrice: number;
        winRate: number;
        profitMargin: number;
        feasibilityScore: number;
        roiMonths: number;
        aiVerdict: string;
        feasibilityRadar: { subject: string; value: number }[];
    };
    technicalSpecification: {
        items: {
            item: string;
            description: string;
            quantity: number;
            unit: string;
            marketPrice: number;
            suggestedPrice: number;
            marginPercent: number;
            note: string;
            hasWarning: boolean;
            aiTooltip: string;
        }[];
    };
    pricingAnalysis: {
        priceComparisonChartData: { name: string; marketPrice: number; suggestedPrice: number }[];
        priceDifferenceChartData: { name: string; differencePercent: number }[];
        priceDistributionChartData: { name: string; value: number }[];
        supplierBenchmark: { supplier: string; price: number; leadTime: string; }[];
        aiRecommendation: string;
    };
    profitability: {
        roiGaugeMonths: number;
        profitSimulationChartData: { turnoverPercent: number; netProfit: number; sales: number }[];
        costBreakdownChartData: { name: string; value: number }[];
        summary: string;
    };
    risk: {
        riskMatrixData: { category: string; likelihood: number; impact: number }[];
        complianceChecklist: { item: string; status: string; note: string }[];
        ictCompliance?: {
            detected: boolean;
            category: string;
            requirement: string;
            analysis: string;
            compliant: boolean;
            recommendation: string;
        };
        aiAdvisory: string;
    };
    competitiveness: {
        winRateGauge: number;
        winRateBreakdown: { name: string; value: number }[];
        simulation: {
            text: string;
        };
        aiJustification: string;
    };
    strategicInsights: {
        recommendations: { icon: string; text: string }[];
        aiSummary: string;
    };
    marketForecast: {
        priceTrendProjection: { month: string; low: number; high: number; trend: number }[];
        demandGrowth: { sector: string; growthPercent: number }[];
        aiForecast: string;
    };
}

export interface TenderChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// For AI Project Intelligence Dashboard
export type FileCategory = 'Financial' | 'Cost' | 'Procurement' | 'Commercial' | 'Operational' | 'Communication' | 'Other';
export type ProjectFileStatus = 'Verified' | 'Pending Review' | 'Anomaly';
export type AIProjectStatus = 'Ongoing' | 'Completed' | 'Pending Payment' | 'On Hold';

export interface ExtractedData {
    docNo?: string;
    vendor?: string;
    date?: string;
    dueDate?: string;
    totalAmount?: number;
    taxAmount?: number;
    subtotal?: number;
    lineItems?: { description: string; amount: number }[];
    confidenceScore: number;
}

export interface ProjectFile {
    id: string;
    fileName: string;
    fileType: 'PDF' | 'Image' | 'Excel' | 'Word' | 'Email' | 'Other';
    category: FileCategory;
    uploadDate: string;
    summary: string;
    extractedData: ExtractedData;
    status: ProjectFileStatus;
    anomalyReason?: string;
}

export interface AIProject {
    id: string;
    projectName: string;
    projectCode: string;
    dateCreated: string;
    status: AIProjectStatus;
    projectValue: number;
    coverThumbnail: string;
    files: ProjectFile[];
    insights: {
        overview: {
            summary: string;
            totalCost: number;
            totalRevenue: number;
            netProfit: number;
            progressPercent: number;
            isPaymentOverdue: boolean;
            timeline: { event: string; date: string; docId: string }[];
            aiVerdict: string;
        };
        financial: {
            costByCategory: { name: string; value: number }[];
            spendByVendor: { name: string; value: number }[];
            expenseOverTime: { date: string; amount: number }[];
            aiSummary: string;
        };
        performance: {
            budgetAccuracy: number;
            timeDeviationDays: number;
            profitMarginTrend: { date: string; margin: number }[];
            aiVerdict: string;
            roiMonths: number;
        };
        recommendations: { icon: string; text: string; action?: string }[];
    };
}

// For AI Vending Proposal Designer
export type ProposalTone = 'Formal & Korporat' | 'Moden & Kreatif' | 'Mesra & Komuniti';
export type ColorTheme = 'Korporat (RBE)' | 'Elegan (Emas & Hitam)' | 'Moden & Minimalis';

export interface VendingProposalFormData {
    projectName: string;
    machineType: 'Snek' | 'Minuman' | 'Kombinasi';
    machineBrand: string;
    machineCount: number;
    proposalRecipientName: string;
    proposalRecipientPosition: string;
    proposalRecipientInstitution: string;
    proposalRecipientAddress: string;
    locationRationale: string;
    targetUsers: string;
    institutionBenefits: string;
    rawProductList?: string;
    proposalTone: ProposalTone;
    colorTheme: ColorTheme;
    useAiImage: boolean;
    machineImage?: string;
    includeCoverLetter: boolean;
    operationStartDate: string;
}

export interface GeneratedSlide {
    slideNumber: number;
    title: string;
    subtitle?: string;
    contentPoints: string[];
    imagePrompt: string;
    layoutSuggestion: string;
}

export interface SuratRasmiContent {
    rujukanKami: string;
    tarikh: string;
    penerima: {
        nama: string;
        jawatan: string;
        institusi: string;
        alamat: string;
    };
    tajuk: string;
    isiKandungan: string[];
    penutup: string[];
    tandatangan: {
        nama: string;
        jawatan: string;
    };
}

export interface GeneratedPresentation {
    slides: GeneratedSlide[];
    suratRasmi: SuratRasmiContent;
}
