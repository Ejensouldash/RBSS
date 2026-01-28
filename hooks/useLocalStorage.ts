// FIX: Import React to bring the React namespace into scope for types.
import React, { useState, useEffect } from 'react';

/**
 * A custom hook that syncs state with the browser's localStorage.
 * It behaves like useState but with persistence.
 * @param key The key to use for storing the value in localStorage.
 * @param initialValue The initial value to use if nothing is stored.
 * @returns A stateful value, and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    // Pass a function to useState so this logic is only executed once on initial render.
    const [storedValue, setStoredValue] = useState<T>(() => {
        // Check if running on the client side
        if (typeof window === "undefined") {
            return initialValue;
        }

        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored JSON or return initialValue if it doesn't exist
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If there's an error (e.g., corrupted data), log it and return initialValue
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Use useEffect to update localStorage whenever the state changes.
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                // Save state to local storage
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            } catch (error) {
                // Handle potential errors, like storage being full
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
