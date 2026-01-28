import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CompanyInfo, CombinedAnalysisResult, DetailedBQAnalysisResult, TenderAnalysisResult } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentMagnifyingGlassIcon } from './icons/DocumentMagnifyingGlassIcon';
import { ArrowUpTrayIcon } from './icons/ArrowUpTrayIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import DetailedBQPricingTable from './DetailedBQPricingTable';
import AITenderStrategist from './AITenderStrategist';
import { extractTextFromFile } from '../utils/fileExtractor';
import TenderCharts from './TenderCharts';
import AnalysisLoader from './AnalysisLoader';


type AnalysisState = "idle" | "extracting" | "extracted" | "analyzing" | "complete" | "error";
type ActiveView = 'pricing' | 'strategy';


// --- Robust Script Loader ---
const scriptPromises: Record<string, Promise<void>> = {};
const loadScript = (src: string): Promise<void> => {
    if (scriptPromises[src]) {
        return scriptPromises[src];
    }
    scriptPromises[src] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            delete scriptPromises[src];
            reject(new Error(`Failed to load script: ${src}.`));
        };
        document.head.appendChild(script);
    });
    return scriptPromises[src];
};


// --- UI Components for different states ---

const ExtractionLoader: React.FC<{fileName: string}> = ({fileName}) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white rounded-lg shadow-inner min-h-[400px]">
        <DocumentMagnifyingGlassIcon className="w-16 h-16 text-gray-400 animate-pulse mb-4" />
        <h3 className="text-xl font-bold text-brand-text">Mengekstrak Teks...</h3>
        <p className="text-gray-500 mt-1">Sedang membaca kandungan daripada: <span className="font-semibold">{fileName}</span></p>
    </div>
);

const FileUploadSection: React.FC<{ onFileUpload: (files: FileList) => void }> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileUpload(e.dataTransfer.files);
        }
    };
    return (
        <div 
            className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-xl transition-colors duration-300 min-h-[400px] ${isDragging ? 'border-brand-gold bg-yellow-50' : 'border-gray-300 bg-gray-50'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <ArrowUpTrayIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-brand-text">Seret & Lepaskan Fail BQ Anda Di Sini</h3>
            <p className="text-gray-500 mt-1">atau</p>
            <label htmlFor="file-upload" className="mt-4 px-6 py-2 bg-brand-black text-white font-semibold rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
                Pilih Fail
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={(e) => e.target.files && onFileUpload(e.target.files)} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" />
            <p className="text-xs text-gray-400 mt-4">Menyokong dokumen PDF, Word, Excel & Teks</p>
        </div>
    );
};

const ExtractionResultView: React.FC<{
    fileName: string;
    extractedText: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ fileName, extractedText, onConfirm, onCancel }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold">Teks Diekstrak daripada <span className="text-brand-red">{fileName}</span></h3>
        <p className="text-sm text-gray-600">Sila semak kandungan di bawah untuk memastikan ia diekstrak dengan betul. Jika betul, teruskan dengan analisis.</p>
        <div className="max-h-80 overflow-y-auto bg-gray-50 p-4 border rounded-md font-mono text-xs text-gray-700 whitespace-pre-wrap">
            {extractedText}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
            <button onClick={onCancel} className="px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                Batal & Muat Naik Semula
            </button>
            <button onClick={onConfirm} className="flex items-center space-x-2 px-6 py-2 bg-brand-gold text-brand-black font-semibold rounded-md hover:opacity-90">
                <SparklesIcon className="w-5 h-5"/>
                <span>Sahkan & Mula Analisis</span>
            </button>
        </div>
    </div>
);


