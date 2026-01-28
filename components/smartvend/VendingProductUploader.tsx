import React, { useState, useCallback } from 'react';
import { MachineProfile } from '../../types';
import { ArrowUpTrayIcon } from '../icons/ArrowUpTrayIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

declare global {
    interface Window { XLSX: any; }
}

// --- Dynamic Script Loader ---
const XLSX_SCRIPT_SRC = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
let xlsxScriptPromise: Promise<void> | null = null;

const loadXlsxScript = (): Promise<void> => {
    // If script is already available, return resolved promise
    if (typeof window.XLSX !== 'undefined') {
        return Promise.resolve();
    }
    // If script is already being loaded, return the existing promise
    if (xlsxScriptPromise) {
        return xlsxScriptPromise;
    }
    // Otherwise, create a new promise to load the script
    xlsxScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = XLSX_SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            xlsxScriptPromise = null; // Allow retrying on failure
            reject(new Error("Excel library could not be loaded. Please check your internet connection and disable any ad-blockers."));
        };
        document.head.appendChild(script);
    });
    return xlsxScriptPromise;
};
// --- End Script Loader ---


interface VendingProductUploaderProps {
    machineProfile: MachineProfile;
    onSubmit: (profile: MachineProfile, rawFileText: string) => void;
}

const VendingProductUploader: React.FC<VendingProductUploaderProps> = ({ machineProfile, onSubmit }) => {
    const [rawText, setRawText] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const parseFile = useCallback(async (file: File) => {
        if (!file) return;
        setFileName(file.name);
        setError('');
        setIsParsing(true);

        try {
            await loadXlsxScript(); // Ensure the XLSX library is loaded before proceeding

            const rawTextContent = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = window.XLSX.read(data, { type: 'array' });
                        
                        let fullTextContent = '';
                        workbook.SheetNames.forEach((sheetName: string) => {
                            const worksheet = workbook.Sheets[sheetName];
                            const csvData = window.XLSX.utils.sheet_to_csv(worksheet);
                            fullTextContent += `--- Sheet: ${sheetName} ---\n${csvData}\n\n`;
                        });

                        if (!fullTextContent.trim()) {
                            throw new Error("No text could be extracted from the file. Please ensure it's a valid Excel/CSV file.");
                        }
                        resolve(fullTextContent);
                    } catch (err) {
                        reject(err instanceof Error ? err : new Error("Failed to parse the Excel file. It might be corrupted."));
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read the file from disk."));
                reader.readAsArrayBuffer(file);
            });
            
            setRawText(rawTextContent);

        } catch (err: any) {
            setError(err.message || "An unknown error occurred during file processing.");
            setRawText('');
            setFileName('');
        } finally {
            setIsParsing(false);
        }
    }, []);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) parseFile(e.target.files[0]);
    };
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); if (!isParsing) setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isParsing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            parseFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleSubmit = () => {
        if (rawText) {
            onSubmit(machineProfile, rawText);
        } else {
            setError("Please upload a valid product file before analyzing.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mt-6">
            <h2 className="text-xl font-bold text-brand-text mb-1">2. Upload Product List</h2>
            <p className="text-sm text-gray-500 mb-6">Upload a CSV or Excel file. The AI will automatically find and analyze the product data, even if the sheet is messy.</p>
            
            <div className="space-y-4">
                 <div 
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors duration-300 ${isParsing ? 'border-gray-300 bg-gray-100 cursor-wait' : isDragging ? 'border-brand-gold bg-yellow-50' : 'border-gray-300 bg-gray-50'}`}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                >
                    {isParsing ? (
                        <div className="text-center">
                            <SparklesIcon className="w-12 h-12 text-brand-gold animate-pulse mx-auto mb-2" />
                            <h3 className="text-md font-semibold text-brand-text">Processing File...</h3>
                            <p className="text-sm text-gray-500">{fileName}</p>
                        </div>
                    ) : (
                        <>
                            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
                            <h3 className="text-md font-semibold text-brand-text">Drag & Drop Your Product File Here</h3>
                            <p className="text-gray-500 text-sm mt-1">or</p>
                            <label htmlFor="product-file-upload" className="mt-2 px-4 py-2 bg-gray-200 text-brand-text text-sm font-semibold rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                                Browse File
                            </label>
                            <input id="product-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" disabled={isParsing} />
                            <p className="text-xs text-gray-400 mt-2">AI will look for columns like Product Name, Category, Cost Price, Sell Price.</p>
                        </>
                    )}
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                
                {fileName && !error && !isParsing && (
                     <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                        Successfully loaded file <span className="font-bold">{fileName}</span>. Ready for AI analysis.
                    </div>
                )}
                
                <div className="flex justify-end pt-4">
                     <button 
                        onClick={handleSubmit} 
                        disabled={!rawText || isParsing}
                        className="px-8 py-3 bg-brand-gold text-brand-black font-bold rounded-md hover:opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Analyze Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendingProductUploader;