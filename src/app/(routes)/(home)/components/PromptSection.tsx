"use client";

import { memo, useMemo, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";

interface PromptSectionProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    hasImage: boolean;
    onSurpriseMe: () => void;
}

export const PromptSection = memo(function PromptSection({
    prompt,
    onPromptChange,
    hasImage,
    onSurpriseMe,
}: PromptSectionProps) {
    const placeholder = useMemo(() =>
        hasImage
            ? "e.g., Make it look like a traditional paper cutting, add red lanterns in background"
            : "Describe your festive image... e.g., 'A golden snake coiled around a lucky coin stack'",
        [hasImage]
    );

    const labelText = useMemo(() =>
        hasImage ? "Add Instructions (Optional)" : "Describe Your Vision",
        [hasImage]
    );

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onPromptChange(e.target.value);
    }, [onPromptChange]);

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <label className="text-cny-gold font-serif text-lg flex items-center gap-2">
                    <Icons.Wand2 className="w-5 h-5" />
                    {labelText}
                </label>
                <button
                    onClick={onSurpriseMe}
                    className="text-xs text-gray-400 hover:text-white underline decoration-dashed underline-offset-4 flex items-center gap-1"
                >
                    <Icons.Sparkles className="w-3 h-3" />
                    Surprise Me
                </button>
            </div>
            <textarea
                value={prompt}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cny-gold/50 focus:ring-1 focus:ring-cny-gold/50 resize-none transition-all"
            />
        </div>
    );
});
