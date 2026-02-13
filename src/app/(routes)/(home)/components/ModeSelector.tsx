"use client";

import { memo, useMemo } from "react";
import { Icons } from "@/components/ui/Icons";
import { AppMode } from "@/lib/types";
import { getModeButtonClasses } from "../utils";

interface ModeOption {
    mode: AppMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const MODE_OPTIONS: ModeOption[] = [
    { mode: AppMode.PLAYGROUND, label: "Playground", icon: Icons.Palette },
    { mode: AppMode.GREETING_CARD, label: "Greeting Card", icon: Icons.ScrollText },
    { mode: AppMode.WALLPAPER, label: "Wallpaper", icon: Icons.Image },
];

interface ModeSelectorProps {
    currentMode: AppMode;
    onModeChange: (mode: AppMode) => void;
}

export const ModeSelector = memo(function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
    const handleModeChange = useMemo(() => (mode: AppMode) => () => onModeChange(mode), [onModeChange]);

    return (
        <div className="flex justify-center gap-2 sm:gap-4 mb-8">
            {MODE_OPTIONS.map(({ mode, label, icon: Icon }) => (
                <button
                    key={mode}
                    onClick={handleModeChange(mode)}
                    className={getModeButtonClasses(currentMode === mode)}
                >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(" ")[0]}</span>
                </button>
            ))}
        </div>
    );
});
