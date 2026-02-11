export interface StyleOption {
    id: string;
    name: string;
    description: string;
    promptModifier: string;
    thumbnail: string;
}

export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    style: string;
    createdAt: number;
}

export interface GenerationConfig {
    prompt: string;
    styleId: string;
    aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
    imageBase64?: string;
}

export enum AppMode {
    PLAYGROUND = "playground",
    GREETING_CARD = "greeting_card",
    WALLPAPER = "wallpaper",
}
