import { TenderAnalysisResult, DetailedBQAnalysisResult, CompanyInfo } from '../types';

// DEPRECATED: The core logic of this function has been moved into the `AITenderWorkspace` component.
// This refactoring was done to create a more robust, on-demand script loading mechanism
// that resolves race conditions and better manages loading states within the component itself,
// fixing persistent PDF generation errors. This file is kept to avoid breaking potential imports,
// but the function is now a no-op.

export const generateTenderReport = async (
    strategicSummary: TenderAnalysisResult,
    detailedBQ: DetailedBQAnalysisResult,
    companyInfo: CompanyInfo,
    chartsImage: string,
    tenderFileName: string
): Promise<void> => {
    // The implementation has been moved to components/AITenderWorkspace.tsx
    console.warn("generateTenderReport is deprecated and has been moved to AITenderWorkspace.tsx");
    return Promise.resolve();
};
