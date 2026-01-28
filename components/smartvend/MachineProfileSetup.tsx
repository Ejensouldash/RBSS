import React, { useState } from 'react';
import { MachineProfile, MachineType, MachineEnvironment, MaintenanceFrequency } from '../../types';

interface MachineProfileSetupProps {
    onSubmit: (profile: MachineProfile) => void;
}

const initialProfile: MachineProfile = {
    machineId: 'RBE-VM01',
    machineModel: 'Fuji Electric FHV-9C',
    machineType: 'Combo',
    slotCapacity: 36,
    totalStock: 720,
    powerConsumptionW: 250,
    machineCost: 12000,
    monthlyElectricityCost: 80,
    location: 'KPTM Seremban',
    environment: 'College',
    maintenanceFrequency: 'Weekly',
};

const MachineProfileSetup: React.FC<MachineProfileSetupProps> = ({ onSubmit }) => {
    const [profile, setProfile] = useState<MachineProfile>(initialProfile);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['slotCapacity', 'totalStock', 'powerConsumptionW', 'machineCost', 'monthlyElectricityCost'].includes(name);
        setProfile(prev => ({
            ...prev,
            [name]: isNumericField ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(profile);
        setIsSubmitted(true);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-brand-text mb-1">1. Machine Profile Setup</h2>
            <p className="text-sm text-gray-500 mb-6">Provide details about the vending machine for an accurate analysis.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Machine Info */}
                    <InputField label="Machine ID" name="machineId" value={profile.machineId} onChange={handleChange} />
                    <InputField label="Machine Model" name="machineModel" value={profile.machineModel} onChange={handleChange} />
                    <SelectField label="Machine Type" name="machineType" value={profile.machineType} onChange={handleChange} options={['Drink', 'Snack', 'Combo']} />
                    
                    {/* Capacity */}
                    <InputField label="Slot Capacity" name="slotCapacity" type="number" value={profile.slotCapacity} onChange={handleChange} />
                    <InputField label="Total Stock Capacity" name="totalStock" type="number" value={profile.totalStock} onChange={handleChange} />
                    
                    {/* Costs */}
                    <InputField label="Machine Cost (RM)" name="machineCost" type="number" value={profile.machineCost} onChange={handleChange} />
                    <InputField label="Monthly Electricity (RM)" name="monthlyElectricityCost" type="number" value={profile.monthlyElectricityCost} onChange={handleChange} />
                    <InputField label="Power (Watts)" name="powerConsumptionW" type="number" value={profile.powerConsumptionW} onChange={handleChange} />

                    {/* Location & Maintenance */}
                    <InputField label="Location" name="location" value={profile.location} onChange={handleChange} />
                    <SelectField label="Environment" name="environment" value={profile.environment} onChange={handleChange} options={['College', 'Office', 'Hospital', 'Factory', 'Public Space']} />
                    <SelectField label="Maintenance" name="maintenanceFrequency" value={profile.maintenanceFrequency} onChange={handleChange} options={['Daily', 'Weekly', 'Bi-Weekly', 'Monthly']} />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitted} className="px-6 py-2 bg-brand-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isSubmitted ? 'Profile Saved' : 'Save Machine Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper components for form fields
const InputField: React.FC<any> = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none" required />
    </div>
);

const SelectField: React.FC<any> = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white" required>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default MachineProfileSetup;
