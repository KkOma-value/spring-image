"use client";

import { memo, useMemo } from "react";
import { Icons } from "@/components/ui/Icons";
import { StyleCard } from "@/components/StyleCard";
import { STYLES } from "@/lib/constants";

interface StyleSelectorProps {
    selectedStyle: string;
    onStyleSelect: (styleId: string) => void;
}

export const StyleSelector = memo(function StyleSelector({
    selectedStyle,
    onStyleSelect,
}: StyleSelectorProps) {
    const styleCards = useMemo(() =>
        STYLES.map((style) => (
            <StyleCard
                key={style.id}
                styleOption={style}
                isSelected={selectedStyle === style.id}
                onSelect={onStyleSelect}
            />
        )),
        [selectedStyle, onStyleSelect]
    );

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <label className="text-cny-gold font-serif text-lg mb-4 block flex items-center gap-2">
                <Icons.Palette className="w-5 h-5" />
                Art Style
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto scroll-hide pr-1">
                {styleCards}
            </div>
        </div>
    );
});
