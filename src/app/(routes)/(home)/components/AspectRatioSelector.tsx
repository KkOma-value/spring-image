"use client";

import { memo, useCallback, useMemo } from "react";
import { GenerationConfig } from "@/lib/types";
import { getAspectRatioButtonClasses } from "../utils";

const ASPECT_RATIOS = ["1:1", "3:4", "16:9"] as const;
type AspectRatio = GenerationConfig["aspectRatio"];

interface AspectRatioSelectorProps {
    currentRatio: AspectRatio;
    onRatioChange: (ratio: AspectRatio) => void;
}

export const AspectRatioSelector = memo(function AspectRatioSelector({
    currentRatio,
    onRatioChange,
}: AspectRatioSelectorProps) {
    const handleRatioChange = useCallback((ratio: AspectRatio) => () => {
        onRatioChange(ratio);
    }, [onRatioChange]);

    const buttons = useMemo(() =>
        ASPECT_RATIOS.map((ratio) => (
            <button
                key={ratio}
                onClick={handleRatioChange(ratio as AspectRatio)}
                className={getAspectRatioButtonClasses(currentRatio === ratio)}
            >
                {ratio}
            </button>
        )),
        [currentRatio, handleRatioChange]
    );

    return (
        <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
            {buttons}
        </div>
    );
});
