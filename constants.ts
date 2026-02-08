import { StyleOption } from './types';

export const APP_NAME = "Spring Festival AI Studio";

export const STYLES: StyleOption[] = [
  {
    id: 'traditional_papercut',
    name: 'Paper Cut (剪纸)',
    description: 'Traditional Chinese red paper cutting art style.',
    promptModifier: 'in the style of traditional Chinese red paper cutting art, intricate patterns, festive atmosphere, flat design, vector illustration, high contrast red and white',
    thumbnail: 'https://picsum.photos/id/10/100/100' // Placeholder
  },
  {
    id: 'ink_wash',
    name: 'Ink Wash (水墨)',
    description: 'Classic Chinese ink and wash painting.',
    promptModifier: 'traditional Chinese ink wash painting style, watercolor texture, artistic strokes, minimal colors with red accents, elegant, atmospheric, masterpiece',
    thumbnail: 'https://picsum.photos/id/11/100/100'
  },
  {
    id: '3d_cute',
    name: '3D Cute (3D萌趣)',
    description: 'Pixar-style cute 3D rendering.',
    promptModifier: '3D render, cute style, Pixar animation style, soft lighting, vibrant colors, festive Chinese New Year theme, octane render, high detail, volumetric lighting',
    thumbnail: 'https://picsum.photos/id/12/100/100'
  },
  {
    id: 'cyberpunk_oriental',
    name: 'Cyberpunk (赛博国潮)',
    description: 'Futuristic neon aesthetics with traditional elements.',
    promptModifier: 'Cyberpunk style, neon lights, Chinese traditional elements mixed with futuristic technology, glowing red and gold, cinematic lighting, night city background, detailed',
    thumbnail: 'https://picsum.photos/id/13/100/100'
  },
  {
    id: 'realistic_festive',
    name: 'Realistic (写实)',
    description: 'High quality realistic photography.',
    promptModifier: 'highly realistic photography, cinematic shot, depth of field, 8k resolution, festive Chinese New Year atmosphere, warm lighting, sharp focus',
    thumbnail: 'https://picsum.photos/id/14/100/100'
  }
];

export const SUGGESTED_PROMPTS = [
  "A cute snake mascot holding a gold ingot",
  "A warm family dinner on New Year's Eve with dumplings",
  "Magnificent fireworks over the Great Wall",
  "A dragon dancing in a bustling ancient street",
  "Red lanterns glowing in the snow",
  "Detailed close-up of a red envelope with gold calligraphy"
];

// Placeholder images for UI before generation
export const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1548504769-900b70ed122e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517079270278-e565985868c2?auto=format&fit=crop&q=80&w=800", 
  "https://images.unsplash.com/photo-1613220557457-3f338d7a18f5?auto=format&fit=crop&q=80&w=800"
];