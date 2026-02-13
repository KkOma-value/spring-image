"use client";

import { memo } from "react";
import { Icons } from "@/components/ui/Icons";
import { ImageDisplay } from "@/components/ImageDisplay";
import { ImageUploadSection } from "./ImageUploadSection";
import { PromptSection } from "./PromptSection";
import { StyleSelector } from "./StyleSelector";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { GenerateButton } from "./GenerateButton";
import { ModeSelector } from "./ModeSelector";
import { GenerationConfig, AppMode } from "@/lib/types";

interface StudioSectionProps {
    appMode: AppMode;
    setAppMode: (mode: AppMode) => void;
    hasUploadedImage: boolean;
    previewImage: string | null;
    isUploading: boolean;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDrop: (e: React.DragEvent) => void;
    clearUploadedImage: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    prompt: string;
    setPrompt: (value: string) => void;
    selectedStyle: string;
    setSelectedStyle: (styleId: string) => void;
    aspectRatio: GenerationConfig["aspectRatio"];
    setAspectRatio: (ratio: GenerationConfig["aspectRatio"]) => void;
    isLoading: boolean;
    isGenerateDisabled: boolean;
    handleGenerate: () => void;
    generatedImage: string | null;
    loadingMsg: string;
    handleSurpriseMe: () => void;
}

export const StudioSection = memo(function StudioSection({
    appMode,
    setAppMode,
    hasUploadedImage,
    previewImage,
    isUploading,
    handleFileUpload,
    handleDrop,
    clearUploadedImage,
    fileInputRef,
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle,
    aspectRatio,
    setAspectRatio,
    isLoading,
    isGenerateDisabled,
    handleGenerate,
    generatedImage,
    loadingMsg,
    handleSurpriseMe,
}: StudioSectionProps) {
    return (
        <section id="studio" className="py-24 min-h-screen relative z-10">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-cny-gold mb-4">
                        <Icons.Sparkles className="w-4 h-4" />
                        AI Creative Studio
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Create Your Masterpiece
                    </h2>
                    <p className="text-gray-400">
                        Combine text prompts or your own photos with our festive art styles.
                    </p>
                </div>

                <ModeSelector currentMode={appMode} onModeChange={setAppMode} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto mt-8">
                    <div className="lg:col-span-5 space-y-6">
                        <ImageUploadSection
                            hasImage={hasUploadedImage}
                            previewImage={previewImage}
                            isUploading={isUploading}
                            onFileUpload={handleFileUpload}
                            onDrop={handleDrop}
                            onClear={clearUploadedImage}
                            fileInputRef={fileInputRef}
                        />

                        <PromptSection
                            prompt={prompt}
                            onPromptChange={setPrompt}
                            hasImage={hasUploadedImage}
                            onSurpriseMe={handleSurpriseMe}
                        />

                        <StyleSelector
                            selectedStyle={selectedStyle}
                            onStyleSelect={setSelectedStyle}
                        />

                        <GenerateButton
                            isLoading={isLoading}
                            onClick={handleGenerate}
                            isDisabled={isGenerateDisabled}
                            variant="mobile"
                        />
                    </div>

                    <div id="display-area" className="lg:col-span-7 sticky top-24">
                        <div className="w-full h-full flex flex-col">
                            <ImageDisplay
                                imageUrl={generatedImage}
                                isLoading={isLoading}
                                loadingMessage={loadingMsg}
                            />

                            <div className="hidden lg:flex mt-6 gap-4">
                                <AspectRatioSelector
                                    currentRatio={aspectRatio}
                                    onRatioChange={setAspectRatio}
                                />
                                <GenerateButton
                                    isLoading={isLoading}
                                    onClick={handleGenerate}
                                    isDisabled={isGenerateDisabled}
                                    variant="desktop"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});
