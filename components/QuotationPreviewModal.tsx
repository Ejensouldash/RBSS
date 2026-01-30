
import React, { useMemo, useState } from 'react';
import { Quotation, CompanyInfo } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { PrinterIcon } from './icons/PrinterIcon';

declare global {
  interface Window {
    pdfMake: any;
  }
}

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
        script.onerror = () => { delete scriptPromises[src]; reject(new Error(`Failed to load script: ${src}.`)); };
        document.head.appendChild(script);
    });
    return scriptPromises[src];
};

interface QuotationPreviewModalProps {
  quotation: Quotation;
  companyInfo: CompanyInfo;
  onClose: () => void;
}

const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({ quotation, companyInfo, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { subtotal, tax, grandTotal } = useMemo(() => {
    const sub = quotation.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxRate = companyInfo.taxRate / 100;
    const taxAmount = sub * taxRate;
    const total = sub + taxAmount;
    return { subtotal: sub, tax: taxAmount, grandTotal: total };
  }, [quotation.items, companyInfo.taxRate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace(/^MYR/, 'RM ');
  };
  
  const handlePrint = async () => {
    setIsGenerating(true);
    try {
        // Load scripts sequentially to avoid race conditions
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js');

        const pdfMake = window.pdfMake;
        if (!pdfMake) throw new Error("PDF Library failed to load.");

        // Prepare Data for PDF
        const tableBody = [];
        
        // Table Header
        tableBody.push([
            { text: 'NO', style: 'tableHeader', alignment: 'center' },
            { text: 'KETERANGAN KERJA', style: 'tableHeader' },
            { text: 'QTY', style: 'tableHeader', alignment: 'center' },
            { text: 'UNIT', style: 'tableHeader', alignment: 'center' },
            { text: 'KADAR (RM)', style: 'tableHeader', alignment: 'right' },
            { text: 'JUMLAH (RM)', style: 'tableHeader', alignment: 'right' }
        ]);

        // Table Rows
        quotation.items.forEach((item, index) => {
            tableBody.push([
                { text: (index + 1).toString(), alignment: 'center' },
                { text: item.description, alignment: 'justify' }, // Justify description for neatness
                { text: item.quantity.toString(), alignment: 'center' },
                { text: item.unit || '-', alignment: 'center' },
                { text: formatCurrency(item.unitPrice).replace('RM ', ''), alignment: 'right' },
                { text: formatCurrency(item.quantity * item.unitPrice).replace('RM ', ''), alignment: 'right', bold: true }
            ]);
        });

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 110, 40, 60], // Top margin increased for header space
            header: {
                margin: [40, 20, 40, 0],
                columns: [
                    // Logo Section
                    companyInfo.logo ? {
                        image: companyInfo.logo,
                        width: 60,
                        margin: [0, 0, 20, 0]
                    } : { text: '', width: 0 },
                    // Company Details
                    {
                        stack: [
                            { text: companyInfo.name.toUpperCase(), style: 'companyName' },
                            { text: companyInfo.registrationNo, style: 'companyDetails' },
                            { text: companyInfo.address, style: 'companyDetails' },
                            { text: `Tel: ${companyInfo.tel} | Email: ${companyInfo.email}`, style: 'companyDetails' }
                        ],
                        width: '*'
                    },
                    // Doc Details
                    {
                        stack: [
                            { text: 'SEBUT HARGA', style: 'docTitle', alignment: 'right' },
                            { text: `No: ${quotation.quotationNo}`, style: 'docMeta', alignment: 'right' },
                            { text: `Tarikh: ${quotation.date}`, style: 'docMeta', alignment: 'right' }
                        ],
                        width: 150
                    }
                ]
            },
            footer: (currentPage: number, pageCount: number) => ({
                columns: [
                    { text: 'Computer Generated Document', style: 'footerText', alignment: 'left' },
                    { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' }
                ],
                margin: [40, 10, 40, 0]
            }),
            content: [
                // Client Info Box
                {
                    style: 'clientBox',
                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'KEPADA:', style: 'label' },
                                        { text: quotation.client.name.toUpperCase(), style: 'clientName' },
                                        { text: quotation.client.company || '', style: 'clientText' },
                                        { text: quotation.client.address, style: 'clientText' }
                                    ],
                                    border: [false, false, false, false]
                                },
                                {
                                    stack: [
                                        { text: 'TEMPOH SAH LAKU:', style: 'label', alignment: 'right' },
                                        { text: '90 HARI DARI TARIKH TUTUP SEBUTHARGA', style: 'clientText', alignment: 'right', bold: true }
                                    ],
                                    border: [false, false, false, false]
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 20]
                },

                // Main Items Table
                {
                    table: {
                        headerRows: 1,
                        // Expanded widths for Rate/Amount to prevent wrapping. Description gets remaining space.
                        // [No, Desc, Qty, Unit, Rate, Amount]
                        widths: [25, '*', 35, 40, 80, 90], 
                        body: tableBody
                    },
                    // Custom layout for cleaner grid lines and padding
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

                // Totals
                {
                    margin: [0, 20, 0, 0],
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 220,
                            table: {
                                widths: ['*', 'auto'],
                                body: [
                                    [{ text: 'Subjumlah:', style: 'totalLabel' }, { text: formatCurrency(subtotal), style: 'totalValue' }],
                                    tax > 0 ? [{ text: `Cukai (${companyInfo.taxRate}%):`, style: 'totalLabel' }, { text: formatCurrency(tax), style: 'totalValue' }] : [],
                                    [{ text: 'JUMLAH KESELURUHAN:', style: 'grandTotalLabel' }, { text: formatCurrency(grandTotal), style: 'grandTotalValue' }]
                                ].filter(row => row.length > 0)
                            },
                            layout: 'noBorders'
                        }
                    ]
                },

                // Terms
                {
                    margin: [0, 30, 0, 0],
                    text: [
                        { text: 'TERMA & SYARAT:\n', style: 'label', decoration: 'underline' },
                        { text: quotation.terms, style: 'termsText' }
                    ]
                },

                // Signature Section (Avoid breaking inside)
                {
                    unbreakable: true,
                    margin: [0, 50, 0, 0],
                    columns: [
                        {
                            stack: [
                                { text: 'Disediakan Oleh:', style: 'label' },
                                { text: '\n\n\n__________________________' },
                                { text: companyInfo.name.toUpperCase(), style: 'signatureName' },
                                { text: '(Cop Syarikat)', style: 'signatureLabel' }
                            ]
                        },
                        {
                            stack: [
                                { text: 'Diterima & Disahkan Oleh:', style: 'label' },
                                { text: '\n\n\n__________________________' },
                                { text: quotation.client.name.toUpperCase(), style: 'signatureName' },
                                { text: '(Cop Rasmi)', style: 'signatureLabel' }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                companyName: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
                companyDetails: { fontSize: 9, color: '#555', margin: [0, 0, 0, 1] },
                docTitle: { fontSize: 20, bold: true, color: '#D2042D' },
                docMeta: { fontSize: 10, margin: [0, 2, 0, 0] },
                tableHeader: { fontSize: 10, bold: true, color: 'white', fillColor: '#000000', margin: [0, 5] },
                label: { fontSize: 9, bold: true, color: '#555', margin: [0, 0, 0, 2] },
                clientName: { fontSize: 12, bold: true, margin: [0, 2, 0, 1] },
                clientText: { fontSize: 10, margin: [0, 1, 0, 1] },
                totalLabel: { fontSize: 10, alignment: 'right', margin: [0, 2] },
                totalValue: { fontSize: 10, bold: true, alignment: 'right', margin: [0, 2] },
                grandTotalLabel: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 5] },
                grandTotalValue: { fontSize: 14, bold: true, color: '#D2042D', alignment: 'right', margin: [0, 5] },
                termsText: { fontSize: 9, color: '#333', lineHeight: 1.3 },
                signatureName: { fontSize: 10, bold: true, margin: [0, 5, 0, 0] },
                signatureLabel: { fontSize: 9, color: '#777' },
                footerText: { fontSize: 8, color: '#aaa' }
            }
        };

        pdfMake.createPdf(docDefinition).download(`Quotation-${quotation.quotationNo}.pdf`);

    } catch (error: any) {
        alert(`Error generating PDF: ${error.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-800">Pratonton Sebut Harga</h3>
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
        
        {/* On-Screen Preview Area - Scrollable, Full Size (Not Scaled) */}
        <div className="overflow-y-auto bg-gray-100 p-8 flex justify-center flex-1">
          <div 
            className="bg-white shadow-lg p-10 min-h-[297mm] w-[210mm] relative flex flex-col"
          >
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-brand-gold pb-6 mb-6">
                    <div className="w-2/3">
                        {companyInfo.logo ? (
                            <img src={companyInfo.logo} alt="Logo" className="h-16 w-auto object-contain mb-4" />
                        ) : (
                            <h1 className="text-2xl font-bold uppercase mb-2 text-brand-black">{companyInfo.name}</h1>
                        )}
                        <div className="text-xs text-gray-600 font-medium leading-relaxed">
                            <p className="w-3/4">{companyInfo.address}</p>
                            <p className="mt-1"><span className="font-bold">Reg:</span> {companyInfo.registrationNo}</p>
                            <p><span className="font-bold">Tel:</span> {companyInfo.tel} | <span className="font-bold">Email:</span> {companyInfo.email}</p>
                        </div>
                    </div>
                    <div className="w-1/3 text-right">
                        <h2 className="text-3xl font-bold text-brand-red uppercase mb-1">SEBUT HARGA</h2>
                        <div className="mt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">No. Rujukan:</span>
                                <span className="font-bold">{quotation.quotationNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tarikh:</span>
                                <span className="font-bold">{quotation.date}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kepada:</p>
                        <p className="font-bold text-lg text-gray-900">{quotation.client.name}</p>
                        {quotation.client.company && <p className="text-sm font-semibold text-gray-700">{quotation.client.company}</p>}
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{quotation.client.address}</p>
                    </div>
                    <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tempoh Sah Laku</p>
                            <p className="text-sm font-bold text-gray-800">30 Hari</p>
                    </div>
                </div>

                {/* Table - Uses table-auto with specific widths to allow wrapping */}
                <div className="flex-grow">
                    <table className="w-full text-sm border-collapse table-fixed">
                        <thead>
                            <tr className="bg-brand-black text-white">
                                <th className="py-3 px-2 text-center w-[5%] font-bold border border-gray-800">NO</th>
                                <th className="py-3 px-4 text-left w-[45%] font-bold border border-gray-800">KETERANGAN KERJA</th>
                                <th className="py-3 px-2 text-center w-[10%] font-bold border border-gray-800">QTY</th>
                                <th className="py-3 px-2 text-center w-[10%] font-bold border border-gray-800">UNIT</th>
                                <th className="py-3 px-4 text-right w-[15%] font-bold border border-gray-800">KADAR</th>
                                <th className="py-3 px-4 text-right w-[15%] font-bold border border-gray-800">JUMLAH</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            {quotation.items.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-200 align-top hover:bg-gray-50">
                                <td className="py-4 px-2 text-center border border-gray-200">{index + 1}</td>
                                <td className="py-4 px-4 font-medium border border-gray-200 break-words whitespace-pre-wrap text-justify">{item.description}</td>
                                <td className="py-4 px-2 text-center border border-gray-200">{item.quantity}</td>
                                <td className="py-4 px-2 text-center border border-gray-200">{item.unit || '-'}</td>
                                <td className="py-4 px-4 text-right border border-gray-200 whitespace-nowrap">{formatCurrency(item.unitPrice).replace('RM ', '')}</td>
                                <td className="py-4 px-4 text-right font-bold border border-gray-200 whitespace-nowrap">{formatCurrency(item.quantity * item.unitPrice).replace('RM ', '')}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary & Terms */}
                <div className="mt-8 flex gap-8 border-t-2 border-brand-black pt-6">
                    <div className="w-3/5 text-xs text-gray-600">
                        <p className="font-bold text-gray-800 uppercase mb-2 underline">Terma & Syarat</p>
                        <div className="whitespace-pre-wrap leading-relaxed text-justify">
                            {quotation.terms}
                        </div>
                    </div>
                    <div className="w-2/5">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Subjumlah:</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        {tax > 0 && (
                            <div className="flex justify-between text-sm mb-2 border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Cukai ({companyInfo.taxRate}%):</span>
                                <span className="font-medium">{formatCurrency(tax)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-2">
                            <span className="font-bold text-sm text-brand-black uppercase">JUMLAH KESELURUHAN</span>
                            <span className="font-extrabold text-xl text-brand-red">{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="mt-16 pt-6 grid grid-cols-2 gap-16 break-inside-avoid">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-12">Disediakan Oleh:</p>
                        <div className="pt-2 border-t border-gray-400">
                            <p className="font-bold text-sm text-brand-black uppercase">{companyInfo.name}</p>
                            <p className="text-xs text-gray-400">(Tandatangan & Cop Syarikat)</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-12">Diterima & Disahkan Oleh:</p>
                        <div className="pt-2 border-t border-gray-400">
                            <p className="font-bold text-sm text-brand-black uppercase">{quotation.client.name}</p>
                            <p className="text-xs text-gray-400">(Tandatangan & Cop Rasmi)</p>
                        </div>
                    </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreviewModal;
