import React, { useState } from 'react';
import { DetailedBQAnalysisResult, BQSection } from '../types';
import { TableCellsIcon } from './icons/TableCellsIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

// Inform TypeScript about the global XLSX variable from the CDN script.
declare global {
    interface Window {
        XLSX: any;
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount).replace('MYR', '');
};

const Section: React.FC<{ section: BQSection; isOpen: boolean; onToggle: () => void }> = ({ section, isOpen, onToggle }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const header = "No\tPerihalan Kerja\tUnit\tKuantiti\tHarga Seunit (RM)\tJumlah (RM)";
        const rows = section.items.map(item => 
            `${item.no}\t${item.perihalanKerja}\t${item.unit}\t${item.kuantiti}\t${item.hargaSeunit.toFixed(2)}\t${item.jumlah.toFixed(2)}`
        ).join('\n');
        const subtotal = `\n\tJumlah Seksyen ${section.title}:\t\t\t\tRM ${section.subtotal.toFixed(2)}`;
        
        navigator.clipboard.writeText(`${header}\n${rows}${subtotal}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex-1">
                    <h3 className="font-bold text-brand-text">{section.title}</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-600">Jumlah Seksyen: <span className="font-bold text-brand-red">RM {formatCurrency(section.subtotal)}</span></span>
                    <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                        {copied ? <CheckCircleIcon className="w-5 h-5 text-green-600" /> : <ClipboardIcon className="w-5 h-5 text-gray-500" />}
                    </button>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-500">
                            <tr className="border-b">
                                <th className="p-2 w-12">No</th>
                                <th className="p-2">Perihalan Kerja</th>
                                <th className="p-2 w-20 text-center">Unit</th>
                                <th className="p-2 w-24 text-center">Kuantiti</th>
                                <th className="p-2 w-32 text-right">Harga Seunit (RM)</th>
                                <th className="p-2 w-32 text-right">Jumlah (RM)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {section.items.map((item, index) => (
                                <tr key={item.no} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                    <td className="p-2 font-semibold text-center">{item.no}</td>
                                    <td className="p-2 text-brand-text">{item.perihalanKerja}</td>
                                    <td className="p-2 text-center">{item.unit}</td>
                                    <td className="p-2 text-center">{item.kuantiti}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.hargaSeunit)}</td>
                                    <td className="p-2 text-right font-semibold text-brand-text">{formatCurrency(item.jumlah)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DetailedBQPricingTable: React.FC<{ analysisResult: DetailedBQAnalysisResult }> = ({ analysisResult }) => {
    const [openSections, setOpenSections] = useState<Set<string>>(
        new Set(analysisResult.sections.map(s => s.id))
    );
    const [isExporting, setIsExporting] = useState(false);

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };
    
    const handleExportToExcel = () => {
        setIsExporting(true);
        if (typeof window.XLSX === 'undefined') {
            alert("Excel export library failed to load. Please check your internet connection and try again.");
            setIsExporting(false);
            return;
        }

        try {
            const dataForExcel: any[] = [];
            analysisResult.sections.forEach(section => {
                section.items.forEach(item => {
                    dataForExcel.push({
                        'Seksyen': section.title,
                        'No. Item': item.no,
                        'Perihalan Kerja': item.perihalanKerja,
                        'Unit': item.unit,
                        'Kuantiti': item.kuantiti,
                        'Harga Seunit (RM)': item.hargaSeunit,
                        'Jumlah (RM)': item.jumlah
                    });
                });
                // Add subtotal row for the section
                dataForExcel.push({
                    'Seksyen': '',
                    'No. Item': '',
                    'Perihalan Kerja': `JUMLAH UNTUK ${section.title.toUpperCase()}`,
                    'Unit': '',
                    'Kuantiti': '',
                    'Harga Seunit (RM)': '',
                    'Jumlah (RM)': section.subtotal,
                });
                 dataForExcel.push({}); // Add an empty row for spacing
            });

            dataForExcel.push({}); // Add an empty row for spacing

            // Add grand total row
            dataForExcel.push({
                'Seksyen': '',
                'No. Item': '',
                'Perihalan Kerja': 'JUMLAH KESELURUHAN PROJEK',
                'Unit': '',
                'Kuantiti': '',
                'Harga Seunit (RM)': '',
                'Jumlah (RM)': analysisResult.grandTotal,
            });

            const worksheet = window.XLSX.utils.json_to_sheet(dataForExcel);

            // Set column widths
            worksheet['!cols'] = [
                { wch: 30 }, { wch: 10 }, { wch: 60 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
            ];
            
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, "BQ Pricing");
            window.XLSX.writeFile(workbook, "BQ_Pricing_Analysis.xlsx");

        } catch (error) {
            console.error("Failed to export to excel", error);
            alert("Sorry, there was an error exporting to Excel.");
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-xl font-bold text-brand-text">Hasil Analisis Harga BQ</h2>
                <button 
                    onClick={handleExportToExcel}
                    disabled={isExporting}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-semibold disabled:opacity-60"
                >
                    <TableCellsIcon className="w-5 h-5" />
                    <span>{isExporting ? 'Mengeksport...' : 'Eksport BQ ke Excel'}</span>
                </button>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {analysisResult.sections.map(section => (
                    <Section 
                        key={section.id} 
                        section={section}
                        isOpen={openSections.has(section.id)}
                        onToggle={() => toggleSection(section.id)}
                    />
                ))}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t">
                <div className="text-right">
                    <p className="text-lg font-semibold text-gray-600">JUMLAH KESELURUHAN PROJEK:</p>
                    <p className="text-3xl font-bold text-brand-red">RM {formatCurrency(analysisResult.grandTotal)}</p>
                </div>
            </div>
        </div>
    );
};

export default DetailedBQPricingTable;