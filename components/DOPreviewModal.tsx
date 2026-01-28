
import React, { useState } from 'react';
import { Project, CompanyInfo } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { PrinterIcon } from './icons/PrinterIcon';

declare global {
  interface Window {
    pdfMake: any;
  }
}

const scriptPromises: Record<string, Promise<void>> = {};
const loadScript = (src: string): Promise<void> => {
    if (scriptPromises[src]) return scriptPromises[src];
    scriptPromises[src] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => { delete scriptPromises[src]; reject(new Error(`Failed to load script: ${src}.`)); };
        document.head.appendChild(script);
    });
    return scriptPromises[src];
};

interface DOPreviewModalProps {
  project: Project;
  companyInfo: CompanyInfo;
  onClose: () => void;
}

const DOPreviewModal: React.FC<DOPreviewModalProps> = ({ project, companyInfo, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
        // Load scripts sequentially
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js');

        const pdfMake = window.pdfMake;
        if (!pdfMake) throw new Error("PDF Library failed to load.");

        // Table Rows
        const tableBody: any[] = [
            [
                { text: 'NO', style: 'tableHeader', alignment: 'center' },
                { text: 'DESKRIPSI BARANG / PERKHIDMATAN', style: 'tableHeader' },
                { text: 'KUANTITI', style: 'tableHeader', alignment: 'center' },
                { text: 'SEMAKAN', style: 'tableHeader', alignment: 'center' }
            ]
        ];

        project.items.forEach((item, index) => {
            tableBody.push([
                { text: (index + 1).toString(), alignment: 'center', margin: [0, 5] },
                { text: item.description, margin: [0, 5] },
                { text: item.quantity.toString(), alignment: 'center', bold: true, margin: [0, 5] },
                { text: '[   ]', alignment: 'center', margin: [0, 5] } // Checkbox placeholder
            ]);
        });

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 110, 40, 60],
            header: {
                margin: [40, 20, 40, 0],
                columns: [
                    companyInfo.logo ? { image: companyInfo.logo, width: 60, margin: [0, 0, 20, 0] } : { text: '', width: 0 },
                    {
                        stack: [
                            { text: companyInfo.name.toUpperCase(), style: 'companyName' },
                            { text: companyInfo.registrationNo, style: 'companyDetails' },
                            { text: companyInfo.address, style: 'companyDetails' },
                            { text: `Tel: ${companyInfo.tel}`, style: 'companyDetails' }
                        ],
                        width: '*'
                    },
                    {
                        stack: [
                            { text: 'DELIVERY ORDER', style: 'docTitle', alignment: 'right' },
                            { text: `DO No: DO-${project.quotationNo.replace('QUO-', '')}`, style: 'docMeta', alignment: 'right' },
                            { text: `Date: ${new Date().toLocaleDateString('en-GB')}`, style: 'docMeta', alignment: 'right' }
                        ],
                        width: 150
                    }
                ]
            },
            content: [
                {
                    style: 'clientBox',
                    table: {
                        widths: ['*', '*'],
                        body: [[
                            {
                                stack: [
                                    { text: 'KEPADA (PELANGGAN):', style: 'label' },
                                    { text: project.client.name.toUpperCase(), style: 'clientName' },
                                    { text: project.client.company || '', style: 'clientText' },
                                    { text: project.client.address, style: 'clientText' }
                                ],
                                border: [false, false, false, false],
                                fillColor: '#f9f9f9'
                            },
                            {
                                stack: [
                                    { text: 'MAKLUMAT PROJEK:', style: 'label' },
                                    { text: project.projectName, style: 'clientText', bold: true },
                                    { text: `Ruj: ${project.quotationNo}`, style: 'clientText', fontSize: 9 }
                                ],
                                border: [true, true, true, true],
                                borderColor: ['#ddd', '#ddd', '#ddd', '#ddd'],
                                margin: [10, 0, 0, 0]
                            }
                        ]]
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 20]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [30, '*', 50, 50],
                        body: tableBody
                    },
                    layout: 'lightHorizontalLines'
                },
                {
                    margin: [0, 40, 0, 0],
                    text: 'Saya/Kami mengaku telah menerima barang/perkhidmatan tersebut di atas dalam keadaan baik dan sempurna.',
                    style: 'disclaimer',
                    alignment: 'center',
                    italics: true
                },
                {
                    unbreakable: true,
                    margin: [0, 60, 0, 0],
                    columns: [
                        {
                            stack: [
                                { text: 'Diserahkan Oleh:', style: 'label' },
                                { text: '\n\n\n__________________________' },
                                { text: companyInfo.name.toUpperCase(), style: 'signatureName' },
                                { text: '(Tandatangan & Tarikh)', style: 'signatureLabel' }
                            ]
                        },
                        {
                            stack: [
                                { text: 'Diterima Oleh:', style: 'label' },
                                { text: '\n\n\n__________________________' },
                                { text: project.client.name.toUpperCase(), style: 'signatureName' },
                                { text: '(Tandatangan & Cop Rasmi)', style: 'signatureLabel' }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                companyName: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
                companyDetails: { fontSize: 9, color: '#555', margin: [0, 0, 0, 1] },
                docTitle: { fontSize: 18, bold: true, color: '#000' },
                docMeta: { fontSize: 10, margin: [0, 2, 0, 0] },
                tableHeader: { fontSize: 10, bold: true, color: 'white', fillColor: '#000', margin: [0, 5] },
                label: { fontSize: 9, bold: true, color: '#555', margin: [0, 0, 0, 2] },
                clientName: { fontSize: 11, bold: true, margin: [0, 2, 0, 1] },
                clientText: { fontSize: 10, margin: [0, 1, 0, 1] },
                disclaimer: { fontSize: 9, color: '#666', margin: [0, 10] },
                signatureName: { fontSize: 10, bold: true, margin: [0, 5, 0, 0] },
                signatureLabel: { fontSize: 9, color: '#777' }
            }
        };

        pdfMake.createPdf(docDefinition).download(`DO-${project.quotationNo}.pdf`);

    } catch (error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-800">Nota Serahan (Delivery Order)</h3>
          <div className="flex items-center space-x-3">
            <button onClick={handlePrint} disabled={isGenerating} className="flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black rounded-lg hover:opacity-90 transition shadow-sm font-semibold disabled:opacity-50">
              <PrinterIcon className="w-4 h-4" />
              <span>{isGenerating ? 'Menjana PDF...' : 'Muat Turun PDF (A4)'}</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* HTML Preview */}
        <div className="overflow-y-auto bg-gray-600 p-8 flex justify-center flex-1">
          <div className="bg-white shadow-lg p-10 min-h-[297mm] w-[210mm] relative flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                    <div className="w-2/3">
                        {companyInfo.logo ? (
                            <img src={companyInfo.logo} alt="Logo" className="h-16 w-auto object-contain mb-4" />
                        ) : (
                            <h1 className="text-2xl font-bold uppercase mb-2 text-brand-black">{companyInfo.name}</h1>
                        )}
                        <div className="text-xs text-gray-600 font-medium leading-relaxed">
                            <p className="w-3/4">{companyInfo.address}</p>
                            <p className="mt-1"><span className="font-bold">Reg:</span> {companyInfo.registrationNo}</p>
                            <p><span className="font-bold">Tel:</span> {companyInfo.tel}</p>
                        </div>
                    </div>
                    <div className="w-1/3 text-right">
                        <h2 className="text-3xl font-bold text-brand-black uppercase mb-1">DELIVERY ORDER</h2>
                        <div className="mt-4 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">No. DO:</span><span className="font-bold">DO-{project.quotationNo.replace('QUO-', '')}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tarikh:</span><span className="font-bold">{new Date().toLocaleDateString('en-GB')}</span></div>
                        </div>
                    </div>
                </div>

                {/* Client & Project Info */}
                <div className="mb-8 flex gap-8">
                    <div className="w-1/2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kepada:</p>
                        <div className="p-4 bg-gray-50 border-l-4 border-brand-black rounded-r-md">
                            <p className="font-bold text-lg text-gray-900">{project.client.name}</p>
                            {project.client.company && <p className="text-sm font-semibold text-gray-700">{project.client.company}</p>}
                            <p className="text-sm text-gray-600 mt-1 leading-snug">{project.client.address}</p>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Projek:</p>
                        <div className="p-3 border border-gray-200 rounded bg-white">
                            <p className="font-bold text-gray-900">{project.projectName}</p>
                            <p className="text-xs text-gray-500 mt-1">Ref: {project.quotationNo}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-grow">
                    <table className="w-full text-sm border-collapse table-fixed">
                        <thead>
                            <tr className="bg-brand-black text-white">
                                <th className="py-2 px-4 text-center w-[10%] font-bold border border-gray-800">NO</th>
                                <th className="py-2 px-4 text-left w-[60%] font-bold border border-gray-800">DESKRIPSI BARANG</th>
                                <th className="py-2 px-4 text-center w-[15%] font-bold border border-gray-800">KUANTITI</th>
                                <th className="py-2 px-4 text-center w-[15%] font-bold border border-gray-800">SEMAKAN</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            {project.items.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-200 align-top hover:bg-gray-50">
                                    <td className="py-3 px-4 text-center border-x border-gray-200">{index + 1}</td>
                                    <td className="py-3 px-4 font-medium border-x border-gray-200 break-words whitespace-pre-wrap">{item.description}</td>
                                    <td className="py-3 px-4 text-center font-bold border-x border-gray-200">{item.quantity}</td>
                                    <td className="py-3 px-4 text-center border-x border-gray-200">
                                        <div className="w-5 h-5 border-2 border-gray-300 inline-block rounded-sm"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Signatures */}
                <div className="mt-8 pt-6 pb-6 break-inside-avoid">
                    <p className="text-xs text-gray-500 mb-8 italic text-center">Saya/Kami mengaku telah menerima barang/perkhidmatan tersebut di atas dalam keadaan baik dan sempurna.</p>
                    
                    <div className="grid grid-cols-2 gap-16">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-12">Diserahkan Oleh:</p>
                            <div className="pt-2 border-t border-gray-400">
                                <p className="font-bold text-sm text-brand-black uppercase">{companyInfo.name}</p>
                                <p className="text-xs text-gray-400">Tandatangan & Tarikh</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-12">Diterima Oleh:</p>
                            <div className="pt-2 border-t border-gray-400">
                                <p className="font-bold text-sm text-brand-black uppercase">{project.client.name}</p>
                                <p className="text-xs text-gray-400">(Tandatangan & Cop Rasmi)</p>
                            </div>
                        </div>
                    </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOPreviewModal;
