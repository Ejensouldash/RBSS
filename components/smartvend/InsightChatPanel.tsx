import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MachineProfile, AIVendingAnalysis, InsightChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

interface InsightChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    machineProfile: MachineProfile;
    analysisResult: AIVendingAnalysis;
}

const InsightChatPanel: React.FC<InsightChatPanelProps> = ({ isOpen, onClose, machineProfile, analysisResult }) => {
    const [messages, setMessages] = useState<InsightChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Set initial welcome message when the panel opens for the first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: `ai-welcome-${Date.now()}`,
                    text: `Hello! I have the full analysis for **${machineProfile.machineId}** ready. Ask me anything about the results, or ask for a 'what-if' scenario. For example: "What if I raise the price of Kopi Botol to RM3.50?"`,
                    sender: 'ai',
                }
            ]);
        }
    }, [isOpen, messages.length, machineProfile.machineId]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);


    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: InsightChatMessage = {
            id: `user-${Date.now()}`,
            text: input,
            sender: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            // Construct a very specific, context-rich prompt
            const prompt = `
You are an AI Vending Machine Analyst Chatbot. Your knowledge is strictly limited to the data provided below for a specific analysis session. Do NOT use any external knowledge.

**CONTEXT: CURRENT ANALYSIS DATA**
---
**1. Machine Profile:**
${JSON.stringify(machineProfile, null, 2)}

**2. Full Analysis Results:**
${JSON.stringify(analysisResult, null, 2)}
---

**USER'S QUESTION:**
"${currentInput}"

**YOUR TASK:**
1.  **Answer Directly:** Answer the user's question using ONLY the context data provided above.
2.  **Perform "What-If" Calculations:** If the user asks a hypothetical question (e.g., changing a price, sales drop), perform the calculation based on the provided data and show the result.
3.  **Be Concise & Data-Rich:** Keep your answers short, professional, and full of specific numbers from the data. Use emojis to add visual cues (e.g., 🚀 for improvement, 📉 for a drop).
4.  **Format Responses:** Use markdown for bolding and lists to make the response easy to read. Example: "If you raise the price of Kopi Botol to RM3.50, the new profit per unit would be **RM2.30** (+27.8%) 🚀. This would improve your estimated ROI to **6.5 months**."
5.  **Admit Limits:** If the question cannot be answered with the provided data, politely say so. Example: "I can't answer that as it's outside the scope of the current analysis data."
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: { temperature: 0.2 }
            });
            
            const aiResponse: InsightChatMessage = {
                id: `ai-${Date.now()}`,
                text: response.text,
                sender: 'ai',
            };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Insight Chat Error:", error);
            const errorResponse: InsightChatMessage = {
                id: `ai-error-${Date.now()}`,
                text: "Sorry, I encountered an issue processing that request. Please try asking in a different way.",
                sender: 'ai',
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, machineProfile, analysisResult, messages]);

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-black bg-opacity-80 backdrop-blur-sm shadow-2xl flex flex-col transition-transform duration-300 ease-in-out z-50 transform
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-brand-gold">🤖 AI Insight Chat</h3>
                 <p className="text-xs text-gray-400">Ask follow-up questions about the current analysis.</p>
            </div>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm rounded-2xl p-3 text-sm ${msg.sender === 'user' ? 'bg-brand-gold text-brand-black rounded-br-none' : 'bg-gray-800 text-white rounded-bl-none'}`}>
                            <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-gray-800 text-white rounded-2xl p-3 text-sm rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input */}
            <footer className="p-4 bg-black bg-opacity-30 border-t border-gray-700">
                <div className="flex items-center bg-gray-800 rounded-full p-1">
                     <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your question..."
                        className="flex-grow bg-transparent p-2 text-sm text-white focus:outline-none placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="p-2 bg-brand-gold text-brand-black rounded-full hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default InsightChatPanel;