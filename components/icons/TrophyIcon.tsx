import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 0 9 0Zm0 0c0 .517.02 1.032.057 1.541a.75.75 0 0 1-.728.799H8.171a.75.75 0 0 1-.728-.799A9.753 9.753 0 0 0 7.5 18.75m9 0-4.5-4.5m0 0-4.5 4.5M12 14.25V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3.75m0 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M12 3v3.75m0 0a1.5 1.5 0 0 1 3 0m-3 0a1.5 1.5 0 0 0 3 0M12 3v3.75M9 6.75h6" />
    </svg>
);
