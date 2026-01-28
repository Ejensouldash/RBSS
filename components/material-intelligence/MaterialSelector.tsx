import React from 'react';

interface MaterialSelectorProps {
    materials: string[];
    selectedMaterial: string;
    onSelectMaterial: (material: string) => void;
    disabled: boolean;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({ materials, selectedMaterial, onSelectMaterial, disabled }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <label htmlFor="material-select" className="block text-sm font-medium text-gray-700 mb-2">Select Material for Analysis</label>
            <select 
                id="material-select" 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white text-brand-text disabled:bg-gray-100"
                value={selectedMaterial}
                onChange={(e) => onSelectMaterial(e.target.value)}
                disabled={disabled}
            >
                {materials.map(material => (
                    <option key={material} value={material}>{material}</option>
                ))}
            </select>
        </div>
    );
};

export default MaterialSelector;
