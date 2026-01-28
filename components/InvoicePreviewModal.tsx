
import React, { useState, useMemo } from 'react';
import { Invoice, CompanyInfo } from '../types';
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

interface InvoicePreviewModalProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  onClose: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, companyInfo, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { subtotal, tax, grandTotal } = useMemo(() => {
    const taxRate = companyInfo.taxRate / 100;
    const currentSubtotal = invoice.totalValue / (1 + taxRate);
    const currentTax = invoice.totalValue - currentSubtotal;
    return { subtotal: currentSubtotal, tax: currentTax, grandTotal: invoice.totalValue };
  }, [invoice.totalValue, companyInfo.taxRate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount).replace(/^MYR/, 'RM ');
  };
  
  const handlePrint = async () => {
    setIsGenerating(true);
    try {
        // Load sequentially to prevent race condition
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js');

        const pdfMake = window.pdfMake;
        if (!pdfMake) throw new Error("PDF Library failed to load.");

        // Table Header
        const tableBody: any[] = [
            [
                { text: 'NO', style: 'tableHeader', alignment: 'center' },
                { text: 'KETERANGAN KERJA', style: 'tableHeader' },
                { text: 'QTY', style: 'tableHeader', alignment: 'center' },
                { text: 'UNIT', style: 'tableHeader', alignment: 'center' },
                { text: 'KADAR (RM)', style: 'tableHeader', alignment: 'right' },
                { text: 'JUMLAH (RM)', style: 'tableHeader', alignment: 'right' }
            ]
        ];

        // Table Rows
        invoice.items.forEach((item, index) => {
            tableBody.push([
                { text: (index + 1).toString(), alignment: 'center' },
                { text: item.description, alignment: 'justify' },
                { text: item.quantity.toString(), alignment: 'center' },
                { text: item.unit || '-', alignment: 'center' },
                { text: formatCurrency(item.unitPrice).replace('RM ', ''), alignment: 'right' },
                { text: formatCurrency(item.quantity * item.unitPrice).replace('RM ', ''), alignment: 'right', bold: true }
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
                            { text: `Tel: ${companyInfo.tel} | Email: ${companyInfo.email}`, style: 'companyDetails' }
                        ],
                        width: '*'
                    },
                    {
                        stack: [
                            { text: 'INVOIS', style: 'docTitle', alignment: 'right' },
                            { text: `No: ${invoice.invoiceNo}`, style: 'docMeta', alignment: 'right' },
                            { text: `Tarikh: ${invoice.date}`, style: 'docMeta', alignment: 'right' },
                            { text: `Due Date: ${invoice.dueDate}`, style: 'docMeta', alignment: 'right', color: '#D2042D' }
                        ],
                        width: 150
                    }
                ]
            },
            footer: (currentPage: number, pageCount: number) => ({
                columns: [
                    { text: 'Computer Generated Invoice', style: 'footerText', alignment: 'left' },
                    { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' }
                ],
                margin: [40, 10, 40, 0]
            }),
            content: [
                {
                    style: 'clientBox',
                    table: {
                        widths: ['*'],
                        body: [[
                            {
                                stack: [
                                    { text: 'KEPADA:', style: 'label' },
                                    { text: invoice.client.name.toUpperCase(), style: 'clientName' },
                                    { text: invoice.client.company || '', style: 'clientText' },
                                    { text: invoice.client.address, style: 'clientText' }
                                ],
                                border: [false, false, false, false],
                                fillColor: '#f9f9f9'
                            }
                        ]]
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 20]
                },
                {
                    table: {
                        headerRows: 1,
                        // Increased widths for Rate/Amount columns
                        widths: [25, '*', 35, 40, 80, 90],
                        body: tableBody
                    },
                    // Full grid layout
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
                    margin: [0, 20, 0, 0],
                    table: {
                        widths: ['*', 220],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'MAKLUMAT PEMBAYARAN', style: 'label', decoration: 'underline' },
                                        { text: 'Sila buat pembayaran ke akaun berikut:', style: 'termsText', margin: [0, 2] },
                                        { text: companyInfo.bankInfo, style: 'bankInfo', bold: true }
                                    ],
                                    border: [false, true, false, false],
                                    borderColor: ['#000', '#eee', '#000', '#000']
                                },
                                {
                                    stack: [
                                        { columns: [{ text: 'Subjumlah:', style: 'totalLabel' }, { text: formatCurrency(subtotal), style: 'totalValue' }] },
                                        tax > 0 ? { columns: [{ text: `Cukai (${companyInfo.taxRate}%):`, style: 'totalLabel' }, { text: formatCurrency(tax), style: 'totalValue' }], margin: [0, 5] } : {},
                                        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 220, y2: 5, lineWidth: 1 }] },
                                        { columns: [{ text: 'JUMLAH KESELURUHAN:', style: 'grandTotalLabel' }, { text: formatCurrency(grandTotal), style: 'grandTotalValue' }], margin: [0, 5] }
                                    ],
                                    border: [false, false, false, false]
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },
                {
                    unbreakable: true,
                    margin: [0, 60, 0, 0],
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
                                { text: 'Diterima Oleh:', style: 'label' },
                                { text: '\n\n\n__________________________' },
                                { text: invoice.client.name.toUpperCase(), style: 'signatureName' },
                                { text: '(Cop Rasmi)', style: 'signatureLabel' }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                companyName: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
                companyDetails: { fontSize: 9, color: '#555', margin: [0, 0, 0, 1] },
                docTitle: { fontSize: 20, bold: true, color: '#000' },
                docMeta: { fontSize: 10, margin: [0, 2, 0, 0] },
                tableHeader: { fontSize: 10, bold: true, color: 'white', fillColor: '#000', margin: [0, 5] },
                label: { fontSize: 9, bold: true, color: '#555', margin: [0, 0, 0, 2] },
                clientName: { fontSize: 12, bold: true, margin: [0, 2, 0, 1] },
                clientText: { fontSize: 10, margin: [0, 1, 0, 1] },
                totalLabel: { fontSize: 10, alignment: 'right' },
                totalValue: { fontSize: 10, bold: true, alignment: 'right' },
                grandTotalLabel: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 5, 0, 0] },
                grandTotalValue: { fontSize: 14, bold: true, color: '#D2042D', alignment: 'right', margin: [0, 5, 0, 0] },
                termsText: { fontSize: 9, color: '#333' },
                bankInfo: { fontSize: 10, margin: [0, 2] },
                signatureName: { fontSize: 10, bold: true, margin: [0, 5, 0, 0] },
                signatureLabel: { fontSize: 9, color: '#777' },
                footerText: { fontSize: 8, color: '#aaa' }
            }
        };

        pdfMake.createPdf(docDefinition).download(`Invoice-${invoice.invoiceNo}.pdf`);

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
          <h3 className="text-lg font-bold text-gray-800">Dokumen Invois</h3>
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
        
        {/* Scrollable Preview Area */}
        <div className="overflow-y-auto bg-gray-100 p-8 flex justify-center flex-1">
          <div className="bg-white shadow-lg p-10 min-h-[297mm] w-[210mm] relative flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-brand-red pb-6 mb-6">
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
                        <h2 className="text-3xl font-bold text-brand-black uppercase mb-1">INVOIS</h2>
                        <div className="mt-4 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">No. Invois:</span><span className="font-bold">{invoice.invoiceNo}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tarikh:</span><span className="font-bold">{invoice.date}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Due Date:</span><span className="font-bold text-brand-red">{invoice.dueDate}</span></div>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="mb-8 flex gap-8">
                    <div className="w-1/2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kepada:</p>
                        <div className="p-4 bg-gray-50 border-l-4 border-brand-black rounded-r-md">
                            <p className="font-bold text-lg text-gray-900">{invoice.client.name}</p>
                            {invoice.client.company && <p className="text-sm font-semibold text-gray-700">{invoice.client.company}</p>}
                            <p className="text-sm text-gray-600 mt-1 leading-snug">{invoice.client.address}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
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
                            {invoice.items.map((item, index) => (
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

                {/* Footer / Totals */}
                <div className="flex flex-col md:flex-row gap-8 mt-8 border-t-2 border-gray-200 pt-6 break-inside-avoid">
                    <div className="flex-1 bg-blue-50 p-4 rounded border border-blue-100">
                        <h3 className="font-bold text-xs text-blue-900 mb-2 uppercase">Maklumat Pembayaran</h3>
                        <p className="text-xs text-gray-700 mb-1">Sila buat pembayaran ke:</p>
                        <p className="text-sm font-bold text-gray-900">{companyInfo.bankInfo}</p>
                    </div>
                    <div className="w-72">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Subjumlah:</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        {tax > 0 && (
                            <div className="flex justify-between text-sm mb-2">
                                <span>Cukai ({companyInfo.taxRate}%):</span>
                                <span className="font-medium">{formatCurrency(tax)}</span>
                            </div>
                        )}
                        <div className="border-t-2 border-brand-black pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm text-brand-black uppercase">JUMLAH KESELURUHAN</span>
                                <span className="font-extrabold text-xl text-brand-red">{formatCurrency(grandTotal)}</span>
                            </div>
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
                        <p className="text-xs font-bold text-gray-500 uppercase mb-12">Diterima Oleh:</p>
                        <div className="pt-2 border-t border-gray-400">
                            <p className="font-bold text-sm text-brand-black uppercase">{invoice.client.name}</p>
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

export default InvoicePreviewModal;
