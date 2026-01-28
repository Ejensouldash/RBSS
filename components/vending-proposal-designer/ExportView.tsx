import React, { useState, useCallback } from 'react';
import { GeneratedPresentation, VendingProposalFormData, CompanyInfo } from '../../types';
import ProposalPreview from './ProposalPreview';
import SuratRasmiPreview from './SuratRasmiPreview';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { PrinterIcon } from '../icons/PrinterIcon';

declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    pdfMake: any;
    PptxgenJS: any;
    saveAs: any;
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
        script.onerror = () => { delete scriptPromises[src]; reject(new Error(`Gagal memuatkan skrip: ${src}.`)); };
        document.head.appendChild(script);
    });
    return scriptPromises[src];
};

interface ExportViewProps {
    presentation: GeneratedPresentation;
    images: Record<number, string>;
    formData: VendingProposalFormData;
    companyInfo: CompanyInfo;
    onReset: () => void;
}

const ExportView: React.FC<ExportViewProps> = ({ presentation, images, formData, companyInfo, onReset }) => {
    const [isGeneratingLetterPdf, setIsGeneratingLetterPdf] = useState(false);
    const [isGeneratingLetterDoc, setIsGeneratingLetterDoc] = useState(false);
    const [isGeneratingSlidesPdf, setIsGeneratingSlidesPdf] = useState(false);
    const [isGeneratingSlidesPptx, setIsGeneratingSlidesPptx] = useState(false);
    
    const [previewMode, setPreviewMode] = useState<'letter' | 'slides'>('letter');
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const { slides, suratRasmi } = presentation;
    const sortedSlides = slides.sort((a, b) => a.slideNumber - b.slideNumber);
    const fileNameBase = `RozitaBinaEnterprise_${formData.projectName.replace(/\s+/g, '_')}`;

    const generatePdfDocDefinition = (content: any[], pageOptions: any = {}) => ({
        pageSize: 'A4',
        pageMargins: [72, 80, 72, 60],
        ...pageOptions,
        header: { /* ... */ },
        footer: (currentPage: number, pageCount: number) => ({
            text: `Halaman ${currentPage.toString()} dari ${pageCount}`,
            alignment: 'center',
            style: 'footer'
        }),
        content,
        styles: {
            header: { fontSize: 14, bold: true, alignment: 'right' },
            address: { fontSize: 9, alignment: 'right' },
            ref: { fontSize: 11 },
            recipient: { fontSize: 11, bold: true },
            title: { fontSize: 11, bold: true, alignment: 'justify', margin: [0, 5, 0, 15], decoration: 'underline' },
            body: { fontSize: 11, alignment: 'justify', lineHeight: 1.5 },
            signature: { fontSize: 11, margin: [0, 5, 0, 0] },
            footer: { fontSize: 8, margin: [0, 10, 0, 0] }
        }
    });

    const handleGenerateLetterPdf = useCallback(async () => {
        setIsGeneratingLetterPdf(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js');
            
            const pdfMake = window.pdfMake;
            const letterContent = [
                { text: companyInfo.name, style: 'header' },
                { text: companyInfo.address, style: 'address' },
                { text: `Tel: ${companyInfo.tel} | Emel: ${companyInfo.email}`, style: 'address' },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 451, y2: 5, lineWidth: 2, lineColor: '#000000' }], margin: [0, 2, 0, 10] },
                { columns: [{ text: `Ruj. Kami: ${suratRasmi.rujukanKami}`, style: 'ref' }, { text: `Tarikh: ${suratRasmi.tarikh}`, style: 'ref', alignment: 'right' }], margin: [0, 15, 0, 10] },
                { text: suratRasmi.penerima.nama.toUpperCase(), style: 'recipient' },
                { text: suratRasmi.penerima.jawatan.toUpperCase(), style: 'recipient' },
                { text: suratRasmi.penerima.institusi.toUpperCase(), style: 'recipient' },
                ...suratRasmi.penerima.alamat.split('\n').map(line => ({ text: line.toUpperCase(), style: 'recipient' })),
                { text: 'Tuan/Puan,', style: 'body', margin: [0, 20, 0, 5] },
                { text: suratRasmi.tajuk, style: 'title' },
                ...suratRasmi.isiKandungan.map(p => ({ text: p, style: 'body', margin: [0, 0, 0, 10] })),
                { text: 'Sekian, terima kasih.', style: 'body' },
                ...suratRasmi.penutup.map(p => ({ text: p, style: 'body', margin: [0, 10, 0, 0] })),
                { text: suratRasmi.tandatangan.nama, style: 'signature', margin: [0, 40, 0, 0] },
                { text: suratRasmi.tandatangan.jawatan, style: 'signature' },
                { text: companyInfo.name, style: 'signature' },
            ];
            
            pdfMake.createPdf(generatePdfDocDefinition(letterContent)).download(`${fileNameBase}_Surat_Rasmi.pdf`);
        } catch (error: any) {
            alert(`Ralat menjana PDF: ${error.message}`);
        } finally {
            setIsGeneratingLetterPdf(false);
        }
    }, [companyInfo, suratRasmi, fileNameBase]);

    const handleGenerateLetterDoc = useCallback(async () => {
        setIsGeneratingLetterDoc(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js');
            const { saveAs } = window;
            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Surat Rasmi</title></head>
                <body style="font-family:'Times New Roman', Times, serif; font-size:12pt; margin: 2.5cm;">
                    <p style="text-align:right;"><b>${companyInfo.name}</b><br/>${companyInfo.address.replace(/\n/g, '<br/>')}<br/>Tel: ${companyInfo.tel} | Emel: ${companyInfo.email}</p>
                    <hr style="height:2px; background-color:black;"/>
                    <p>Ruj. Kami: ${suratRasmi.rujukanKami} <span style="float:right;">Tarikh: ${suratRasmi.tarikh}</span></p>
                    <br/><br/>
                    <p>
                        <b>${suratRasmi.penerima.nama.toUpperCase()}</b><br/>
                        <b>${suratRasmi.penerima.jawatan.toUpperCase()}</b><br/>
                        <b>${suratRasmi.penerima.institusi.toUpperCase()}</b><br/>
                        ${suratRasmi.penerima.alamat.replace(/\n/g, '<br/>')}
                    </p>
                    <br/>
                    <p>Tuan/Puan,</p>
                    <p><b><u>${suratRasmi.tajuk.toUpperCase()}</u></b></p>
                    ${suratRasmi.isiKandungan.map(p => `<p style="text-indent:1cm; text-align:justify;">${p}</p>`).join('')}
                    <p>Sekian, terima kasih.</p>
                    <br/>
                    ${suratRasmi.penutup.map(p => `<p>${p}</p>`).join('')}
                    <br/><br/><br/>
                    <p><b>(${suratRasmi.tandatangan.nama.toUpperCase()})</b><br/>${suratRasmi.tandatangan.jawatan}<br/>${companyInfo.name}</p>
                </body></html>`;
            const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
            saveAs(blob, `${fileNameBase}_Surat_Rasmi.doc`);
        } catch (error: any) {
            alert(`Ralat menjana Dokumen Word: ${error.message}`);
        } finally {
            setIsGeneratingLetterDoc(false);
        }
    }, [companyInfo, suratRasmi, fileNameBase]);

    const handleGenerateSlidesPdf = useCallback(async () => {
        setIsGeneratingSlidesPdf(true);
        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js'),
            ]);

            const pdfMake = window.pdfMake;
            const slideElements = document.querySelectorAll('.slide-for-pdf');
            const slideImages: string[] = [];
            for (const element of Array.from(slideElements)) {
                const canvas = await window.html2canvas(element as HTMLElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                slideImages.push(canvas.toDataURL('image/png'));
            }

            const content = slideImages.map((imgData, index) => ({
                image: imgData,
                width: 841.89 - 80, // Landscape A4 width minus margins
                pageBreak: index === 0 ? undefined : 'before',
            }));

            const docDefinition = generatePdfDocDefinition(content, { pageOrientation: 'landscape', pageMargins: [40, 40, 40, 40] });
            pdfMake.createPdf(docDefinition).download(`${fileNameBase}_Proposal_Visual.pdf`);

        } catch (error: any) {
            alert(`Ralat menjana PDF Slaid: ${error.message}`);
        } finally {
            setIsGeneratingSlidesPdf(false);
        }
    }, [fileNameBase]);

    const handleGenerateSlidesPptx = useCallback(async () => {
        setIsGeneratingSlidesPptx(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js');
            const pptx = new window.PptxgenJS();
            pptx.layout = 'LAYOUT_16X9';
            
            for (const slide of sortedSlides) {
                const pptxSlide = pptx.addSlide();
                const imageBase64 = images[slide.slideNumber];
                if (imageBase64) {
                    pptxSlide.addImage({ data: `data:image/jpeg;base64,${imageBase64}`, x: 0, y: 0, w: '100%', h: '100%' });
                }

                // Add a semi-transparent overlay for readability, especially on cover slide
                if (slide.slideNumber === 1) {
                    pptxSlide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '50%', h: '100%', fill: { color: '000000', transparency: 30 } });
                }

                pptxSlide.addText(slide.title, { 
                    x: 0.5, y: slide.slideNumber === 1 ? '60%' : 0.5, 
                    w: '90%', h: 1, 
                    fontSize: slide.slideNumber === 1 ? 36 : 28, 
                    bold: true, 
                    color: slide.slideNumber === 1 ? 'FFFFFF' : 'D2042D' 
                });
                
                if (slide.subtitle) {
                    pptxSlide.addText(slide.subtitle, { x: 0.5, y: '75%', w: '90%', h: 0.5, fontSize: 18, color: 'FFD700' });
                }

                if (slide.contentPoints && slide.slideNumber !== 1) {
                    pptxSlide.addText(slide.contentPoints.map(p => ({ text: p.replace(/✅\s*\**/g, '').replace(/\*:/g, ':') })), { 
                        x: 0.5, y: 1.5, 
                        w: '90%', h: 3.5, 
                        fontSize: 14, 
                        color: '333333', 
                        bullet: true 
                    });
                }
            }
            pptx.writeFile({ fileName: `${fileNameBase}_Proposal_Visual.pptx` });
        } catch (error: any) {
            alert(`Ralat menjana PPTX: ${error.message}`);
        } finally {
            setIsGeneratingSlidesPptx(false);
        }
    }, [sortedSlides, images, fileNameBase]);

    const nextSlide = () => setCurrentSlideIndex(prev => Math.min(prev + 1, sortedSlides.length - 1));
    const prevSlide = () => setCurrentSlideIndex(prev => Math.max(prev - 1, 0));

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="p-8 bg-gray-50 rounded-lg text-center">
                <h3 className="text-2xl font-bold">Proposal Anda Telah Siap!</h3>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Pratonton dokumen di bawah dan pilih format muat turun yang anda inginkan.</p>
                 <div className="mt-6 flex justify-center items-center gap-4">
                     <button onClick={onReset} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-md">
                        Buat Semula
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Surat Rasmi Card */}
                <div className="p-4 bg-gray-200 rounded-lg">
                    <h4 className="font-bold text-center mb-2">Surat Rasmi</h4>
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                        <SuratRasmiPreview surat={suratRasmi} companyInfo={companyInfo} />
                    </div>
                     <div className="mt-4 flex justify-center gap-2">
                        <button onClick={handleGenerateLetterPdf} disabled={isGeneratingLetterPdf} className="btn-download bg-brand-red text-white">
                            {isGeneratingLetterPdf ? 'Menjana...' : 'Muat Turun PDF'}
                        </button>
                        <button onClick={handleGenerateLetterDoc} disabled={isGeneratingLetterDoc} className="btn-download bg-blue-600 text-white">
                            {isGeneratingLetterDoc ? 'Menjana...' : 'Muat Turun Docs'}
                        </button>
                    </div>
                </div>

                {/* Proposal Visual Card */}
                 <div className="p-4 bg-gray-200 rounded-lg">
                    <h4 className="font-bold text-center mb-2">Proposal Visual ({currentSlideIndex + 1}/{sortedSlides.length})</h4>
                    <div className="relative">
                        <ProposalPreview
                            slideData={sortedSlides[currentSlideIndex]}
                            imageBase64={images[sortedSlides[currentSlideIndex].slideNumber]}
                            companyInfo={companyInfo}
                            colorTheme={formData.colorTheme}
                        />
                        <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 disabled:opacity-30">
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button onClick={nextSlide} disabled={currentSlideIndex === sortedSlides.length - 1} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 disabled:opacity-30">
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                         <button onClick={handleGenerateSlidesPdf} disabled={isGeneratingSlidesPdf} className="btn-download bg-brand-red text-white">
                            {isGeneratingSlidesPdf ? 'Menjana...' : 'Muat Turun PDF'}
                        </button>
                        <button onClick={handleGenerateSlidesPptx} disabled={isGeneratingSlidesPptx} className="btn-download bg-orange-500 text-white">
                            {isGeneratingSlidesPptx ? 'Menjana...' : 'Muat Turun Slides'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden container for PDF generation of slides */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1280px' }}>
                {sortedSlides.map(slide => (
                    <div key={`pdf-${slide.slideNumber}`} className="slide-for-pdf">
                        <ProposalPreview slideData={slide} imageBase64={images[slide.slideNumber]} companyInfo={companyInfo} colorTheme={formData.colorTheme} />
                    </div>
                ))}
            </div>
            <style>{`
                .btn-download {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: opacity 0.2s;
                }
                .btn-download:disabled {
                    opacity: 0.6;
                    cursor: wait;
                }
            `}</style>
        </div>
    );
};

export default ExportView;