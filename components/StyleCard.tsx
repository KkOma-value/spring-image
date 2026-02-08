import React from 'react';
import { StyleOption } from '../types';
import { Icons } from './Icon';

interface StyleCardProps {
  styleOption: StyleOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({ styleOption, isSelected, onSelect }) => {
  return (
    <button 
      onClick={() => onSelect(styleOption.id)}
      className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-300 text-left w-full h-24 sm:h-32 ${
        isSelected 
          ? 'border-cny-gold bg-cny-red/80 shadow-[0_0_15px_rgba(255,215,0,0.5)] scale-[1.02]' 
          : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-black/30'
      }`}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        
        {/* We use a pattern overlay or gradient instead of actual image to avoid broken links if placeholder fails, 
            or use the placeholder if available. For this demo, we rely on CSS patterns/gradients for "vibe". */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 group-hover:opacity-50 transition-opacity">
             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: `url(${styleOption.thumbnail})`}}></div>
        </div>

        <div className="relative z-20 p-3 h-full flex flex-col justify-center">
            {isSelected && <Icons.Sparkles className="w-4 h-4 text-cny-gold mb-1 animate-pulse" />}
            <h3 className={`font-serif font-bold ${isSelected ? 'text-cny-gold' : 'text-gray-200'}`}>
                {styleOption.name}
            </h3>
            <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 max-w-[80%] leading-tight">
                {styleOption.description}
            </p>
        </div>
    </button>
  );
};