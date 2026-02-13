"use client";

import { memo, useCallback } from "react";
import { Icons } from "@/components/ui/Icons";
import { getUploadPanelClasses } from "../utils";

interface ImageUploadSectionProps {
    hasImage: boolean;
    previewImage: string | null;
    isUploading: boolean;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent) => void;
    onClear: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ImageUploadSection = memo(function ImageUploadSection({
    hasImage,
    previewImage,
    isUploading,
    onFileUpload,
    onDrop,
    onClear,
    fileInputRef,
}: ImageUploadSectionProps) {
    const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
    const handleClick = useCallback(() => fileInputRef.current?.click(), [fileInputRef]);

    return (
        <div
            className={getUploadPanelClasses(hasImage)}
            onDragOver={handleDragOver}
            onDrop={onDrop}
        >
            <div className="flex justify-between items-center mb-4">
                <label className="text-cny-gold font-serif text-lg flex items-center gap-2">
                    <Icons.Camera className="w-5 h-5" />
                    Reference Image
                </label>
                {hasImage && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <Icons.X className="w-3 h-3" />
                        Remove
                    </button>
                )}
            </div>

            {!hasImage ? (
                <div
                    onClick={handleClick}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
                >
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Icons.UploadCloud className="w-6 h-6 text-cny-gold" />
                    </div>
                    <p className="text-sm font-medium text-white">
                        {isUploading ? "Uploading..." : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF up to 20MB.</p>
                </div>
            ) : (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/20 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewImage ?? ""}
                        alt="Reference"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={handleClick}
                            className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm hover:bg-white/30"
                        >
                            Change Image
                        </button>
                    </div>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={onFileUpload}
            />
        </div>
    );
});
