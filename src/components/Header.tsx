"use client";

import { useState, useEffect } from 'react';
import { Icons } from './ui/Icons';
import Link from 'next/link';
import { signOut, useSession } from '@/lib/auth/client';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { data: session } = useSession();

    const displayName =
        session?.user?.displayUsername ||
        session?.user?.username ||
        session?.user?.name ||
        session?.user?.email ||
        '';

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
                    {displayName ? (
                        <details className="group relative hidden md:block">
                            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:border-white/30">
                                <span className="max-w-[140px] truncate font-semibold text-cny-gold">
                                    {displayName}
                                </span>
                                <Icons.ChevronDown className="h-4 w-4 text-white/80 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-red-950/90 p-2 text-sm text-white shadow-2xl backdrop-blur-xl">
                                <button
                                    type="button"
                                    disabled={isSigningOut}
                                    onClick={async () => {
                                        setIsSigningOut(true);
                                        await signOut();
                                        setIsSigningOut(false);
                                    }}
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </details>
                    ) : (
                        <Link
                            href="/signin"
                            className={`hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${isScrolled
                                    ? 'bg-cny-gold text-red-900 hover:bg-white'
                                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                                }`}
                        >
                            Sign In
                            <Icons.ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
