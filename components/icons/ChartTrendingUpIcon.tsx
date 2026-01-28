import React from 'react';

export const ChartTrendingUpIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 9l4.5 4.5L21.75 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6H21m-17.25 0v12" />
    </svg>
);
