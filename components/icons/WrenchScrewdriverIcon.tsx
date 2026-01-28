import React from 'react';

export const WrenchScrewdriverIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.495-2.495a1.125 1.125 0 0 1 1.591 0l3.001 3.001a1.125 1.125 0 0 1 0 1.591l-2.495 2.495M11.42 15.17 3 22.59c-.53.53-.53 1.38 0 1.91l.53.53c.53.53 1.38.53 1.91 0L15.17 11.42M3 3.75l2.121 2.121m0 0 2.495 2.495a1.125 1.125 0 0 1 0 1.591l-2.495 2.495m2.495-4.086 5.877-5.877a2.652 2.652 0 0 1 3.75 0L21 8.25a2.652 2.652 0 0 1 0 3.75l-5.877 5.877m-5.877-5.877L3 3.75" />
    </svg>
);
