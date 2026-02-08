"use client";

import {
    Sparkles,
    Image as ImageIcon,
    Download,
    RefreshCw,
    Settings,
    Palette,
    Share2,
    ScrollText,
    Camera,
    Wand2,
    UploadCloud,
    X,
    Plus,
    ChevronDown,
    ArrowRight,
    Star
} from 'lucide-react';

// Custom Lantern Icon since it's not in Lucide
const LanternIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="12" x2="12" y1="2" y2="5" />
        <path d="M5.5 5h13a1 1 0 0 1 0.8 1.4l-2 3.6a1 1 0 0 0 0 .9l2 3.7a1 1 0 0 1 -.8 1.4h-13a1 1 0 0 1 -.8 -1.4l2 -3.7a1 1 0 0 0 0 -.9l-2 -3.6a1 1 0 0 1 .8 -1.4" />
        <path d="M12 22v-6" />
        <path d="M9 22h6" />
    </svg>
);

export const Icons = {
    Sparkles,
    Image: ImageIcon,
    Download,
    RefreshCw,
    Settings,
    Palette,
    Share2,
    Lantern: LanternIcon,
    ScrollText,
    Camera,
    Wand2,
    UploadCloud,
    X,
    Plus,
    ChevronDown,
    ArrowRight,
    Star
};
