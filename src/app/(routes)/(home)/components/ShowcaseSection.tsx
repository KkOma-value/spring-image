"use client";

import { memo, useMemo } from "react";
import { STYLES } from "@/lib/constants";
import { LazyImage } from "./LazyImage";

const SHOWCASE_COUNT = 3;

export const ShowcaseSection = memo(function ShowcaseSection() {
    const showcaseStyles = useMemo(() => STYLES.slice(0, SHOWCASE_COUNT), []);

    return (
        <section id="showcase" className="py-24 relative bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-cny-gold mb-4">
                        Timeless Styles, Modern Magic
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Choose from a curated collection of art styles designed to capture the spirit of the Spring Festival.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {showcaseStyles.map((style) => (
                        <div key={style.id} className="glass-panel rounded-2xl p-2 group hover:border-cny-gold/50 transition-all">
                            <div className="overflow-hidden rounded-xl aspect-[4/3] mb-4 relative">
                                <LazyImage
                                    src={style.thumbnail}
                                    alt={style.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-cny-gold font-serif text-lg">Try this style</span>
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <h3 className="text-xl font-bold text-white mb-2">{style.name}</h3>
                                <p className="text-sm text-gray-400">{style.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});
