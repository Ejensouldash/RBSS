import { useState, useEffect } from 'react';

const useAnimatedCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const animationFrame = (timestamp: number) => {
            if (!startTime) {
                startTime = timestamp;
            }
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const newCount = progress * end;
            setCount(newCount);
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            }
        };
        requestAnimationFrame(animationFrame);

        return () => {
            // Cleanup if needed
        };
    }, [end, duration]);

    return count;
};

export default useAnimatedCounter;
