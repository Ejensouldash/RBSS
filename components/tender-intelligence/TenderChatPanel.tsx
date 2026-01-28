import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TenderIntelligenceResult, TenderChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

interface TenderChatPanelProps {
    analysisResult: TenderIntelligenceResult;
    isOpen: boolean; // Retained for potential future use, but UI is now always open within tab
    onToggle: () => void;
}

const TenderChatPanel: React.FC<TenderChatPanelProps> = ({ analysisResult, isOpen, onToggle }) => {
    const [messages, setMessages] = useState<TenderChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY as string }));

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: `ai-welcome-${Date.now()}`,
                    text: `I have the full analysis for the **${analysisResult.summary.tenderTitle}** tender. Ask me anything about it. For example, "Why is my win rate ${analysisResult.summary.winRate}%?"`,
                    sender: 'ai',
                }
            ]);
        }
    }, [analysisResult.summary.tenderTitle, analysisResult.summary.winRate, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: TenderChatMessage = { id: `user-${Date.now()}`, text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const prompt = `You are an AI Tender Analyst Chatbot. Your knowledge is strictly limited to the data provided below for this specific tender analysis.

**CONTEXT: CURRENT TENDER ANALYSIS DATA**
---
${JSON.stringify(analysisResult, null, 2)}
---

**USER'S QUESTION:** "${currentInput}"

**YOUR TASK:**
1.  **Answer Directly:** Answer the user's question using ONLY the context data provided above. If the user asks "Why is my win rate X%?", use the 'competitiveness.winRateBreakdown' object to explain the contributing factors.
2.  **Be Concise & Data-Rich:** Keep your answers short and full of specific numbers from the data.
3.  **Format Responses:** Use markdown for bolding and lists.
4.  **Admit Limits:** If the question cannot be answered with the provided data, politely say so.`;

            const response = await ai.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { temperature: 0.1 }
            });

            const aiResponse: TenderChatMessage = { id: `ai-${Date.now()}`, text: response.text, sender: 'ai' };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Tender Chat Error:", error);
            const errorResponse: TenderChatMessage = { id: `ai-error-${Date.now()}`, text: "Sorry, I had trouble processing that. Please try again.", sender: 'ai' };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, analysisResult]);

    const quickPrompts = [
        "Why is my win rate not 90%?",
        "Which item has the highest margin?",
        "Summarize the main risks.",
        "What is my final bid price?"
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-[70vh] flex flex-col">
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-brand-black text-white' : 'bg-gray-100 text-gray-800'}`}>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 text-sm">
                             <div className="flex items-center space-x-1.5">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
             <div className="p-4 border-t border-gray-200 bg-white">
                 <div className="flex flex-wrap gap-2 mb-2">
                     {quickPrompts.map(prompt => (
                         <button key={prompt} onClick={() => setInput(prompt)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors">{prompt}</button>
                     ))}
                 </div>
                <div className="flex items-center bg-gray-100 rounded-full p-1">
                     <input
                        type="text" value={input} onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about this tender..."
                        className="flex-grow bg-transparent px-3 text-sm focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="p-2 bg-brand-black text-white rounded-full hover:bg-brand-red disabled:bg-gray-500">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenderChatPanel;