import React from 'react';

export const ScaleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c-1.472 0-2.882.265-4.185.75M18.75 4.97c2.291-.31 4.545-.47 6.75-.47s4.459.16 6.75.47M12 4.5c-1.472 0-2.882.265-4.185.75M5.25 4.97A48.416 48.416 0 0 1 12 4.5c2.291 0 4.545.16 6.75.47m-13.5 0c1.472 0 2.882.265 4.185.75M5.25 4.97c-2.291-.31-4.545-.47-6.75-.47s-4.459.16-6.75.47" />
    </svg>
);
