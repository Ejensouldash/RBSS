import React from 'react';

export const TableCellsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H6.75m-3.375 0V15m0 4.5v-1.5c0-.621.504-1.125 1.125-1.125H6.75m0 3H17.25m-10.5-3v-1.5c0-.621.504-1.125 1.125-1.125h1.5v1.5m0 0h1.5m-1.5 0h-1.5m-1.5 0H3.375m0 0v-1.5c0-.621.504-1.125 1.125-1.125h1.5M6.75 12v1.5m0 0H17.25m-10.5 0h10.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 6.75h17.25M3.375 6.75a1.125 1.125 0 0 0-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125H6.75m-3.375 0v-1.5m0 3v-1.5c0-.621.504-1.125 1.125-1.125H6.75m0-3H17.25m0 0v1.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5m-1.5 0H6.75m9 0v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5a1.125 1.125 0 0 0-1.125 1.125v1.5" />
    </svg>
);
