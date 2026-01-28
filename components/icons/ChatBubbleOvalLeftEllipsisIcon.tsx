import React from 'react';

export const ChatBubbleOvalLeftEllipsisIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.761 9.761 0 0 1-2.542-.381 1.487 1.487 0 0 1-.97-1.723c.283-.656.597-1.308.925-1.956.342-.673.684-1.346 1.025-2.018.335-.658.66-1.319.97-1.981.32-.67.63-1.341.93-2.015.31-.682.6-1.379.87-2.085c.28-.713.53-1.444.75-2.193.22-.753.38-1.529.47-2.316C13.03 4.31 14.53 3 16.5 3c2.485 0 4.5 2.582 4.5 5.75 0 1.996-.962 3.73-2.38 4.75Z" />
    </svg>
);
