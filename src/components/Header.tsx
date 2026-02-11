"use client";

import { useState, useEffect } from "react";
import { Icons } from "./ui/Icons";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth/client";

function getDisplayName(session: { user?: { displayUsername?: string | null; username?: string | null; name?: string; email?: string } } | null): string {
    const user = session?.user;
    return user?.displayUsername || user?.username || user?.name || user?.email || "";
}

function getAvatarInitial(displayName: string): string {
    return displayName ? displayName.charAt(0).toUpperCase() : "U";
}

function getHeaderClasses(isScrolled: boolean): string {
    const baseClasses = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
    const scrolledClasses = "py-3 bg-red-950/80 backdrop-blur-lg border-b border-white/10 shadow-xl";
    const transparentClasses = "py-6 bg-transparent";
    return `${baseClasses} ${isScrolled ? scrolledClasses : transparentClasses}`;
}

function getIconContainerClasses(isScrolled: boolean): string {
    const baseClasses = "p-2 rounded-full transition-all";
    const scrolledIcon = "bg-cny-gold/20";
    const transparentIcon = "bg-cny-gold shadow-lg shadow-cny-gold/30";
    return `${baseClasses} ${isScrolled ? scrolledIcon : transparentIcon}`;
}

function getIconColor(isScrolled: boolean): string {
    return isScrolled ? "text-cny-gold" : "text-cny-red";
}

function getSignInButtonClasses(isScrolled: boolean): string {
    const baseClasses = "hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all";
    const scrolled = "bg-cny-gold text-red-900 hover:bg-white";
    const transparent = "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm";
    return `${baseClasses} ${isScrolled ? scrolled : transparent}`;
}

function getMenuDropdownClasses(isMenuOpen: boolean): string {
    const baseClasses = "absolute right-0 top-full w-44 rounded-2xl border border-white/10 bg-red-950/90 p-2 text-sm text-white shadow-2xl backdrop-blur-xl transition-all";
    const openClasses = "opacity-100 translate-y-0";
    const closedClasses = "pointer-events-none opacity-0 -translate-y-1";
    return `${baseClasses} ${isMenuOpen ? openClasses : closedClasses}`;
}

function getChevronClasses(isMenuOpen: boolean): string {
    const baseClasses = "h-4 w-4 text-white/80 transition-transform";
    return isMenuOpen ? `${baseClasses} rotate-180` : baseClasses;
}

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();

    const displayName = getDisplayName(session);
    const avatarUrl = session?.user?.image ?? "";
    const avatarInitial = getAvatarInitial(displayName);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
        setIsSigningOut(false);
    };

    return (
        <header className={getHeaderClasses(isScrolled)}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={getIconContainerClasses(isScrolled)}>
                        <Icons.Lantern className={`${getIconColor(isScrolled)} w-6 h-6 transition-colors`} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
                            Spring Festival AI
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cny-gold text-red-900 font-sans font-bold uppercase tracking-wider hidden sm:inline-block">
                                Beta
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {displayName ? (
                        <div
                            className="relative hidden md:block pt-2"
                            onMouseEnter={() => setIsMenuOpen(true)}
                            onMouseLeave={() => setIsMenuOpen(false)}
                        >
                            <button
                                type="button"
                                aria-expanded={isMenuOpen}
                                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition hover:border-white/30"
                            >
                                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-semibold text-cny-gold">
                                            {avatarInitial}
                                        </span>
                                    )}
                                </span>
                                <span className="max-w-[120px] truncate font-semibold text-cny-gold">
                                    {displayName}
                                </span>
                                <Icons.ChevronDown className={getChevronClasses(isMenuOpen)} />
                            </button>
                            <div className={getMenuDropdownClasses(isMenuOpen)}>
                                <Link
                                    href="/billing"
                                    className="block rounded-xl px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
                                >
                                    Billing
                                </Link>
                                <button
                                    type="button"
                                    disabled={isSigningOut}
                                    onClick={handleSignOut}
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/signin"
                            className={getSignInButtonClasses(isScrolled)}
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
