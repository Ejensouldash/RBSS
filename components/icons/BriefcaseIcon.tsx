import React from 'react';

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075c0 1.313-.972 2.4-2.222 2.4H5.972c-1.25 0-2.222-1.087-2.222-2.4V14.15M15.75 18.225v-2.175a1.5 1.5 0 0 0-1.5-1.5h-3.75a1.5 1.5 0 0 0-1.5 1.5v2.175M15.75 12.75v-1.5a3 3 0 0 0-3-3h-1.5a3 3 0 0 0-3 3v1.5m5.25 6v-2.25h-1.5v2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);