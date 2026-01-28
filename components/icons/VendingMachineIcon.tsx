import React from 'react';

export const VendingMachineIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 21v-3.75c0-1.02.83-1.85 1.85-1.85h10.8c1.02 0 1.85.83 1.85 1.85V21M6.75 1.5v3M17.25 1.5v3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18c1.24 0 2.25 1.01 2.25 2.25v9.75c0 1.24-1.01 2.25-2.25 2.25H3c-1.24 0-2.25-1.01-2.25-2.25V6.75C.75 5.51 1.76 4.5 3 4.5ZM3.75 9h16.5M5.25 12.75h5.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75h2.25" />
    </svg>
);