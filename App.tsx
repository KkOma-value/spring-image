import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { StyleCard } from './components/StyleCard';
import { ImageDisplay } from './components/ImageDisplay';
import { Icons } from './components/Icon';
import { generateCNYImage } from './services/geminiService';
import { STYLES, SUGGESTED_PROMPTS } from './constants';
import { GenerationConfig, AppMode } from './types';

const App: React.FC = () => {
  // --- STATE ---
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id);
  const [aspectRatio, setAspectRatio] = useState<GenerationConfig['aspectRatio']>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.PLAYGROUND);
  const [loadingMsg, setLoadingMsg] = useState('Initializing...');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (isLoading) {
        const msgs = [
            "Consulting the Zodiac...",
            "Mixing digital ink...",
            "Lighting the lanterns...",
            "Awakening the dragons...",
            "Painting with pixels..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            setLoadingMsg(msgs[i % msgs.length]);
            i++;
        }, 2000);
        return () => clearInterval(interval);
    }
  }, [isLoading]);

  // --- HANDLERS ---
  const scrollToStudio = () => {
    const element = document.getElementById('studio');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) {
        alert("Please enter a prompt or upload an image.");
        return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    
    // Auto-scroll to image display on mobile if lower down
    if (window.innerWidth < 1024) {
        document.getElementById('display-area')?.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const result = await generateCNYImage({
        prompt: prompt || "A festive Chinese New Year scene",
        styleId: selectedStyle,
        aspectRatio: aspectRatio,
        imageBase64: uploadedImage || undefined
      });
      setGeneratedImage(result);
    } catch (error) {
      console.error(error);
      alert('Failed to generate image. Please check your API Key or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = SUGGESTED_PROMPTS[Math.floor(Math.random() * SUGGESTED_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  // --- RENDER SECTIONS ---

  const renderModeSelector = () => (
    <div className="flex justify-center gap-2 sm:gap-4 mb-8">
      {[
        { mode: AppMode.PLAYGROUND, label: 'Playground', icon: Icons.Palette },
        { mode: AppMode.GREETING_CARD, label: 'Greeting Card', icon: Icons.ScrollText },
        { mode: AppMode.WALLPAPER, label: 'Wallpaper', icon: Icons.Image },
      ].map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          onClick={() => setAppMode(mode)}
          className={`px-4 py-2 sm:px-6 sm:py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
            appMode === mode
              ? 'bg-cny-gold text-red-900 border-cny-gold shadow-lg shadow-cny-gold/20 scale-105'
              : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );

  // 1. Hero Section
  const renderHero = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements specific to Hero */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 opacity-30 animate-float" style={{animationDuration: '8s'}}>
                 <Icons.Lantern className="w-32 h-32 text-cny-red" />
            </div>
            <div className="absolute bottom-20 right-10 opacity-30 animate-float" style={{animationDelay: '1s', animationDuration: '10s'}}>
                 <Icons.Lantern className="w-40 h-40 text-cny-gold" />
            </div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full border border-cny-gold/30 bg-cny-red/20 text-cny-gold text-sm font-medium mb-6 animate-pulse-slow backdrop-blur-sm">
                🎉 Year of the Snake 2025
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                Design Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cny-gold via-yellow-200 to-cny-gold">Lunar Legacy</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                Experience the magic of AI-powered art. Transform your photos or ideas into stunning traditional Chinese masterpieces, greeting cards, and wallpapers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                    onClick={scrollToStudio}
                    className="px-8 py-4 bg-gradient-to-r from-cny-gold to-yellow-600 rounded-full font-bold text-red-950 text-lg shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:scale-105 transition-all flex items-center gap-2 group"
                >
                    Start Creating
                    <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#showcase" className="px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 text-white font-medium transition-all backdrop-blur-sm">
                    View Examples
                </a>
            </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
            <Icons.ChevronDown className="w-8 h-8" />
        </div>
    </section>
  );

  // 2. Showcase Section
  const renderShowcase = () => (
    <section id="showcase" className="py-24 relative bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif text-cny-gold mb-4">Timeless Styles, Modern Magic</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                    Choose from a curated collection of art styles designed to capture the spirit of the Spring Festival.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {STYLES.slice(0, 3).map((style, index) => (
                    <div key={style.id} className="glass-panel rounded-2xl p-2 group hover:border-cny-gold/50 transition-all">
                        <div className="overflow-hidden rounded-xl aspect-[4/3] mb-4 relative">
                            {/* In a real app, these would be actual generated examples. Using placeholders. */}
                            <img 
                                src={style.thumbnail} 
                                alt={style.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <span className="text-cny-gold font-serif text-lg">Try this style &rarr;</span>
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

  // 3. Studio Section (The Main App)
  const renderStudio = () => (
    <section id="studio" className="py-24 min-h-screen relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-cny-gold mb-4">
                    <Icons.Sparkles className="w-4 h-4" />
                    AI Creative Studio
                 </div>
                 <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Create Your Masterpiece</h2>
                 <p className="text-gray-400">Combine text prompts or your own photos with our festive art styles.</p>
            </div>

            {renderModeSelector()}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto mt-8">
                {/* Left Panel: Controls */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Image Upload Section */}
                    <div 
                        className={`glass-panel p-6 rounded-2xl transition-all ${uploadedImage ? 'border-cny-gold/50 bg-cny-gold/5' : 'border-dashed'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="flex justify-between items-center mb-4">
                             <label className="text-cny-gold font-serif text-lg flex items-center gap-2">
                                <Icons.Camera className="w-5 h-5" />
                                Reference Image
                            </label>
                            {uploadedImage && (
                                <button 
                                    onClick={() => setUploadedImage(null)}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                    <Icons.X className="w-3 h-3" />
                                    Remove
                                </button>
                            )}
                        </div>

                        {!uploadedImage ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Icons.UploadCloud className="w-6 h-6 text-cny-gold" />
                                </div>
                                <p className="text-sm font-medium text-white">Click to upload or drag & drop</p>
                                <p className="text-xs text-gray-400 mt-1">Transform your selfies or pets!</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/20 group">
                                <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm hover:bg-white/30"
                                    >
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {/* Prompt Section */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-cny-gold font-serif text-lg flex items-center gap-2">
                                <Icons.Wand2 className="w-5 h-5" />
                                {uploadedImage ? "Add Instructions (Optional)" : "Describe Your Vision"}
                            </label>
                            <button 
                                onClick={handleSurpriseMe}
                                className="text-xs text-gray-400 hover:text-white underline decoration-dashed underline-offset-4 flex items-center gap-1"
                            >
                                <Icons.Sparkles className="w-3 h-3" />
                                Surprise Me
                            </button>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={uploadedImage ? "e.g., Make it look like a traditional paper cutting, add red lanterns in background" : "Describe your festive image... e.g., 'A golden snake coiled around a lucky coin stack'"}
                            className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cny-gold/50 focus:ring-1 focus:ring-cny-gold/50 resize-none transition-all"
                        />
                    </div>

                    {/* Style Selector */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <label className="text-cny-gold font-serif text-lg mb-4 block flex items-center gap-2">
                            <Icons.Palette className="w-5 h-5" />
                            Art Style
                        </label>
                        <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto scroll-hide pr-1">
                            {STYLES.map(style => (
                                <StyleCard 
                                    key={style.id}
                                    styleOption={style}
                                    isSelected={selectedStyle === style.id}
                                    onSelect={setSelectedStyle}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mobile Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || (!prompt && !uploadedImage)}
                        className="w-full lg:hidden py-4 bg-gradient-to-r from-cny-red to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Icons.RefreshCw className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Icons.Sparkles className="w-5 h-5" />
                                Generate
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel: Display */}
                <div id="display-area" className="lg:col-span-7 sticky top-24">
                    <div className="w-full h-full flex flex-col">
                         <ImageDisplay 
                            imageUrl={generatedImage} 
                            isLoading={isLoading} 
                            loadingMessage={loadingMsg}
                         />
                         
                         {/* Desktop Controls */}
                         <div className="hidden lg:flex mt-6 gap-4">
                             <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
                                {(['1:1', '3:4', '16:9'] as const).map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                            aspectRatio === ratio
                                            ? 'bg-white/10 text-cny-gold shadow-sm'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                             </div>
                             <button
                                onClick={handleGenerate}
                                disabled={isLoading || (!prompt && !uploadedImage)}
                                className="flex-1 py-4 bg-gradient-to-r from-cny-gold to-yellow-600 rounded-xl font-bold text-xl text-red-950 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Icons.RefreshCw className="w-6 h-6 animate-spin" />
                                        Weaving Dreams...
                                    </>
                                ) : (
                                    <>
                                        <Icons.Sparkles className="w-6 h-6" />
                                        Generate Masterpiece
                                    </>
                                )}
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden relative">
      {/* Global Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-950 via-red-900 to-red-950"></div>
         {/* Subtle pattern overlay via CSS in index.html, reinforced here */}
         <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
         
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-600 rounded-full blur-[150px] opacity-10"></div>
      </div>

      <Header />

      <main>
        {renderHero()}
        {renderShowcase()}
        {renderStudio()}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10 bg-black/20 text-center text-gray-500 text-sm">
        <p>© 2025 Spring Festival AI Studio. Powered by Google Gemini.</p>
      </footer>

    </div>
  );
};

export default App;