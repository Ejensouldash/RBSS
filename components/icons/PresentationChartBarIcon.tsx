import React from 'react';

export const PresentationChartBarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H6.75m-3.375 0V15m0 4.5v-1.5c0-.621.504-1.125 1.125-1.125H6.75m12-3V3.375c0-.621-.504-1.125-1.125-1.125H8.25a1.125 1.125 0 0 0-1.125 1.125v3.75m-3.75 0V3.375c0-.621.504-1.125 1.125-1.125h3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5v-3m3 3v-6m3 6v-3m-6 3h.008v.008H9v-.008Zm3 0h.008v.008H12v-.008Zm3 0h.008v.008H15v-.008Z" />
    </svg>
);