const AITenderWorkspace: React.FC<{ companyInfo: CompanyInfo }> = ({ companyInfo }) => {
    const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
    const [analysisResult, setAnalysisResult] = useState<CombinedAnalysisResult | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>('pricing');
    const [extractedText, setExtractedText] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const chartsRef = useRef<HTMLDivElement>(null);


    const handleFileUpload = useCallback(async (files: FileList) => {
        const file = files[0];
        if (!file) return;

        setUploadedFile(file);
        setAnalysisState("extracting");
        setErrorMessage('');
        setExtractedText('');

        try {
            const text = await extractTextFromFile(file);
             if (!text || !text.trim()) {
                throw new Error("No readable text detected. Please upload a digital (text-based) BQ file.");
            }
            setExtractedText(text);
            setAnalysisState("extracted");
        } catch (error: any) {
            console.error("Extraction Error:", error);
            setErrorMessage(error.message || "Gagal membaca fail. Sila pastikan format disokong dan fail tidak rosak.");
            setAnalysisState("error");
        }
    }, []);
    
    const handleStartAnalysis = useCallback(async () => {
        if (!extractedText) return;

        setAnalysisState("analyzing");
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            // --- STEP 1: Fast data extraction (BQ Structure) ---
            const extractionSchema = {
                type: Type.OBJECT, properties: { sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { no: { type: Type.STRING }, perihalanKerja: { type: Type.STRING }, unit: { type: Type.STRING }, kuantiti: { type: Type.NUMBER }, }, required: ["no", "perihalanKerja", "unit", "kuantiti"] } } }, required: ["title", "items"] } } }, required: ["sections"]
            };
            const extractionResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a data extraction specialist. Your only task is to read the following Bill of Quantities (BQ) text and extract its structure perfectly into a clean JSON object.
- DO NOT add any pricing or totals.
- Preserve the original item descriptions, numbers, units, and quantities exactly as they appear.
- Group items under their original section titles.
**BQ Content:**
${extractedText}
**Output Rules:**
Respond with a single, valid JSON object ONLY that conforms to the provided schema.`,
                config: { responseMimeType: "application/json", responseSchema: extractionSchema }
            });
            const structuredBq = JSON.parse(extractionResponse.text);

            // --- STEP 2: Combined Pricing & Strategic Analysis ---
            const combinedSchema = {
                type: Type.OBJECT,
                properties: {
                    detailedBQ: {
                        type: Type.OBJECT, properties: { sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { no: { type: Type.STRING }, perihalanKerja: { type: Type.STRING }, unit: { type: Type.STRING }, kuantiti: { type: Type.NUMBER }, hargaSeunit: { type: Type.NUMBER }, jumlah: { type: Type.NUMBER }, }, required: ["no", "perihalanKerja", "unit", "kuantiti", "hargaSeunit", "jumlah"] } }, subtotal: { type: Type.NUMBER } }, required: ["id", "title", "items", "subtotal"] } }, grandTotal: { type: Type.NUMBER } }, required: ["sections", "grandTotal"]
                    },
                    strategicSummary: {
                        type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { no: { type: Type.NUMBER }, description: { type: Type.STRING }, quantity: { type: Type.NUMBER }, unit: { type: Type.STRING }, estimatedUnitPrice: { type: Type.NUMBER }, totalCost: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, notes: { type: Type.STRING }, }, required: ["no", "description", "quantity", "unit", "estimatedUnitPrice", "totalCost", "confidence", "notes"] } }, summary: { type: Type.OBJECT, properties: { suggestedMarkup: { type: Type.NUMBER }, totalMaterialCost: { type: Type.NUMBER }, totalLaborCost: { type: Type.NUMBER }, totalOverheadCost: { type: Type.NUMBER }, totalTenderValue: { type: Type.NUMBER }, competitorRange: { type: Type.OBJECT, properties: { low: { type: Type.NUMBER }, high: { type: Type.NUMBER }, }, required: ["low", "high"] }, winProbability: { type: Type.NUMBER }, }, required: ["suggestedMarkup", "totalMaterialCost", "totalLaborCost", "totalOverheadCost", "totalTenderValue", "competitorRange", "winProbability"] } }, required: ["items", "summary"]
                    }
                },
                required: ["detailedBQ", "strategicSummary"]
            };

            const analysisResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro', // Using Pro model for advanced strategic analysis
                contents: `You are a world-class, top-tier Malaysian Quantity Surveyor and Tender Strategist AI. Your primary directive is to win this tender. You must leverage deep market research, competitor analysis, and strategic pricing to generate a bid with a win probability of AT LEAST 80%.

**Structured BQ Data:**
${JSON.stringify(structuredBq)}

