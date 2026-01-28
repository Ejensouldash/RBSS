import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';

interface GenerationLoaderProps {
    steps: string[];
    currentStep: number;
}

const GenerationLoader: React.FC<GenerationLoaderProps> = ({ steps, currentStep }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white rounded-lg min-h-[400px]">
            <SparklesIcon className="w-16 h-16 text-brand-gold animate-pulse mb-4" />
            <h3 className="text-xl font-bold text-brand-text">AI Sedang Mereka Bentuk Proposal Anda</h3>
            <p className="text-gray-500 mt-1">Sila tunggu, proses ini melibatkan penjanaan teks dan imej yang kompleks.</p>
            <div className="mt-8 text-left w-full max-w-lg font-mono text-sm text-gray-600 space-y-3">
                {steps.map((step, index) => (
                    <div key={index} className={`transition-all duration-500 flex items-center ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                            {index < currentStep ? (
                                <span className="w-4 h-4 bg-green-500 rounded-full text-white flex items-center justify-center text-xs shadow-md">✔</span>
                            ) : (
                                <div className="w-4 h-4 relative">
                                    <span className={`w-full h-full bg-gray-300 rounded-full ${index === currentStep ? 'animate-pulse' : ''}`}></span>
                                </div>
                            )}
                        </div>
                        <span className={`truncate transition-colors ${index === currentStep ? 'font-semibold text-brand-text' : ''}`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenerationLoader;