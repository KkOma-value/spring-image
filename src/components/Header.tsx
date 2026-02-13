"use client";

import { useState, useEffect, useCallback, memo } from "react";
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

// Memoized user menu component
const UserMenu = memo(function UserMenu({
    displayName,
    avatarUrl,
    avatarInitial,
    isSigningOut,
    onSignOut
}: {
    displayName: string;
    avatarUrl: string;
    avatarInitial: string;
    isSigningOut: boolean;
    onSignOut: () => void;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMouseEnter = useCallback(() => setIsMenuOpen(true), []);
    const handleMouseLeave = useCallback(() => setIsMenuOpen(false), []);

    const menuClasses = isMenuOpen
        ? "absolute right-0 top-full w-44 rounded-2xl border border-white/10 bg-red-950/90 p-2 text-sm text-white shadow-2xl backdrop-blur-xl transition-all opacity-100 translate-y-0"
        : "absolute right-0 top-full w-44 rounded-2xl border border-white/10 bg-red-950/90 p-2 text-sm text-white shadow-2xl backdrop-blur-xl transition-all pointer-events-none opacity-0 -translate-y-1";

    const chevronClasses = isMenuOpen
        ? "h-4 w-4 text-white/80 transition-transform rotate-180"
        : "h-4 w-4 text-white/80 transition-transform";

    return (
        <div
            className="relative hidden md:block pt-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                aria-expanded={isMenuOpen}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition hover:border-white/30"
            >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                            loading="lazy"
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
                <Icons.ChevronDown className={chevronClasses} />
            </button>
            <div className={menuClasses}>
                <Link
                    href="/billing"
                    className="block rounded-xl px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                    Billing
                </Link>
                <button
                    type="button"
                    disabled={isSigningOut}
                    onClick={onSignOut}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
});

export const Header = memo(function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { data: session } = useSession();

    const displayName = getDisplayName(session);
    const avatarUrl = session?.user?.image ?? "";
    const avatarInitial = getAvatarInitial(displayName);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = useCallback(async () => {
        setIsSigningOut(true);
        await signOut();
        setIsSigningOut(false);
    }, []);

    const headerClasses = isScrolled
        ? "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 bg-red-950/80 backdrop-blur-lg border-b border-white/10 shadow-xl"
        : "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 bg-transparent";

    const iconContainerClasses = isScrolled
        ? "p-2 rounded-full transition-all bg-cny-gold/20"
        : "p-2 rounded-full transition-all bg-cny-gold shadow-lg shadow-cny-gold/30";

    const iconColor = isScrolled ? "text-cny-gold" : "text-cny-red";

    const signInButtonClasses = isScrolled
        ? "hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all bg-cny-gold text-red-900 hover:bg-white"
        : "hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm";

    return (
        <header className={headerClasses}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={iconContainerClasses}>
                        <Icons.Lantern className={`${iconColor} w-6 h-6 transition-colors`} />
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
                        <UserMenu
                            displayName={displayName}
                            avatarUrl={avatarUrl}
                            avatarInitial={avatarInitial}
                            isSigningOut={isSigningOut}
                            onSignOut={handleSignOut}
                        />
                    ) : (
                        <Link
                            href="/signin"
                            className={signInButtonClasses}
                        >
                            Sign In
                            <Icons.ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
});
