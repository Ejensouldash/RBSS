import React from 'react';

export const GlobeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.248 0 .493-.011.734-.034M12 21c-.248 0-.493-.011-.734-.034M3.234 14.254a9.004 9.004 0 0 1 0-4.508M20.766 14.254a9.004 9.004 0 0 0 0-4.508M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3a9.004 9.004 0 0 1 8.716 6.747M12 3c-.248 0-.493.011-.734.034M12 3c.248 0 .493.011.734.034M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
);