**Your Two-Part Objective:**
1.  **Pricing (Detailed BQ):** Price every single item using aggressive but realistic current Malaysian market rates. Your pricing must be competitive. Calculate 'hargaSeunit', 'jumlah', section 'subtotal', and the final 'grandTotal'. This part is about creating a lean, accurate cost base.
2.  **Strategy (Strategic Summary):** Based on your lean pricing, build a winning tender strategy.
    - The final 'winProbability' MUST be 80% or higher. Adjust the 'suggestedMarkup' and 'totalTenderValue' to achieve this.
    - Break down the total cost into Materials, Labor, and Overhead.
    - Provide a simplified item list with pricing confidence and notes.
    - Suggest an optimal 'suggestedMarkup' that achieves the high win rate while protecting profit margins.
    - Estimate a realistic 'competitorRange' based on your simulated market research.

**Output Rules:**
- Respond with a single, valid JSON object ONLY that conforms to the provided schema, containing both the 'detailedBQ' and 'strategicSummary' objects.`,
                config: { temperature: 0.2, responseMimeType: "application/json", responseSchema: combinedSchema }
            });

            const combinedResult: CombinedAnalysisResult = JSON.parse(analysisResponse.text);

            setAnalysisResult(combinedResult);
            setAnalysisState("complete");

        } catch (error) {
            console.error("Gemini API Error:", error);
            setErrorMessage("Sistem AI mungkin mengalami trafik yang tinggi atau ralat semasa memproses. Sila cuba lagi sebentar lagi.");
            setAnalysisState("error");
        }
    }, [extractedText]);

    const handleGeneratePdf = useCallback(async () => {
        if (!analysisResult || !chartsRef.current) return;
    
        setIsGeneratingPdf(true);
        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
            ]);
    
            const pdfMake = (window as any).pdfMake;
            const html2canvas = (window as any).html2canvas;

            if (!pdfMake || !pdfMake.createPdf || !html2canvas) {
                throw new Error("PDF libraries failed to initialize. Please check your internet connection, disable ad-blockers and try again.");
            }
    
            const canvas = await html2canvas(chartsRef.current, {
                scale: 2,
                backgroundColor: null,
            });
            const chartsImage = canvas.toDataURL('image/png');
    
            const { strategicSummary, detailedBQ } = analysisResult;
            const tenderFileName = uploadedFile?.name || 'Tender';
    
            const formatCurrency = (amount: number, digits = 2) => {
                return new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits
                }).format(amount).replace('MYR', 'RM ');
            };
    
            const totalCost = strategicSummary.summary.totalMaterialCost + strategicSummary.summary.totalLaborCost + strategicSummary.summary.totalOverheadCost;
    
            const detailedItemsBody: any[] = [];
            detailedBQ.sections.forEach(section => {
                detailedItemsBody.push([
                    { text: section.title, colSpan: 6, style: 'sectionHeader' }, {}, {}, {}, {}, {}
                ]);
    
                section.items.forEach(item => {
                    detailedItemsBody.push([
                        item.no,
                        item.perihalanKerja,
                        { text: item.kuantiti, alignment: 'center' },
                        { text: item.unit, alignment: 'center' },
                        { text: formatCurrency(item.hargaSeunit), alignment: 'right' },
                        { text: formatCurrency(item.jumlah), alignment: 'right', bold: true },
                    ]);
                });
    
                detailedItemsBody.push([
                    { text: `Jumlah Seksyen`, colSpan: 5, style: 'subtotalLabel', alignment: 'right' }, {}, {}, {}, {},
                    { text: formatCurrency(section.subtotal), alignment: 'right', style: 'subtotalValue' }
                ]);
            });
    
            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 80, 40, 60],
                header: {
                    columns: [
                        companyInfo.logo ? {
                            image: companyInfo.logo,
                            width: 70,
                            margin: [40, 20, 0, 0]
                        } : {},
                        {
                            stack: [
                                { text: companyInfo.name, style: 'header' },
                                { text: 'AI-Generated Tender Analysis & Strategy Report', style: 'subheader' }
                            ],
                            alignment: 'right',
                            margin: [0, 25, 40, 0]
                        }
                    ]
                },
                footer: (currentPage: number, pageCount: number) => ({
                    columns: [
                        { text: 'Generated by RBE-AI Tender Intelligence', alignment: 'left', style: 'footer' },
                        { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', style: 'footer' }
                    ],
                    margin: [40, 20, 40, 0]
                }),
                content: [
                    { text: `Tender Analysis for: ${tenderFileName}`, style: 'h1' },
                    { text: `Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}`, style: 'p' },
                    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 10, 0, 20] },
    
                    { text: 'Strategic Summary', style: 'h2' },
                    {
                        columns: [
                            {
                                stack: [
                                    { text: 'Total Estimated Cost', style: 'summaryLabel' },
                                    { text: formatCurrency(totalCost, 2), style: 'summaryValue' },
                                    { text: 'Suggested Markup', style: 'summaryLabel', margin: [0, 10, 0, 0] },
                                    { text: `${strategicSummary.summary.suggestedMarkup.toFixed(1)}%`, style: 'summaryValue' },
                                ],
                            },
                            {
                                stack: [
                                    { text: 'Final Tender Value', style: 'summaryLabel' },
                                    { text: formatCurrency(strategicSummary.summary.totalTenderValue, 2), style: 'summaryValue', color: '#D2042D' },
                                    { text: 'Competitor Range', style: 'summaryLabel', margin: [0, 10, 0, 0] },
                                    { text: `${formatCurrency(strategicSummary.summary.competitorRange.low, 0)} - ${formatCurrency(strategicSummary.summary.competitorRange.high, 0)}`, style: 'summaryValue' },
                                ]
                            },
                            {
                                stack: [
                                    { text: 'Predicted Win Probability', style: 'summaryLabel' },
                                    { text: `${strategicSummary.summary.winProbability}%`, style: 'summaryValue', color: '#059669' },
                                ]
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
    
                    { text: 'Visual Cost Analysis', style: 'h2' },
                    {
                        image: chartsImage,
                        width: 515,
                        margin: [0, 0, 0, 20]
                    },
    
                    { text: 'Detailed BQ Pricing', style: 'h2', pageBreak: 'before' },
                    {
                        style: 'itemsTable',
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: '#', style: 'tableHeader' },
                                    { text: 'Perihalan Kerja', style: 'tableHeader' },
                                    { text: 'Kuantiti', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Unit', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Harga Seunit (RM)', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Jumlah (RM)', style: 'tableHeader', alignment: 'right' },
                                ],
                                ...detailedItemsBody,
                            ]
                        },
                        layout: {
                            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 1,
                            vLineWidth: () => 0,
                            hLineColor: (i: number) => (i === 0 || i === 1) ? '#333333' : '#dddddd',
                            paddingTop: () => 6,
                            paddingBottom: () => 6,
                        }
                    },
                    {
                        table: {
                            headerRows: 0,
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'JUMLAH KESELURUHAN PROJEK', alignment: 'right', bold: true, border: [false, true, false, false], style: 'grandTotalLabel' },
                                    { text: formatCurrency(detailedBQ.grandTotal), alignment: 'right', bold: true, border: [false, true, false, false], style: 'grandTotalValue' }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    },
                ],
                styles: {
                    header: { fontSize: 24, bold: true, color: '#000000' },
                    subheader: { fontSize: 10, color: '#333333' },
                    h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 5], color: '#D2042D' },
                    h2: { fontSize: 14, bold: true, margin: [0, 15, 0, 8], color: '#000000' },
                    p: { fontSize: 9, color: '#666666', margin: [0, 0, 0, 10] },
                    summaryLabel: { fontSize: 9, color: '#555555' },
                    summaryValue: { fontSize: 16, bold: true, color: '#000000' },
                    itemsTable: { margin: [0, 5, 0, 15], fontSize: 9 },
                    tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#333333' },
                    sectionHeader: { bold: true, fontSize: 10, color: '#333333', fillColor: '#eeeeee', margin: [0, 5, 0, 5] },
                    subtotalLabel: { bold: true, fontSize: 9 },
                    subtotalValue: { bold: true, fontSize: 9, color: '#D2042D' },
                    grandTotalLabel: { fontSize: 12, color: '#000000' },
                    grandTotalValue: { fontSize: 16, color: '#D2042D' },
                    footer: { fontSize: 8, italics: true, color: '#aaaaaa' }
                }
            };
    
            pdfMake.createPdf(docDefinition).download(`Tender_Report_${tenderFileName.split('.')[0]}.pdf`);
    
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            alert(`Sorry, there was an error generating the PDF: ${error.message}`);
        } finally {
            setIsGeneratingPdf(false);
        }
    }, [analysisResult, companyInfo, uploadedFile]);

    const handleReset = () => {
        setAnalysisState("idle");
        setAnalysisResult(null);
        setUploadedFile(null);
        setExtractedText('');
        setErrorMessage('');
        setActiveView("pricing");
    };
    
    const renderContent = () => {
        switch (analysisState) {
            case "idle":
                return <FileUploadSection onFileUpload={handleFileUpload} />;
            case "extracting":
                return <ExtractionLoader fileName={uploadedFile?.name || 'document'} />;
            case "extracted":
                return <ExtractionResultView 
                            fileName={uploadedFile?.name || ''}
                            extractedText={extractedText}
                            onConfirm={handleStartAnalysis}
                            onCancel={handleReset}
                        />;
            case "analyzing":
                return (
                    <AnalysisLoader 
                        title="Menjalankan Analisis BQ Terperinci"
                        steps={[
                            `Langkah 1: Mengekstrak struktur BQ daripada ${uploadedFile?.name || 'Dokumen'}...`,
                            "Langkah 2: Menjalankan analisis harga & strategi serentak...",
                            "Menjana laporan akhir..."
                        ]}
                    />
                );
            case "complete":
                if (!analysisResult) return <p className="text-center text-brand-red">Ralat: Gagal memaparkan hasil analisis.</p>;
                return (
                    <div>
                        <div className="flex space-x-2 border-b mb-4">
                            <TabButton
                                label="Harga Terperinci BQ"
                                isActive={activeView === 'pricing'}
                                onClick={() => setActiveView('pricing')}
                            />
                            <TabButton
                                label="Ringkasan Strategik"
                                isActive={activeView === 'strategy'}
                                onClick={() => setActiveView('strategy')}
                            />
                        </div>
                        {activeView === 'pricing' && <DetailedBQPricingTable analysisResult={analysisResult.detailedBQ} />}
                        {activeView === 'strategy' && <AITenderStrategist analysisResult={analysisResult.strategicSummary} />}
                    </div>
                );
            case "error":
                 return (
                    <div className="text-center min-h-[400px] flex flex-col justify-center items-center">
                        <p className="text-lg font-semibold text-brand-red">Maaf, berlaku ralat.</p>
                        <p className="text-gray-500 mt-2 max-w-md">{errorMessage}</p>
                        <button onClick={handleReset} className="mt-6 px-6 py-2 bg-brand-black text-white rounded-md hover:bg-gray-800">
                           Cuba Semula
                        </button>
                    </div>
                 );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
             {/* Hidden container for PDF chart generation */}
             {analysisResult && (
                <div ref={chartsRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '600px', background: 'white', padding: '1rem' }}>
                    <TenderCharts analysisResult={analysisResult.strategicSummary} />
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-brand-red" />
                    <div>
                        <h1 className="text-3xl font-bold text-brand-text">AI Tender Workspace</h1>
                        <p className="text-sm text-gray-500">Analisis Strategik & Penjanaan Harga BQ Automatik</p>
                    </div>
                </div>
                {analysisState === 'complete' && (
                     <div className="flex items-center space-x-4">
                        <button
                            onClick={handleGeneratePdf}
                            disabled={isGeneratingPdf}
                            className="flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-semibold disabled:opacity-60"
                        >
                            <PrinterIcon className="w-5 h-5"/>
                            <span>{isGeneratingPdf ? 'Menjana...' : 'Eksport PDF'}</span>
                        </button>
                        <button onClick={handleReset} className="text-sm font-semibold text-brand-red hover:underline">
                            Muat Naik Fail Lain
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 focus:outline-none ${
            isActive ? 'bg-white border-b-2 border-brand-red text-brand-red' : 'bg-transparent text-gray-500 hover:text-brand-text'
        }`}
    >
        {label}
    </button>
);


export default AITenderWorkspace;