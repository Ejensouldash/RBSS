import React from 'react';

export const ConstructionIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 0 0 .75-.75V8.634l.547-.273a.75.75 0 0 0 0-1.328l-5.498-2.75a.75.75 0 0 0-.547 0l-5.498 2.75a.75.75 0 0 0 0 1.328l.547.273v9.366a.75.75 0 0 0 .75.75h9.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 18.75a.75.75 0 0 0 .75-.75V8.634l.547-.273a.75.75 0 0 0 0-1.328l-5.498-2.75a.75.75 0 0 0-.547 0l-5.498 2.75a.75.75 0 0 0 0 1.328l.547.273v9.366a.75.75 0 0 0 .75.75h9.75Z" />
    </svg>
);