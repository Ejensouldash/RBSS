import React, { useState, useCallback } from 'react';
import { CompanyInfo, VendingProposalFormData, GeneratedPresentation } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import InterviewWizard from './vending-proposal-designer/InterviewWizard';
import GenerationLoader from './vending-proposal-designer/GenerationLoader';
import ExportView from './vending-proposal-designer/ExportView';
import { PresentationChartBarIcon } from './icons/PresentationChartBarIcon';

interface AIVendingProposalDesignerDashboardProps {
    companyInfo: CompanyInfo;
}

type BuilderState = 'interview' | 'generating' | 'export' | 'error';

const AIVendingProposalDesignerDashboard: React.FC<AIVendingProposalDesignerDashboardProps> = ({ companyInfo }) => {
    const [builderState, setBuilderState] = useState<BuilderState>('interview');
    const [generatedPresentation, setGeneratedPresentation] = useState<GeneratedPresentation | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
    const [formData, setFormData] = useState<VendingProposalFormData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [generationStep, setGenerationStep] = useState(0);
    const [generationSteps, setGenerationSteps] = useState<string[]>([]);

    const handleInterviewComplete = useCallback(async (formData: VendingProposalFormData) => {
        const steps = [
            "Menganalisis input temuduga...",
            "AI merangka Surat Rasmi...",
            "AI merangka kandungan untuk 9 slaid...",
            ...Array.from({ length: 9 }, (_, i) => `Menjana imej visual (Slaid ${i + 1}/9)...`),
            "Menyusun reka bentuk persembahan...",
            "Selesai!"
        ];

        setGenerationSteps(steps);
        setGenerationStep(0);
        setBuilderState('generating');
        setFormData(formData);
        setErrorMessage('');
        
        try {
            setGenerationStep(1); 
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const schema = {
                type: Type.OBJECT, properties: {
                    suratRasmi: {
                        type: Type.OBJECT, properties: {
                            rujukanKami: { type: Type.STRING },
                            tarikh: { type: Type.STRING },
                            penerima: {
                                type: Type.OBJECT, properties: {
                                    nama: { type: Type.STRING },
                                    jawatan: { type: Type.STRING },
                                    institusi: { type: Type.STRING },
                                    alamat: { type: Type.STRING }
                                }, required: ["nama", "jawatan", "institusi", "alamat"]
                            },
                            tajuk: { type: Type.STRING },
                            isiKandungan: { type: Type.ARRAY, items: { type: Type.STRING } },
                            penutup: { type: Type.ARRAY, items: { type: Type.STRING } },
                            tandatangan: {
                                type: Type.OBJECT, properties: {
                                    nama: { type: Type.STRING },
                                    jawatan: { type: Type.STRING }
                                }, required: ["nama", "jawatan"]
                            }
                        }, required: ["rujukanKami", "tarikh", "penerima", "tajuk", "isiKandungan", "penutup", "tandatangan"]
                    },
                    slides: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                slideNumber: { type: Type.NUMBER },
                                title: { type: Type.STRING },
                                subtitle: { type: Type.STRING },
                                contentPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                                imagePrompt: { type: Type.STRING },
                                layoutSuggestion: { type: Type.STRING }
                            }, required: ["slideNumber", "title", "contentPoints", "imagePrompt", "layoutSuggestion"]
                        }
                    }
                }, required: ["suratRasmi", "slides"]
            };
            
            setGenerationStep(2);

            const prompt = `You are the upgraded AI Smart Proposal Designer for RBE System. Your task is to generate TWO outputs: 1) a highly detailed, corporate-grade vending machine proposal structured as a 9-slide presentation, and 2) a government-style formal application letter ('Surat Rasmi').
The entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
All text content MUST be in perfect formal Bahasa Melayu (exam-grade / PTD-grade), suitable for Malaysian government, GLCs, and educational institutions.

**USER-PROVIDED PROJECT DETAILS (CONTEXT):**
${JSON.stringify(formData, null, 2)}

**YOUR COMPANY PROFILE (CONTEXT):**
${JSON.stringify(companyInfo, null, 2)}

**DESIGN & TONE PREFERENCES (CONTEXT):**
- **Tone:** ${formData.proposalTone}
- **Color Theme:** ${formData.colorTheme}

---
**PART 1: SURAT RASMI GENERATION**
---
Generate the 'Official Application Letter' and populate the \`suratRasmi\` object. This is a formal request from Rozita Bina Enterprise to the institution director, requesting permission to install the vending machines.
1.  **Strict Malaysian Government Format:**
    - \`rujukanKami\`: Auto-generate in the format 'RBE/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}'.
    - \`tarikh\`: Use today's date in 'DD MMMM YYYY' format (e.g., 2 Ogos 2024).
    - \`penerima\`: Use the details provided by the user.
    - \`tajuk\`: Create a formal, bold, uppercase title: "PERMOHONAN KEBENARAN UNTUK MEMASANG DAN MENGOPERASIKAN MESIN LAYAN DIRI DI ${formData.proposalRecipientInstitution.toUpperCase()}".
    - \`isiKandungan\`: Write 3-4 detailed paragraphs in formal, polite Bahasa Melayu. Explain the purpose, mention the benefits for students/staff, and state that a detailed proposal is attached. Use formal phrases like "Dengan hormatnya perkara di atas adalah dirujuk.", "Sehubungan itu, kami...".
    - \`penutup\`: Write a formal closing paragraph expressing hope for a positive response and collaboration.
    - \`tandatangan\`: Use the name "Pengurus Projek" and the title "Pengurus, Rozita Bina Enterprise".
2.  **Writing Style:** The tone must be extremely formal and respectful.

---
**PART 2: SLIDES PRESENTATION GENERATION**
---
Generate the complete content for a 9-slide visual presentation by populating the \`slides\` array. The slide content must be comprehensive enough to serve as a full corporate proposal. Each point in 'contentPoints' should be a full, well-written sentence or short paragraph. Also create a detailed, high-quality 'imagePrompt' in English for an AI image generator for each slide.

**Incorporate the following detailed proposal sections into the 9 slides:**

- **Slide 1: Cover Page**
    - \`title\`: "Cadangan Pemasangan Mesin Layan Diri di ${formData.projectName}"
    - \`subtitle\`: "Disediakan untuk: ${formData.proposalRecipientInstitution}"
    - \`contentPoints\`: ["${companyInfo.name}", "Tarikh: ${new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric'})}"]
    - \`imagePrompt\`: A stunning, professional shot of a modern ${formData.machineBrand} ${formData.machineType} vending machine in a setting appropriate for ${formData.locationRationale}, with glossy reflections and corporate branding. Match the lighting and mood to the user's selected Tone.

- **Slide 2: Ringkasan Eksekutif (Executive Summary)**
    - \`title\`: "Ringkasan Eksekutif"
    - \`contentPoints\`: ["✅ **Tujuan:** Mengemukakan cadangan pemasangan ${formData.machineCount} unit mesin layan diri moden tanpa sebarang kos kepada pihak ${formData.proposalRecipientInstitution}.", "✅ **Justifikasi:** Memenuhi keperluan mendesak untuk akses 24/7 kepada makanan dan minuman yang mudah dan bersih bagi ${formData.targetUsers}.", "✅ **Manfaat Utama:** Meningkatkan kemudahan dan kepuasan warga institusi, menyokong persekitaran tanpa tunai, dan menaikkan imej moden institusi.", "✅ **Vendor Pilihan:** Rozita Bina Enterprise menawarkan pakej perkhidmatan penuh merangkumi pemasangan, pengisian semula, dan penyelenggaraan teknikal secara profesional."]
    - \`imagePrompt\`: An abstract corporate background with colors inspired by the selected '${formData.colorTheme}' theme in a clean, minimalist geometric pattern.

- **Slide 3: Profil Syarikat (Company Profile)**
    - \`title\`: "Profil Syarikat: Rozita Bina Enterprise"
    - \`contentPoints\`: ["✅ **Latar Belakang:** Syarikat bumiputera yang berdaftar di Seremban dengan pengalaman luas dalam kerja-kerja infrastruktur dan kini mempelopori perkhidmatan layan diri moden.", "✅ **Visi & Misi:** Menjadi peneraju dalam penyediaan solusi kemudahan bersepadu yang inovatif dan berkualiti tinggi di Malaysia.", "✅ **Kekuatan Unik:** Menggabungkan kepakaran teknikal penyelenggaraan aset dengan perkhidmatan pelanggan yang cemerlang untuk memastikan operasi mesin layan diri yang lancar dan efisien."]
    - \`imagePrompt\`: A professional montage showing a friendly technician in a clean uniform servicing a vending machine, and a subtle background image of a successfully completed construction project.

- **Slide 4: Skop Projek & Spesifikasi Teknikal**
    - \`title\`: "Skop Projek & Spesifikasi Mesin"
    - \`contentPoints\`: ["✅ **Bilangan & Jenis:** ${formData.machineCount} unit Mesin Layan Diri Jenis '${formData.machineType}' jenama ${formData.machineBrand}.", "✅ **Lokasi Cadangan:** ${formData.locationRationale}", "✅ **Spesifikasi Utama:** Dilengkapi sistem pembayaran tanpa tunai (QR Pay, e-Wallet), pemantauan stok IoT masa nyata, dan sistem penyejukan cekap tenaga (${Math.floor(Math.random() * 50 + 200)}W)."]
    - \`imagePrompt\`: A clean, studio-shot of the ${formData.machineBrand} vending machine on a white background, with callout graphics highlighting its features like a cashless payment terminal and a digital screen.

- **Slide 5: Pelan Operasi & Penyelenggaraan**
    - \`title\`: "Pelan Operasi & Penyelenggaraan Profesional"
    - \`contentPoints\`: ["✅ **Pengisian Semula:** Jadual pengisian semula yang fleksibel berdasarkan data jualan masa nyata untuk memastikan stok sentiasa tersedia.", "✅ **Penyelenggaraan (SLA)::** Jaminan respons teknikal dalam tempoh 4 jam bekerja sekiranya berlaku sebarang kerosakan.", "✅ **Kebersihan & Keselamatan:** SOP pembersihan luaran dan dalaman mesin secara berkala bagi mematuhi piawaian kebersihan tertinggi."]
    - \`imagePrompt\`: A clean process diagram or flowchart showing the steps: IoT Monitoring -> Intelligent Restocking -> Scheduled Cleaning -> On-Call Maintenance, using icons and the selected '${formData.colorTheme}' theme.

- **Slide 6: Unjuran Kewangan & ROI**
    - \`title\`: "Model Kewangan & Unjuran"
    - \`contentPoints\`: ["✅ **Model Tanpa Kos:** Tiada sebarang kos pemasangan, sewaan, atau penyelenggaraan akan dikenakan kepada pihak institusi.", "✅ **Potensi Pendapatan:** Pihak institusi berpotensi menerima perkongsian keuntungan (akan dibincangkan) berdasarkan jumlah jualan bulanan.", "✅ **Analisis ROI (RBE):** Pelaburan kos mesin dan operasi dijangka akan mencapai pulangan modal dalam tempoh 18-24 bulan, menunjukkan keyakinan kami terhadap kejayaan projek ini."]
    - \`imagePrompt\`: A modern, clean infographic chart showing an upward trending bar graph labeled 'Potensi Jualan Bulanan' and a pie chart showing cost breakdown for RBE's investment. Use the '${formData.colorTheme}' color scheme.

- **Slide 7: Risiko, Pematuhan & Jaminan**
    - \`title\`: "Pengurusan Risiko & Jaminan Pematuhan"
    - \`contentPoints\`: ["✅ **Risiko & Mitigasi:** Mesin dilengkapi ciri keselamatan anti-vandal dan kami menyediakan perlindungan insuran. Isu inventori diuruskan melalui sistem IoT.", "✅ **Pematuhan Undang-Undang:** Rozita Bina Enterprise adalah syarikat berdaftar SSM dan akan mematuhi semua polisi dan peraturan yang ditetapkan oleh pihak institusi.", "✅ **Beban Elektrik:** Mesin layan diri moden menggunakan kuasa yang rendah dan tidak akan membebankan sistem elektrik sedia ada."]
    - \`imagePrompt\`: A professional graphic showing three icons: a shield for 'Safety', a checklist for 'Compliance', and a lightning bolt for 'Electrical Safety', designed with the '${formData.colorTheme}' colors.

- **Slide 8: Proposisi Nilai & Manfaat**
    - \`title\`: "Manfaat & Nilai Tambah kepada Institusi"
    - \`contentPoints\`: ["✅ **Kemudahan 24/7:** Menyediakan akses tanpa henti kepada minuman dan snek untuk pelajar dan staf, terutamanya di luar waktu operasi kafe.", "✅ **Persekitaran Moden:** Menggalakkan penggunaan e-dompet dan pembayaran tanpa tunai selaras dengan inisiatif ekonomi digital.", "✅ **Sokongan Penuh:** Pihak institusi tidak perlu risau tentang sebarang aspek operasi; semuanya diuruskan sepenuhnya oleh pasukan kami."]
    - \`imagePrompt\`: A bright, optimistic photo of the target users (${formData.targetUsers}) interacting happily around a modern vending machine in the ${formData.locationRationale} environment.

- **Slide 9: Penutup & Langkah Seterusnya**
    - \`title\`: "Penutup & Hubungi Kami"
    - \`contentPoints\`: ["✅ **Kesimpulan:** Kami yakin cadangan ini akan memberi manfaat besar kepada seluruh warga ${formData.proposalRecipientInstitution} dan kami bersedia untuk memulakan projek ini secepat mungkin.", "✅ **Langkah Seterusnya:** Kami bersedia untuk sesi perbincangan lanjut dan lawatan tapak bagi memuktamadkan lokasi pemasangan.", "✅ **Hubungi:** ${companyInfo.name}, ${companyInfo.tel}, ${companyInfo.email}"]
    - \`imagePrompt\`: A warm, professional handshake in a corporate office setting. One person is wearing a uniform with a subtle '${companyInfo.name}' logo. The background has subtle Malaysian architectural elements.`;
            
            const textResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { temperature: 0.4, responseMimeType: "application/json", responseSchema: schema }
            });
            const presentationContent: GeneratedPresentation = JSON.parse(textResponse.text);
            setGeneratedPresentation(presentationContent);

            const imageMap: Record<number, string> = {};
            const sortedSlides = [...presentationContent.slides].sort((a,b) => a.slideNumber - b.slideNumber);
            
            for (let i = 0; i < sortedSlides.length; i++) {
                const slide = sortedSlides[i];
                setGenerationStep(3 + i); 
                 try {
                    const imageResponse = await ai.models.generateImages({
                        model: 'imagen-4.0-generate-001',
                        prompt: slide.imagePrompt,
                        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
                    });
                     if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                        imageMap[slide.slideNumber] = imageResponse.generatedImages[0].image.imageBytes;
                    }
                } catch (imageError) {
                    console.warn(`Could not generate image for slide ${slide.slideNumber}:`, imageError);
                }
            }
            
            setGeneratedImages(imageMap);
            setGenerationStep(steps.length - 2); 
            setBuilderState('export');
            setGenerationStep(steps.length - 1);

        } catch (error) {
            console.error("Proposal Generation Error:", error);
            setErrorMessage("An AI error occurred during document generation. The system may be busy, or there was an issue with the provided details. Please try again.");
            setBuilderState('error');
        }
    }, [companyInfo]);

    const handleReset = () => {
        setBuilderState('interview');
        setGeneratedPresentation(null);
        setGeneratedImages({});
        setErrorMessage('');
    };

    const renderContent = () => {
        switch (builderState) {
            case 'interview':
                return <InterviewWizard onComplete={handleInterviewComplete} />;
            case 'generating':
                return <GenerationLoader steps={generationSteps} currentStep={generationStep} />;
            case 'export':
                return generatedPresentation && formData ? (
                    <ExportView
                        presentation={generatedPresentation}
                        images={generatedImages}
                        formData={formData}
                        companyInfo={companyInfo}
                        onReset={handleReset}
                    />
                ) : null;
            case 'error':
                 return (
                    <div className="text-center min-h-[60vh] flex flex-col justify-center items-center bg-red-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-brand-red">Failed to Generate Documents</h2>
                        <p className="text-gray-600 mt-2 max-w-md">{errorMessage}</p>
                        <button onClick={handleReset} className="mt-6 px-6 py-2 bg-brand-red text-white font-semibold rounded-md">
                            Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center space-x-3">
                <PresentationChartBarIcon className="w-8 h-8 text-brand-red" />
                <div>
                    <h1 className="text-3xl font-bold text-brand-text">AI Smart Proposal Designer</h1>
                    <p className="text-sm text-gray-500">Intelligent Vending Machine Proposal & Presentation Generator</p>
                </div>
            </div>
            <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default AIVendingProposalDesignerDashboard;
