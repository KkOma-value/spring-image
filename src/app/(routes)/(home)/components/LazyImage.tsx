"use client";

import { memo, useState, useEffect, useRef } from "react";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
}

export const LazyImage = memo(function LazyImage({ src, alt, className = "" }: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "50px",
                threshold: 0.01,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className="relative w-full h-full">
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-xl" />
            )}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </div>
    );
});
