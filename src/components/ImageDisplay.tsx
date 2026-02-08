"use client";

import { useState } from 'react';
import { Icons } from './ui/Icons';

interface ImageDisplayProps {
    imageUrl: string | null;
    isLoading: boolean;
    loadingMessage?: string;
}

export const ImageDisplay = ({ imageUrl, isLoading, loadingMessage }: ImageDisplayProps) => {
    const [isZoomed, setIsZoomed] = useState(false);

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `cny-creation-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full aspect-square rounded-2xl glass-panel flex flex-col items-center justify-center p-8 text-center border-2 border-cny-gold/30">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-cny-gold/20 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-0 border-t-4 border-cny-gold rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icons.Lantern className="text-cny-red w-8 h-8 animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-serif text-cny-gold mb-2">Creating Magic...</h3>
                <p className="text-sm text-gray-300 animate-pulse">{loadingMessage || "Invoking the digital spirits..."}</p>
            </div>
        );
    }

    if (!imageUrl) {
        return (
            <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center p-8 text-center bg-black/10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Icons.Image className="w-10 h-10 text-white/30" />
                </div>
                <p className="text-gray-400 font-serif">Your masterpiece will appear here</p>
                <p className="text-xs text-gray-600 mt-2">Select a style and enter a prompt to begin</p>
            </div>
        );
    }

    return (
        <div className="relative group w-full h-full">
            <div className={`relative w-full h-full overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 border border-cny-gold/20 ${isZoomed ? 'fixed inset-0 z-50 bg-black/90 p-10' : 'aspect-square'}`}>
                {isZoomed && (
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 z-10"
                    >
                        <Icons.X className="text-white w-6 h-6" />
                    </button>
                )}

                <img
                    src={imageUrl}
                    alt="Generated CNY Art"
                    className={`w-full h-full ${isZoomed ? 'object-contain' : 'object-cover'} transition-transform duration-700 hover:scale-105 cursor-pointer`}
                    onClick={() => !isZoomed && setIsZoomed(true)}
                />

                {/* Overlay Actions */}
                {!isZoomed && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                        <span className="text-xs text-gray-300 font-mono">Gemini 2.0 Flash</span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className="p-2 bg-white/10 hover:bg-cny-gold hover:text-red-900 rounded-lg backdrop-blur-md transition-colors"
                                title="Download"
                            >
                                <Icons.Download className="w-5 h-5" />
                            </button>
                            <button
                                className="p-2 bg-white/10 hover:bg-blue-500 hover:text-white rounded-lg backdrop-blur-md transition-colors"
                                title="Share"
                            >
                                <Icons.Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
