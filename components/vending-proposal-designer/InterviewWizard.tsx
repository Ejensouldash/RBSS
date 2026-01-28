import React, { useState, useCallback } from 'react';
import { VendingProposalFormData } from '../../types';
import { extractTextFromFile } from '../../utils/fileExtractor';

interface InterviewWizardProps {
    onComplete: (formData: VendingProposalFormData) => void;
}

const STEPS = [
    "Maklumat Asas Projek",
    "Spesifikasi Mesin",
    "Produk & Operasi",
    "Visual & Dokumen",
    "Gaya & Tema",
    "Sahkan & Jana",
];

const initialFormData: Partial<VendingProposalFormData> = {
    machineType: 'Kombinasi',
    machineCount: 1,
    proposalTone: 'Formal & Korporat',
    colorTheme: 'Korporat (RBE)',
    useAiImage: true,
    includeCoverLetter: true,
};

const InterviewWizard: React.FC<InterviewWizardProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Partial<VendingProposalFormData>>(initialFormData);
    const [fileError, setFileError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'radio') {
            setFormData(prev => ({...prev, [name]: value === 'true'}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, field: 'rawProductList' | 'machineImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileError('');
        try {
            if (field === 'rawProductList') {
                const text = await extractTextFromFile(file);
                setFormData(prev => ({ ...prev, rawProductList: text }));
            } else if (field === 'machineImage') {
                 if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    throw new Error("Fail imej terlalu besar. Saiz maksimum 2MB.");
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({...prev, machineImage: (reader.result as string).split(',')[1]}));
                };
                reader.readAsDataURL(file);
            }
        } catch (err: any) {
            setFileError(err.message);
        }
    }, []);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
    
    const handleSubmit = () => {
        if (!formData.projectName || !formData.proposalRecipientName || !formData.proposalRecipientPosition || !formData.proposalRecipientInstitution || !formData.proposalRecipientAddress) {
            alert("Sila isi semua medan butiran penerima yang diperlukan (*).");
            setCurrentStep(0);
            return;
        }
        onComplete(formData as VendingProposalFormData);
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-500">Langkah {currentStep + 1} dari {STEPS.length}: <span className="text-brand-text">{STEPS[currentStep]}</span></h3>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-brand-gold h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="min-h-[350px]">
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <TextInput label="Nama Projek/Lokasi" name="projectName" value={formData.projectName || ''} onChange={handleChange} placeholder="cth., KPTM Seremban" required />
                        <TextInput label="Nama Penerima" name="proposalRecipientName" value={formData.proposalRecipientName || ''} onChange={handleChange} placeholder="cth., Tuan Haji Ahmad bin Ismail" required />
                        <TextInput label="Jawatan Penerima" name="proposalRecipientPosition" value={formData.proposalRecipientPosition || ''} onChange={handleChange} placeholder="cth., Pengarah" required />
                        <TextInput label="Institusi Penerima" name="proposalRecipientInstitution" value={formData.proposalRecipientInstitution || ''} onChange={handleChange} placeholder="cth., Kolej Poly-Tech MARA Seremban" required />
                        <TextInput label="Alamat Institusi" name="proposalRecipientAddress" value={formData.proposalRecipientAddress || ''} onChange={handleChange} isTextArea placeholder="Alamat penuh institusi..." required />
                        <TextInput label="Sasaran Pengguna" name="targetUsers" value={formData.targetUsers || ''} onChange={handleChange} placeholder="Pelajar, staf, pelanggan umum" required />
                        <TextInput label="Rasional Lokasi" name="locationRationale" value={formData.locationRationale || ''} onChange={handleChange} isTextArea placeholder="Kawasan trafik tinggi, tiada kedai serbaneka berdekatan..." required />
                        <TextInput label="Manfaat Kepada Institusi" name="institutionBenefits" value={formData.institutionBenefits || ''} onChange={handleChange} isTextArea placeholder="Menyediakan kemudahan 24 jam, meningkatkan imej institusi..." required />
                        <TextInput label="Jangkaan Mula Operasi" name="operationStartDate" value={formData.operationStartDate || ''} onChange={handleChange} type="date" />
                    </div>
                )}
                
                 {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        <SelectInput label="Jenis Mesin" name="machineType" value={formData.machineType || ''} onChange={handleChange} options={['Kombinasi', 'Snek', 'Minuman']} required />
                        <TextInput label="Jenama Mesin" name="machineBrand" value={formData.machineBrand || ''} onChange={handleChange} placeholder="cth., Fuji Electric, SmartVend" required />
                        <TextInput label="Bilangan Unit" name="machineCount" type="number" value={formData.machineCount || 1} onChange={handleChange} required />
                    </div>
                )}
                
                {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Muat Naik Senarai Produk (Excel/CSV)</label>
                            <input type="file" onChange={(e) => handleFileUpload(e, 'rawProductList')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" accept=".xlsx,.xls,.csv" />
                            {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
                            {formData.rawProductList && <p className="text-xs text-green-600 mt-1">✓ Fail produk telah dibaca.</p>}
                             <p className="text-xs text-gray-400 mt-1">Jika tiada, AI akan mencadangkan produk popular.</p>
                        </div>
                    </div>
                )}
                
                 {currentStep === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imej Mesin</label>
                            <div className="flex gap-4">
                                <RadioInput label="Biar AI pilih imej terbaik" name="useAiImage" value="true" checked={formData.useAiImage === true} onChange={handleChange} />
                                <RadioInput label="Saya muat naik imej sendiri" name="useAiImage" value="false" checked={formData.useAiImage === false} onChange={handleChange} />
                            </div>
                        </div>
                        {formData.useAiImage === false && (
                            <div>
                                <input type="file" onChange={(e) => handleFileUpload(e, 'machineImage')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
                                {formData.machineImage && <img src={`data:image/png;base64,${formData.machineImage}`} alt="Preview" className="w-24 h-auto mt-2 rounded-md border p-1" />}
                            </div>
                        )}
                        <div className="pt-4">
                             <h4 className="font-semibold mb-2">Dokumen Tambahan</h4>
                             <CheckboxInput label="Sertakan surat rasmi iringan?" name="includeCoverLetter" checked={formData.includeCoverLetter || false} onChange={handleChange} />
                        </div>
                    </div>
                )}
                
                {currentStep === 4 && (
                     <div className="space-y-6 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nada Proposal</label>
                            <SelectInput name="proposalTone" value={formData.proposalTone} onChange={handleChange} options={['Formal & Korporat', 'Moden & Kreatif', 'Mesra & Komuniti']} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tema Warna</label>
                             <SelectInput name="colorTheme" value={formData.colorTheme} onChange={handleChange} options={['Korporat (RBE)', 'Elegan (Emas & Hitam)', 'Moden & Minimalis']} />
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="text-center p-8 bg-gray-50 rounded-lg animate-fadeIn">
                        <h3 className="text-xl font-bold">Semakan Akhir</h3>
                        <p className="text-gray-600 mt-2">Sila pastikan semua maklumat tepat sebelum menjana proposal.</p>
                        <button onClick={handleSubmit} className="mt-6 px-8 py-3 bg-brand-gold text-brand-black font-bold rounded-md hover:opacity-90 transition-opacity text-lg">
                           Sahkan & Jana Dokumen
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
                <button onClick={prevStep} disabled={currentStep === 0} className="px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50">Kembali</button>
                {currentStep < STEPS.length - 1 && (
                    <button onClick={nextStep} className="px-6 py-2 rounded-md bg-brand-black text-white hover:bg-gray-800">Seterusnya</button>
                )}
            </div>
        </div>
    );
};

const TextInput: React.FC<any> = ({ label, name, value, onChange, type = 'text', placeholder, required, isTextArea }) => (
    <div className="col-span-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
        {isTextArea ? (
             <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
        ) : (
             <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
        )}
    </div>
);

const SelectInput: React.FC<any> = ({ label, name, value, onChange, options }) => (
     <div className="col-span-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const CheckboxInput: React.FC<any> = ({ label, name, checked, onChange }) => (
    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red" />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

const RadioInput: React.FC<any> = ({ label, name, value, checked, onChange }) => (
    <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border flex-1 cursor-pointer">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-brand-red focus:ring-brand-red" />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

export default InterviewWizard;