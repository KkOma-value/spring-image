export const MAX_UPLOAD_FILE_SIZE = 20 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: "smooth" });
}

export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

export async function uploadToBlob(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || "Upload failed.");
    }

    return (await response.json()) as { url: string };
}

export function getModeButtonClasses(isActive: boolean): string {
    const base = "px-4 py-2 sm:px-6 sm:py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border";
    return isActive
        ? `${base} bg-cny-gold text-red-900 border-cny-gold shadow-lg shadow-cny-gold/20 scale-105`
        : `${base} bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30`;
}

export function getAspectRatioButtonClasses(isActive: boolean): string {
    const base = "px-4 py-3 rounded-lg text-sm font-medium transition-all";
    return isActive
        ? `${base} bg-white/10 text-cny-gold shadow-sm`
        : `${base} text-gray-400 hover:text-white`;
}

export function getUploadPanelClasses(hasImage: boolean): string {
    const base = "glass-panel p-6 rounded-2xl transition-all";
    return hasImage
        ? `${base} border-cny-gold/50 bg-cny-gold/5`
        : `${base} border-dashed`;
}
