
import React, { useState } from 'react';
import { Project, Quotation, CompanyInfo } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { EyeIcon } from './icons/EyeIcon';

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

interface BQPreviewModalProps {
  data: Project | Quotation;
  companyInfo: CompanyInfo;
  onClose: () => void;
}

const BQPreviewModal: React.FC<BQPreviewModalProps> = ({ data, companyInfo, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrices, setShowPrices] = useState(true);

  const isProject = 'projectName' in data;
  const docRef = isProject ? (data as Project).quotationNo : (data as Quotation).quotationNo;
  const title = isProject ? (data as Project).projectName : `KERJA-KERJA BAGI SEBUT HARGA NO: ${docRef}`;
  const items = data.items;

  const calculateTotal = () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(amount).replace(/^MYR/, '');
  };
  
  const handlePrint = async () => {
    setIsGenerating(true);
    try {
        // Load scripts sequentially
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js');

        const pdfMake = window.pdfMake;
        if (!pdfMake) throw new Error("PDF Library failed to load.");

        // Headers
        const tableBody: any[] = [
            [
                { text: 'BIL', style: 'tableHeader', alignment: 'center' },
                { text: 'KETERANGAN KERJA', style: 'tableHeader' },
                { text: 'UNIT', style: 'tableHeader', alignment: 'center' },
                { text: 'KUANTITI', style: 'tableHeader', alignment: 'center' },
                { text: 'KADAR (RM)', style: 'tableHeader', alignment: 'right' },
                { text: 'JUMLAH (RM)', style: 'tableHeader', alignment: 'right' }
            ]
        ];

        // Items
        items.forEach((item, index) => {
            tableBody.push([
                { text: (index + 1).toString(), alignment: 'center' },
                { text: item.description, alignment: 'justify' },
                { text: item.unit || '-', alignment: 'center' },
                { text: item.quantity.toString(), alignment: 'center' },
                { text: showPrices ? formatCurrency(item.unitPrice) : '', alignment: 'right' },
                { text: showPrices ? formatCurrency(item.quantity * item.unitPrice) : '', alignment: 'right', bold: true }
            ]);
        });

        // Total Row
        tableBody.push([
            { text: 'JUMLAH KESELURUHAN DIBAWA KE HADAPAN', colSpan: 5, alignment: 'right', bold: true, fillColor: '#eeeeee' },
            {}, {}, {}, {},
            { text: showPrices ? formatCurrency(calculateTotal()) : '', alignment: 'right', bold: true, fillColor: '#eeeeee' }
        ]);

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 120, 40, 60],
            header: {
                margin: [40, 20, 40, 0],
                table: {
                    widths: [80, '*', 80],
                    body: [
                        [
                            {
                                stack: companyInfo.logo ? [{ image: companyInfo.logo, width: 60, alignment: 'center' }] : [{ text: 'LOGO', alignment: 'center' }],
                                rowSpan: 2, alignment: 'center', margin: [0, 5]
                            },
                            {
                                stack: [
                                    { text: companyInfo.name.toUpperCase(), bold: true, fontSize: 12, alignment: 'center' },
                                    { text: `Reg No: ${companyInfo.registrationNo}`, fontSize: 9, alignment: 'center' }
                                ],
                                rowSpan: 2, margin: [0, 5]
                            },
                            { text: `BILL NO: 1`, fontSize: 8 }
                        ],
                        [
                            {}, {},
                            { text: `PAGE: 1 of 1`, fontSize: 8 } // Simple page logic for now
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i: number) => (i === 0 || i === 2) ? 1 : 0,
                    vLineWidth: (i: number) => 1
                }
            },
            content: [
                {
                    table: {
                        widths: ['*'],
                        body: [[{ text: title.toUpperCase(), bold: true, alignment: 'center', fillColor: '#eeeeee' }]]
                    },
                    margin: [0, 0, 0, 0] // Connects to header visually if possible
                },
                {
                    table: {
                        headerRows: 1,
                        // Expanded widths for Rate/Amount
                        widths: [25, '*', 35, 40, 80, 90],
                        body: tableBody
                    },
                    // Clean grid layout
                    layout: {
                        hLineWidth: (i: number, node: any) => 1,
                        vLineWidth: (i: number, node: any) => 1,
                        hLineColor: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 'black' : '#e5e7eb',
                        vLineColor: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 'black' : '#e5e7eb',
                        paddingLeft: (i: number) => 8,
                        paddingRight: (i: number) => 8,
                        paddingTop: (i: number) => 8,
                        paddingBottom: (i: number) => 8,
                    }
                },
                {
                    unbreakable: true,
                    margin: [0, 40, 0, 0],
                    columns: [
                        {
                            stack: [
                                { text: '__________________________' },
                                { text: 'TANDATANGAN KONTRAKTOR', fontSize: 9, bold: true },
                                { text: `NAMA: ${companyInfo.name}`, fontSize: 9 },
                                { text: `TARIKH: ${new Date().toLocaleDateString('en-GB')}`, fontSize: 9 }
                            ]
                        },
                        {
                            stack: [
                                { 
                                    text: 'RUANG COP RASMI', 
                                    alignment: 'center', 
                                    color: '#aaa', 
                                    margin: [20, 20], 
                                    decoration: 'underline', 
                                    decorationStyle: 'dashed' 
                                },
                                { text: 'COP SYARIKAT', fontSize: 9, bold: true, alignment: 'center' }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                tableHeader: { bold: true, fontSize: 10, alignment: 'center', fillColor: '#eeeeee' }
            }
        };

        pdfMake.createPdf(docDefinition).download(`BQ-${docRef}${!showPrices ? '-Blank' : ''}.pdf`);

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
          <h3 className="text-lg font-bold text-gray-800">Senarai Kuantiti (Bill of Quantities)</h3>
          <div className="flex items-center space-x-4">
            
            <label className="flex items-center cursor-pointer select-none space-x-2 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                <div className="relative">
                    <input type="checkbox" className="sr-only" checked={showPrices} onChange={() => setShowPrices(!showPrices)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${showPrices ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showPrices ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="flex items-center text-sm font-semibold text-gray-700">
                    <EyeIcon className="w-4 h-4 mr-1"/>
                    {showPrices ? 'Papar Harga' : 'Sembunyi Harga'}
                </div>
            </label>

            <button onClick={handlePrint} disabled={isGenerating} className="flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black rounded-lg hover:opacity-90 transition shadow-sm font-semibold disabled:opacity-50">
              <PrinterIcon className="w-4 h-4" />
              <span>{isGenerating ? 'Menjana...' : 'Muat Turun PDF (A4)'}</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* HTML Preview Area */}
        <div className="overflow-y-auto bg-gray-600 p-8 flex justify-center flex-1">
          <div className="bg-white shadow-2xl relative flex flex-col w-[210mm] min-h-[297mm] p-[15mm]">
                {/* Header Box */}
                <div className="border-2 border-black mb-0">
                    <div className="flex">
                        <div className="w-[25%] border-r-2 border-black p-2 flex items-center justify-center">
                             {companyInfo.logo ? (
                                <img src={companyInfo.logo} alt="Company Logo" className="max-h-16 max-w-full object-contain" />
                            ) : (
                                <div className="text-center font-bold text-xl">{companyInfo.name.substring(0, 3)}</div>
                            )}
                        </div>
                        <div className="w-[50%] border-r-2 border-black p-2 flex flex-col justify-center text-center">
                            <h1 className="font-bold text-sm uppercase">{companyInfo.name}</h1>
                            <p className="text-[10px]">{companyInfo.registrationNo}</p>
                        </div>
                        <div className="w-[25%] text-xs">
                            <div className="border-b border-black p-1 flex justify-between">
                                <span className="font-bold">BILL NO:</span><span>1</span>
                            </div>
                            <div className="p-1 flex justify-between">
                                <span className="font-bold">PAGE:</span><span>1</span>
                            </div>
                        </div>
                    </div>
                    <div className="border-t-2 border-black bg-gray-200 text-center py-1 px-4 font-bold text-sm uppercase">
                        {title}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-grow">
                    <table className="w-full text-xs border-collapse border-x-2 border-b-2 border-black table-fixed">
                        <thead>
                            <tr className="bg-gray-200 text-center">
                                <th className="border-r border-b border-black w-[8%] py-3">BIL</th>
                                <th className="border-r border-b border-black w-[47%] py-3">KETERANGAN</th>
                                <th className="border-r border-b border-black w-[10%] py-3">UNIT</th>
                                <th className="border-r border-b border-black w-[10%] py-3">QTY</th>
                                <th className="border-r border-b border-black w-[12%] py-3">KADAR</th>
                                <th className="border-b border-black w-[13%] py-3">JUMLAH</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="align-top hover:bg-gray-50">
                                    <td className="border-r border-black p-2 text-center border-b">{index + 1}</td>
                                    <td className="border-r border-black p-2 text-justify break-words whitespace-pre-wrap border-b">
                                        <span className="font-bold block mb-0.5">{item.description}</span>
                                    </td>
                                    <td className="border-r border-black p-2 text-center border-b">{item.unit || '-'}</td>
                                    <td className="border-r border-black p-2 text-center border-b">{item.quantity}</td>
                                    <td className="border-r border-black p-2 text-right whitespace-nowrap border-b">
                                        {showPrices ? formatCurrency(item.unitPrice) : ''}
                                    </td>
                                    <td className="p-2 text-right font-semibold whitespace-nowrap border-b">
                                        {showPrices ? formatCurrency(item.quantity * item.unitPrice) : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black font-bold">
                                <td colSpan={5} className="border-r border-black p-2 text-right uppercase">
                                    Jumlah Keseluruhan Dibawa Ke Hadapan
                                </td>
                                <td className="p-2 text-right">
                                    {showPrices ? formatCurrency(calculateTotal()) : ''}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-8 text-xs font-sans break-inside-avoid">
                    <div className="flex flex-col justify-end">
                        <div className="h-16 mb-1 border-b border-black"></div> 
                        <p className="font-bold">SIGNATURE (CONTRACTOR)</p>
                        <div className="mt-1">
                            <p>NAME: <span className="uppercase">{companyInfo.name}</span></p>
                            <p>DATE: {new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end text-center">
                         <div className="h-20 w-full mb-1 flex items-center justify-center border border-black border-dashed bg-gray-50 text-gray-400 italic">
                            RUANG COP RASMI
                        </div>
                        <p className="font-bold">COMPANY STAMP</p>
                    </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BQPreviewModal;
