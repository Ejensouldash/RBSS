
import React, { useState, useCallback, useEffect } from 'react';
import { CompanyInfo } from '../types';

interface SettingsPageProps {
    companyInfo: CompanyInfo;
    onSave: (newCompanyInfo: CompanyInfo) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ companyInfo, onSave }) => {
    const [settings, setSettings] = useState<CompanyInfo>(companyInfo);
    const [logoPreview, setLogoPreview] = useState<string | undefined>(companyInfo.logo);
    const [activeTab, setActiveTab] = useState<'profile' | 'licenses' | 'document'>('profile');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setSettings(companyInfo);
        setLogoPreview(companyInfo.logo);
    }, [companyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: name === 'taxRate' ? Number(value) : value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert("Logo file is too large. Please upload an image under 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setSettings(prev => ({ ...prev, logo: base64String }));
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
            alert("Please enter a valid email address.");
            return;
        }
        onSave(settings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const removeLogo = useCallback(() => {
        setSettings(prev => ({ ...prev, logo: undefined }));
        setLogoPreview(undefined);
    }, []);
    
    const TabButton: React.FC<{ label: string; tabName: 'profile' | 'licenses' | 'document' }> = ({label, tabName}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 focus:outline-none ${
                activeTab === tabName ? 'bg-white border-t border-l border-r border-gray-200 text-brand-red' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-brand-text mb-8">System Settings</h1>

             {showSuccess && (
                <div className="fade-in-up fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                    <span>✅</span>
                    <span>Tetapan berjaya disimpan!</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
                <div className="flex border-b border-gray-200">
                    <TabButton label="Profil Syarikat" tabName="profile" />
                    <TabButton label="Lesen & Pendaftaran" tabName="licenses" />
                    <TabButton label="Tetapan Dokumen & Kewangan" tabName="document" />
                </div>

                <div className="bg-white p-8 rounded-b-lg rounded-r-lg shadow-xl border-l border-r border-b border-gray-200">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Maklumat Asas</h3>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nama Syarikat</label>
                                        <input type="text" id="name" name="name" value={settings.name} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                                    </div>
                                     <div>
                                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">Alamat Berdaftar</label>
                                        <textarea id="address" name="address" value={settings.address} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="tel" className="block text-sm font-semibold text-gray-700 mb-1">No. Telefon</label>
                                            <input type="text" id="tel" name="tel" value={settings.tel} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Emel</label>
                                            <input type="email" id="email" name="email" value={settings.email} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Syarikat</label>
                                     <div className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                                        {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain p-2"/> : <span className="text-gray-400 text-sm">Tiada Logo</span> }
                                     </div>
                                     <input type="file" id="logo" name="logo" onChange={handleLogoChange} accept="image/png, image/jpeg" className="hidden"/>
                                     <div className="flex space-x-2">
                                         <label htmlFor="logo" className="w-full text-center cursor-pointer px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Muat Naik Logo</label>
                                        {logoPreview && <button type="button" onClick={removeLogo} className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">Padam</button> }
                                     </div>
                                     <p className="text-xs text-gray-500 mt-1">Disyorkan: PNG/JPG, {'<'} 1MB.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'licenses' && (
                        <div className="space-y-8 animate-fadeIn">
                            <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Maklumat Pendaftaran & Pematuhan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="registrationNo" className="block text-sm font-semibold text-gray-700 mb-1">No. Pendaftaran Perniagaan (SSM)</label>
                                    <input type="text" id="registrationNo" name="registrationNo" value={settings.registrationNo || ''} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" placeholder="cth. 201703267509 (NS0187482-H)"/>
                                </div>
                                <div>
                                    <label htmlFor="ssmExpiry" className="block text-sm font-semibold text-gray-700 mb-1">Tarikh Luput SSM</label>
                                    <input type="date" id="ssmExpiry" name="ssmExpiry" value={settings.ssmExpiry || ''} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                                </div>
                                <div>
                                    <label htmlFor="cidbGrade" className="block text-sm font-semibold text-gray-700 mb-1">Gred & Kategori CIDB</label>
                                    <input type="text" id="cidbGrade" name="cidbGrade" value={settings.cidbGrade || ''} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" placeholder="cth. G1 (B, CE, ME)"/>
                                </div>
                                <div>
                                    <label htmlFor="cidbExpiry" className="block text-sm font-semibold text-gray-700 mb-1">Tarikh Luput CIDB</label>
                                    <input type="date" id="cidbExpiry" name="cidbExpiry" value={settings.cidbExpiry || ''} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="pkkStatus" className="block text-sm font-semibold text-gray-700 mb-1">Status Taraf Bumiputera (PKK)</label>
                                    <input type="text" id="pkkStatus" name="pkkStatus" value={settings.pkkStatus || ''} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" placeholder="cth. Taraf Bumiputera (Sah sehingga ...)"/>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'document' && (
                        <div className="space-y-8 animate-fadeIn">
                             <h3 className="text-lg font-semibold text-brand-text border-b pb-2">Lalari Quotation & Invoice</h3>
                             <div>
                                <label htmlFor="defaultTerms" className="block text-sm font-semibold text-gray-700 mb-1">Terma & Syarat Lalai</label>
                                <textarea id="defaultTerms" name="defaultTerms" value={settings.defaultTerms} onChange={handleChange} rows={5} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="taxRate" className="block text-sm font-semibold text-gray-700 mb-1">Kadar Cukai Lalai (%)</label>
                                    <input type="number" id="taxRate" name="taxRate" value={settings.taxRate} onChange={handleChange} step="0.1" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" placeholder="cth. 0 atau 6"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="bankInfo" className="block text-sm font-semibold text-gray-700 mb-1">Maklumat Bank (Untuk Invoice)</label>
                                <textarea id="bankInfo" name="bankInfo" value={settings.bankInfo} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" placeholder="cth. Maybank - 123456789 (Nama Syarikat)"/>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 mt-6 border-t border-gray-300 flex justify-end">
                    <button type="submit" className="px-8 py-2 rounded-md bg-brand-black text-white font-semibold hover:bg-gray-800 transition-colors duration-200">
                        Simpan Tetapan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
