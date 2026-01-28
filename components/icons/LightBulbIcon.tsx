import React from 'react';

export const LightBulbIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311V21m-3.75 0V18.5m0 0a6.007 6.007 0 0 1-1.5-.189m1.5.189a6.007 6.007 0 0 0 1.5-.189m-1.5 5.25h.008v.008h-.008v-.008Zm-3.75 0h.008v.008h-.008v-.008Zm7.5 0h.008v.008h-.008v-.008Zm-3.75 0h.008v.008h-.008v-.008Z" />
    </svg>
);
