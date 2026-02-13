"use client";

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { Header } from "@/components/Header";
import { generateCNYImage } from "@/lib/geminiService";
import { STYLES, SUGGESTED_PROMPTS } from "@/lib/constants";
import { GenerationConfig, AppMode } from "@/lib/types";
import {
    ALLOWED_UPLOAD_TYPES,
    MAX_UPLOAD_FILE_SIZE,
    scrollToElement,
    readFileAsDataUrl,
    uploadToBlob,
} from "./utils";

const HeroSection = lazy(() => import("./components/HeroSection").then(m => ({ default: m.HeroSection })));
const ShowcaseSection = lazy(() => import("./components/ShowcaseSection").then(m => ({ default: m.ShowcaseSection })));
const StudioSection = lazy(() => import("./components/StudioSection").then(m => ({ default: m.StudioSection })));

const LOADING_MESSAGES = [
    "Consulting the Zodiac...",
    "Mixing digital ink...",
    "Lighting the lanterns...",
    "Awakening the dragons...",
    "Painting with pixels...",
] as const;

const SectionLoadingFallback = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded-lg mx-auto" />
            <div className="h-4 w-32 bg-white/5 rounded-lg mx-auto" />
        </div>
    </div>
);

export default function SpringFestivalStudio() {
    const [prompt, setPrompt] = useState("");
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
    const [aspectRatio, setAspectRatio] = useState<GenerationConfig["aspectRatio"]>("1:1");
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [appMode, setAppMode] = useState(AppMode.PLAYGROUND);
    const [loadingMsg, setLoadingMsg] = useState("Initializing...");
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewImage = uploadedImageUrl ?? uploadedImageBase64;
    const hasUploadedImage = Boolean(previewImage);
    const canGenerate = Boolean(prompt || uploadedImageBase64);
    const isGenerateDisabled = isLoading || isUploading || !canGenerate;

    useEffect(() => {
        if (!isLoading) return;

        let index = 0;
        const interval = setInterval(() => {
            setLoadingMsg(LOADING_MESSAGES[index % LOADING_MESSAGES.length]);
            index++;
        }, 2000);
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerate = useCallback(async () => {
        if (!canGenerate) {
            alert("Please enter a prompt or upload an image.");
            return;
        }

        setIsLoading(true);
        setGeneratedImage(null);

        if (window.innerWidth < 1024) {
            scrollToElement("display-area");
        }

        try {
            const result = await generateCNYImage({
                prompt: prompt || "A festive Chinese New Year scene",
                styleId: selectedStyle,
                aspectRatio,
                imageBase64: uploadedImageBase64 ?? undefined,
            });
            setGeneratedImage(result);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "";
            if (message === "UNAUTHORIZED") {
                alert("Please sign in to generate images.");
            } else if (message === "INSUFFICIENT_CREDITS") {
                alert("Insufficient credits. Visit Billing to top up.");
            } else {
                alert("Failed to generate image. Please check your API Key or try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [canGenerate, prompt, selectedStyle, aspectRatio, uploadedImageBase64]);

    const handleSurpriseMe = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * SUGGESTED_PROMPTS.length);
        setPrompt(SUGGESTED_PROMPTS[randomIndex]);
    }, []);

    const handleFile = useCallback(async (file: File) => {
        if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
            alert("Please upload a JPG, PNG, WebP, or GIF image.");
            return;
        }

        if (file.size > MAX_UPLOAD_FILE_SIZE) {
            alert("Image is too large. Maximum file size is 20MB.");
            return;
        }

        setIsUploading(true);

        try {
            const [base64, uploadResult] = await Promise.all([
                readFileAsDataUrl(file),
                uploadToBlob(file),
            ]);

            setUploadedImageBase64(base64);
            setUploadedImageUrl(uploadResult.url);
        } catch (error) {
            console.error(error);
            alert("Failed to upload image. Please try again.");
            setUploadedImageBase64(null);
            setUploadedImageUrl(null);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            void handleFile(file);
        }
    }, [handleFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            void handleFile(file);
        }
    }, [handleFile]);

    const clearUploadedImage = useCallback(() => {
        setUploadedImageUrl(null);
        setUploadedImageBase64(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden relative cny-selection">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-950 via-red-900 to-red-950" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}
                />
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-600 rounded-full blur-[150px] opacity-10" />
            </div>

            <Header />

            <main>
                <Suspense fallback={<SectionLoadingFallback />}>
                    <HeroSection />
                </Suspense>

                <Suspense fallback={<SectionLoadingFallback />}>
                    <ShowcaseSection />
                </Suspense>

                <Suspense fallback={<SectionLoadingFallback />}>
                    <StudioSection
                        appMode={appMode}
                        setAppMode={setAppMode}
                        hasUploadedImage={hasUploadedImage}
                        previewImage={previewImage}
                        isUploading={isUploading}
                        handleFileUpload={handleFileUpload}
                        handleDrop={handleDrop}
                        clearUploadedImage={clearUploadedImage}
                        fileInputRef={fileInputRef}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        selectedStyle={selectedStyle}
                        setSelectedStyle={setSelectedStyle}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        isLoading={isLoading}
                        isGenerateDisabled={isGenerateDisabled}
                        handleGenerate={handleGenerate}
                        generatedImage={generatedImage}
                        loadingMsg={loadingMsg}
                        handleSurpriseMe={handleSurpriseMe}
                    />
                </Suspense>
            </main>

            <footer className="relative z-10 py-8 border-t border-white/10 bg-black/20 text-center text-gray-500 text-sm">
                <p>2025 Spring Festival AI Studio. Powered by Google Gemini.</p>
            </footer>
        </div>
    );
}
