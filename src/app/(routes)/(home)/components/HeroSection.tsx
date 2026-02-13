"use client";

import { memo } from "react";
import { Icons } from "@/components/ui/Icons";
import { scrollToElement } from "../utils";

export const HeroSection = memo(function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 opacity-30 animate-float" style={{ animationDuration: "8s" }}>
                    <Icons.Lantern className="w-32 h-32 text-cny-red" />
                </div>
                <div className="absolute bottom-20 right-10 opacity-30 animate-float" style={{ animationDelay: "1s", animationDuration: "10s" }}>
                    <Icons.Lantern className="w-40 h-40 text-cny-gold" />
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="inline-block px-4 py-1.5 rounded-full border border-cny-gold/30 bg-cny-red/20 text-cny-gold text-sm font-medium mb-6 animate-pulse-slow backdrop-blur-sm">
                    Year of the Snake 2025
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                    Design Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cny-gold via-yellow-200 to-cny-gold">
                        Lunar Legacy
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                    Experience the magic of AI-powered art. Transform your photos or ideas into stunning
                    traditional Chinese masterpieces, greeting cards, and wallpapers.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => scrollToElement("studio")}
                        className="px-8 py-4 bg-gradient-to-r from-cny-gold to-yellow-600 rounded-full font-bold text-red-950 text-lg shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:scale-105 transition-all flex items-center gap-2 group"
                    >
                        Start Creating
                        <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                        href="#showcase"
                        className="px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 text-white font-medium transition-all backdrop-blur-sm"
                    >
                        View Examples
                    </a>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                <Icons.ChevronDown className="w-8 h-8" />
            </div>
        </section>
    );
});
