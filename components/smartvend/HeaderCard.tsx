import React from 'react';

interface HeaderCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtext?: string;
}

const HeaderCard: React.FC<HeaderCardProps> = ({ title, value, icon, subtext }) => {
    return (
        <div className="bg-gradient-to-br from-gray-800 to-brand-black p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-300">{title}</p>
                <div className="text-2xl text-brand-gold">
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    );
};

export default HeaderCard;
