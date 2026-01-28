import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AIProject, ProjectFile, ExtractedData, FileCategory } from '../../types';
import { extractTextFromFile } from '../../utils/fileExtractor';
import { XMarkIcon } from '../icons/XMarkIcon';
import { ArrowUpTrayIcon } from '../icons/ArrowUpTrayIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface FileUploadModalProps {
    projects: AIProject[];
    onClose: () => void;
    onFileProcessed: (file: ProjectFile, projectId: string) => void;
    onNewProject: (projectName: string, firstFile: ProjectFile) => void;
}

type ModalState = 'uploading' | 'parsing' | 'analyzing' | 'confirming' | 'creating_project' | 'error';

interface AIResponse {
    fileCategory: FileCategory;
    summary: string;
    extractedData: ExtractedData;
    suggestedProjectId: string; // 'new' or an existing project ID
    suggestionConfidence: number; // 0-1
    suggestedProjectName?: string; // Only if suggestedProjectId is 'new'
}


const FileUploadModal: React.FC<FileUploadModalProps> = ({ projects, onClose, onFileProcessed, onNewProject }) => {
    const [modalState, setModalState] = useState<ModalState>('uploading');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [newProjectName, setNewProjectName] = useState('');

    const handleFileProcess = useCallback(async (uploadedFile: File) => {
        setFile(uploadedFile);
        setError('');

        // Step 1: Parse Text
        setModalState('parsing');
        let extractedText = '';
        try {
            extractedText = await extractTextFromFile(uploadedFile);
            if (!extractedText.trim()) throw new Error("No readable text found in the file.");
        } catch (err: any) {
            setError(err.message);
            setModalState('error');
            return;
        }

        // Step 2: Analyze with Gemini
        setModalState('analyzing');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                 type: Type.OBJECT, properties: {
                    fileCategory: { type: Type.STRING, enum: ['Financial', 'Cost', 'Procurement', 'Commercial', 'Operational', 'Communication', 'Other'] },
                    summary: { type: Type.STRING },
                    extractedData: {
                        type: Type.OBJECT, properties: {
                            docNo: { type: Type.STRING }, vendor: { type: Type.STRING }, date: { type: Type.STRING },
                            totalAmount: { type: Type.NUMBER }, confidenceScore: { type: Type.NUMBER },
                        }
                    },
                    suggestedProjectId: { type: Type.STRING },
                    suggestionConfidence: { type: Type.NUMBER },
                    suggestedProjectName: { type: Type.STRING }
                },
                required: ['fileCategory', 'summary', 'extractedData', 'suggestedProjectId', 'suggestionConfidence']
            };

            const projectContext = projects.map(p => `ID: ${p.id}, Name: ${p.projectName}, Files: ${p.files.map(f => f.fileName).join(', ')}`).join('\n');

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an AI Document Classifier for a construction company. Your task is to analyze the text from an uploaded document, classify it, extract key data, and intelligently suggest which project it belongs to.

**Context - Existing Projects:**
${projectContext || 'No existing projects.'}

**Document Text to Analyze:**
---
${extractedText}
---

**Your Task:**
1.  **Classify Category:** Determine the file's category.
2.  **Summarize:** Write a 1-sentence summary.
3.  **Extract Data:** Pull out key fields like document number, vendor, date, and total amount. Assign a confidence score (0-1) for the extracted data. If a field is not found, omit it.
4.  **Suggest Project:** Based on the document content and the list of existing projects, determine the most likely project this file belongs to.
    - If a strong match is found, provide the existing project's ID in 'suggestedProjectId' and a high 'suggestionConfidence'.
    - If it seems to be for a new project, set 'suggestedProjectId' to "new" and create a plausible 'suggestedProjectName' based on the document's content (e.g., "Projek Pembinaan Pagar di Taman Seri").
5.  Return a single, valid JSON object that adheres to the schema.`,
                config: { responseMimeType: 'application/json', responseSchema: schema }
            });
            
            const result = JSON.parse(response.text) as AIResponse;
            setAiResponse(result);
            setSelectedProjectId(result.suggestedProjectId || 'new');
            setNewProjectName(result.suggestedProjectName || '');
            setModalState('confirming');

        } catch (err: any) {
            console.error(err);
            setError("AI analysis failed. The document might be in an unsupported format or the AI service is busy.");
            setModalState('error');
        }
    }, [projects]);
    
    const handleConfirm = () => {
        if (!aiResponse || !file) return;

        const newFile: ProjectFile = {
            id: `file-${Date.now()}`,
            fileName: file.name,
            fileType: 'PDF', // Simplified for now
            category: aiResponse.fileCategory,
            uploadDate: new Date().toLocaleDateString('en-GB'),
            summary: aiResponse.summary,
            extractedData: aiResponse.extractedData,
            status: aiResponse.extractedData.confidenceScore > 0.8 ? 'Verified' : 'Pending Review',
        };

        if (selectedProjectId === 'new') {
            if (!newProjectName.trim()) {
                alert("Please provide a name for the new project.");
                return;
            }
            onNewProject(newProjectName, newFile);
        } else {
            onFileProcessed(newFile, selectedProjectId);
        }
        onClose();
    };

    const renderContent = () => {
        switch (modalState) {
            case 'parsing': return <StateView icon={<SparklesIcon/>} title="Parsing Document..." subtitle={`Reading content from ${file?.name}`} />;
            case 'analyzing': return <StateView icon={<SparklesIcon/>} title="AI is Analyzing..." subtitle="Classifying, summarizing, and extracting key data." />;
            case 'error': return <StateView icon={<span>❗️</span>} title="An Error Occurred" subtitle={error} isError />;
            case 'confirming':
                if (!aiResponse) return null;
                const suggestedProject = projects.find(p => p.id === aiResponse.suggestedProjectId);
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold">AI Analysis Complete</h3>
                        <div className="my-4 p-4 bg-gray-50 rounded-lg border space-y-2 text-sm">
                            <p><strong>File:</strong> {file?.name}</p>
                            <p><strong>Category:</strong> {aiResponse.fileCategory}</p>
                            <p><strong>Summary:</strong> {aiResponse.summary}</p>
                            <p><strong>Amount:</strong> {aiResponse.extractedData.totalAmount ? formatCurrency(aiResponse.extractedData.totalAmount) : 'N/A'}</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Assign to Project</h4>
                            <p className="text-xs text-gray-500 -mt-2">AI suggests: <span className="font-bold">{suggestedProject?.projectName || 'New Project'}</span> (Confidence: {(aiResponse.suggestionConfidence * 100).toFixed(0)}%)</p>
                            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full p-2 border rounded-md">
                                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                                <option value="new">-- Create New Project --</option>
                            </select>
                            {selectedProjectId === 'new' && (
                                <input type="text" placeholder="Enter new project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full p-2 border rounded-md" />
                            )}
                        </div>
                         <div className="flex justify-end gap-2 mt-6">
                            <button onClick={onClose} className="px-4 py-2 text-sm rounded-md hover:bg-gray-100">Cancel</button>
                            <button onClick={handleConfirm} className="px-4 py-2 text-sm rounded-md bg-brand-gold font-semibold">Confirm & Save</button>
                        </div>
                    </div>
                );
            default: // uploading
                return <UploadDropzone onFileSelect={handleFileProcess} />;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"><XMarkIcon /></button>
                {renderContent()}
            </div>
        </div>
    );
};

const UploadDropzone: React.FC<{onFileSelect: (file: File) => void}> = ({onFileSelect}) => {
    const [isDragging, setIsDragging] = useState(false);
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onFileSelect(e.dataTransfer.files[0]);
    };

    return (
        <div 
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            className={`m-4 p-8 border-2 border-dashed rounded-lg text-center transition-colors ${isDragging ? 'border-brand-gold bg-yellow-50' : 'border-gray-300'}`}
        >
            <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 font-semibold">Drag & drop a file</h3>
            <p className="text-sm text-gray-500">or</p>
            <input type="file" id="modal-file-upload" className="hidden" onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} />
            <label htmlFor="modal-file-upload" className="mt-2 inline-block px-4 py-2 text-sm font-semibold bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">Browse</label>
            <p className="text-xs text-gray-400 mt-2">PDF, DOCX, XLSX, Images, Emails</p>
        </div>
    );
};

const StateView: React.FC<{icon: React.ReactNode, title: string, subtitle: string, isError?: boolean}> = ({icon, title, subtitle, isError}) => (
    <div className="p-12 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl ${isError ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 animate-pulse'}`}>
            {icon}
        </div>
        <h3 className="mt-4 font-semibold text-lg">{title}</h3>
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-gray-500'}`}>{subtitle}</p>
    </div>
);

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);

export default FileUploadModal;
