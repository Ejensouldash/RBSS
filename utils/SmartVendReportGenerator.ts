import { AIVendingAnalysis, MachineProfile, CompanyInfo } from '../types';

// DEPRECATED: The core logic of this function has been moved into the `AISummaryReport` component.
// This refactoring was done to create a more robust, on-demand script loading mechanism
// that resolves race conditions and better manages loading states within the component itself,
// fixing persistent PDF generation errors. This file is kept to avoid breaking potential imports,
// but the function is now a no-op.

export const generateSmartVendReport = async (
    analysisResult: AIVendingAnalysis,
    machineProfile: MachineProfile,
    companyInfo: CompanyInfo
): Promise<void> => {
    // The implementation has been moved to components/smartvend/AISummaryReport.tsx
    console.warn("generateSmartVendReport is deprecated and has been moved to AISummaryReport.tsx");
    return Promise.resolve();
};
