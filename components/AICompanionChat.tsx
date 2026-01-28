import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page } from '../App';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import AIInsightsPanel from './AIInsightsPanel';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';
import { DocumentMagnifyingGlassIcon } from './icons/DocumentMagnifyingGlassIcon';
import { GoogleGenAI, Chat } from '@google/genai';

// FIX: Add SpeechRecognition types to the window object to prevent TypeScript errors.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AICompanionChatProps {
    activePage: Page;
    onClose: () => void;
    setActivePage: (page: Page) => void;
}

const getContextualWelcomeMessage = (page: Page): string => {
    switch (page) {
        case 'Quotations':
            return "Hi Bos! Looking at quotations, eh? Need help calculating costs or suggesting items? Just ask, or go to the AI Tender Workspace to analyze a BQ.";
        case 'Projects':
            return "Project management view. Saya boleh tolong beri ringkasan status, kenal pasti risiko, atau ramalkan tarikh siap. What do you need?";
        case 'Dashboard':
            return "Welcome to the main dashboard! I can provide a summary of your business performance or highlight key trends. Just say the word.";
        case 'Invoices':
            return "Handling invoices? I can help you track payments or identify overdue accounts. How can I assist?";
        case 'AI Tender Workspace':
             return "This is the AI Tender Workspace. Upload a Bill of Quantities (BQ) to begin an autonomous cost and strategy analysis. I'm here if you have any questions!";
        default:
            return "Hello Bos! I'm Rozita, your AI companion. You can ask me anything or go to the AI Tender Workspace for a deep analysis of your BQ documents.";
    }
};

const AICompanionChat: React.FC<AICompanionChatProps> = ({ activePage, onClose, setActivePage }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [activeTab, setActiveTab] = useState<'Chat' | 'Insights'>('Chat');
    
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        setMessages([
            {
                id: `ai-welcome-${Date.now()}`,
                text: getContextualWelcomeMessage(activePage),
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
            }
        ]);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const systemInstruction = `
You are Rozita AI (RBE-AI Companion), a friendly, confident, and professional AI assistant for Rozita Bina Enterprise, a Malaysian construction company.

Your main abilities are:
- Create quotations.
- Analyze tenders and Bill of Quantities (BQ) in the dedicated 'AI Tender Workspace'.
- Research current market prices for construction materials in Malaysia.
- Estimate project budgets.

Your response style:
- Use short paragraphs (1–2 sentences).
- Mix Malay and English naturally and politely (Manglish).
- Always be helpful and proactive.

Behavior rules:
1. If the user asks a general question about you (e.g., "apa awak boleh buat?", "who are you?"), introduce yourself and your main abilities. Example: "Saya Rozita AI, pembantu pintar dalam sistem Rozita Bina Enterprise. Saya boleh bantu buat quotation, analisis tender, semak harga semasa bahan binaan, dan kira bajet projek. Nak saya bantu yang mana dulu?"
2. If the user's question is about specific materials (e.g., pasir, simen, bitumen, longkang), focus on providing current market price analysis or cost estimations. You should use your knowledge to provide realistic, up-to-date information for Malaysia.
3. If the user's question is about "tender", "quotation", or "project", gently guide them to the 'AI Tender Workspace' for detailed analysis.
4. If the user asks something casual or conversational, respond naturally, short, and friendly. Example: "Hehe okay bos 😄 saya standby kalau nak semak harga bahan atau nak kira tender baru."
5. If you are unsure, ask for clarification.
6. Your persona is an expert assistant, so your answers should be confident.
7. The user is your "Bos".
`;
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });

    }, [activePage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);
    
    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || !chatRef.current) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text: input,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        try {
            const response = await chatRef.current.sendMessage({ message: currentInput });

            const aiResponse: ChatMessage = {
                id: `ai-${Date.now()}`,
                text: response.text,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorResponse: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                text: "Sorry bos, saya ada masalah sikit nak berhubung dengan server. Boleh cuba lagi sekejap?",
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    }, [input]);
    
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support voice recognition.");
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'ms-MY';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            }
        }
        
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleNavigateToWorkspace = () => {
        setActivePage('AI Tender Workspace');
        onClose();
    };

    const renderTabs = () => (
        <div className="flex justify-center mt-2">
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-full">
                <button onClick={() => setActiveTab('Chat')} className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center space-x-2 ${activeTab === 'Chat' ? 'bg-white shadow' : 'text-gray-600'}`}>
                    <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                    <span>Chat</span>
                </button>
                 <button onClick={handleNavigateToWorkspace} className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center space-x-2 text-gray-600`}>
                    <DocumentMagnifyingGlassIcon className="w-5 h-5"/>
                    <span>Workspace</span>
                </button>
                <button onClick={() => setActiveTab('Insights')} className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center space-x-2 ${activeTab === 'Insights' ? 'bg-white shadow' : 'text-gray-600'}`}>
                   <SparklesIcon className="w-5 h-5"/>
                   <span>Insights</span>
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'Chat':
                return (
                    <>
                        {/* Messages */}
                        <main className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-sm lg:max-w-md rounded-2xl p-3 text-sm ${msg.sender === 'user' ? 'bg-brand-black text-white rounded-br-none' : 'bg-brand-gold bg-opacity-20 text-brand-text rounded-bl-none'}`}>
                                        <div>{msg.text}</div>
                                        <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-400 text-right' : 'text-gray-500'}`}>{msg.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-brand-gold bg-opacity-20 text-brand-text rounded-2xl p-3 text-sm rounded-bl-none">
                                        <div className="flex items-center space-x-1">
                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </main>

                        {/* Input */}
                        <footer className="p-4 bg-white border-t rounded-b-2xl">
                            <div className="flex items-center bg-gray-100 rounded-full p-1">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                                    className="flex-grow bg-transparent p-2 text-sm text-brand-text focus:outline-none"
                                />
                                <button onClick={handleVoiceInput} className={`p-2 text-gray-500 hover:text-brand-red ${isListening ? 'text-brand-red animate-pulse' : ''}`}>
                                    <MicrophoneIcon className="w-5 h-5" />
                                </button>
                                <button onClick={handleSendMessage} className="p-2 bg-brand-black text-white rounded-full hover:bg-brand-red">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </footer>
                    </>
                );
            case 'Insights':
                return <AIInsightsPanel activePage={activePage} />;
            default:
                return null;
        }
    };


    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-2xl">
            {/* Header */}
            <header className="p-4 border-b bg-white rounded-t-2xl">
                <h3 className="text-lg font-bold text-brand-text text-center">RBE-AI Companion</h3>
                {renderTabs()}
            </header>

            {/* Content */}
            {renderContent()}
        </div>
    );
};

export default AICompanionChat;