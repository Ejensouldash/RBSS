import React, { useState } from 'react';
import { Page } from '../App';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import AICompanionChat from './AICompanionChat';

interface AICompanionProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const AICompanion: React.FC<AICompanionProps> = ({ activePage, setActivePage }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-brand-black rounded-full text-white flex items-center justify-center shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-brand-red focus:outline-none focus:ring-4 focus:ring-brand-gold focus:ring-opacity-50"
                    aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
                >
                    {isOpen ? (
                        <XMarkIcon className="w-8 h-8" />
                    ) : (
                        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
                    )}
                </button>
            </div>

            {/* Chat Window */}
            <div
                className={`fixed bottom-28 right-8 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col transition-all duration-500 ease-in-out transform
                ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}`}
            >
                {isOpen && <AICompanionChat activePage={activePage} onClose={() => setIsOpen(false)} setActivePage={setActivePage} />}
            </div>
        </>
    );
};

export default AICompanion;