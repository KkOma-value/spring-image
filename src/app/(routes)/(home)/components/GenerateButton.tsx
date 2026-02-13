"use client";

import { memo, useMemo } from "react";
import { Icons } from "@/components/ui/Icons";

interface GenerateButtonProps {
    isLoading: boolean;
    onClick: () => void;
    isDisabled: boolean;
    variant?: "mobile" | "desktop";
}

export const GenerateButton = memo(function GenerateButton({
    isLoading,
    onClick,
    isDisabled,
    variant = "mobile",
}: GenerateButtonProps) {
    const className = useMemo(() => {
        const mobileClasses = "w-full lg:hidden py-4 bg-gradient-to-r from-cny-red to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-orange-900/50";
        const desktopClasses = "flex-1 py-4 bg-gradient-to-r from-cny-gold to-yellow-600 rounded-xl font-bold text-xl text-red-950 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] hover:scale-[1.01]";
        const baseClasses = "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all";

        return variant === "mobile"
            ? `${mobileClasses} ${baseClasses}`
            : `${desktopClasses} ${baseClasses}`;
    }, [variant]);

    const iconSize = variant === "mobile" ? "w-5 h-5" : "w-6 h-6";
    const loadingText = variant === "mobile" ? "Creating..." : "Weaving Dreams...";

    const RefreshCwIcon = Icons.RefreshCw;
    const SparklesIcon = Icons.Sparkles;

    return (
        <button onClick={onClick} disabled={isDisabled} className={className}>
            {isLoading ? (
                <>
                    <RefreshCwIcon className={`${iconSize} animate-spin`} />
                    {loadingText}
                </>
            ) : (
                <>
                    <SparklesIcon className={iconSize} />
                    {variant === "mobile" ? "Generate" : "Generate Masterpiece"}
                </>
            )}
        </button>
    );
});
