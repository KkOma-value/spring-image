"use client";

import { useState, useEffect } from 'react';
import { Icons } from './ui/Icons';
import Link from 'next/link';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'py-3 bg-red-950/80 backdrop-blur-lg border-b border-white/10 shadow-xl'
                    : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-cny-gold/20' : 'bg-cny-gold shadow-lg shadow-cny-gold/30'}`}>
                        <Icons.Lantern className={`${isScrolled ? 'text-cny-gold' : 'text-cny-red'} w-6 h-6 transition-colors`} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
                            Spring Festival AI
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cny-gold text-red-900 font-sans font-bold uppercase tracking-wider hidden sm:inline-block">Beta</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="#studio"
                        className={`hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${isScrolled
                                ? 'bg-cny-gold text-red-900 hover:bg-white'
                                : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                            }`}
                    >
                        Create Now
                        <Icons.ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </header>
    );
};
