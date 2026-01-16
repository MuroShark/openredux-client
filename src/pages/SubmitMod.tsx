import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from '@tanstack/react-router';
import { useTheme } from '../context/ThemeContext';
import { useStickyHeader } from '../hooks/useStickyHeader';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function SubmitMod() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark, setIsDark } = useTheme();
  const { user } = useAuthStore();
  const heroRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  // Form State
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Graphics',
    youtube: '',
    description: '',
    features: '',
    minGpu: '', minRam: '', minCpu: '',
    recGpu: '', recRam: '', recCpu: '',
    version: '',
    downloadUrl: '',
    fileSize: '',
    tags: ''
  });

  const showStickyBar = useStickyHeader(heroRef, mainRef);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'screenshot') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'cover') {
        setCoverImage(url);
      } else {
        setScreenshots([...screenshots, url]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to submit a mod.");
      return;
    }

    if (!formData.title || !formData.version || !formData.downloadUrl) {
      alert("Please fill in all required fields (Title, Version, Download URL).");
      return;
    }

    setIsSubmitting(true);

    // Generate a simple slug for ID
    const modId = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);

    const payload = {
      id: modId,
      title: { en: formData.title },
      author: user.username,
      ownerId: user.id,
      version: formData.version,
      category: { en: formData.category },
      description: { en: formData.description },
      features: { en: formData.features.split('\n').filter(line => line.trim() !== '') },
      tags: { en: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '') },
      mainImage: coverImage || "", // Note: In a real app, this should be an uploaded URL
      screenshots: screenshots,
      videoThumbnail: formData.youtube ? formData.youtube : undefined,
      downloadUrl: formData.downloadUrl,
      size: parseInt(formData.fileSize) || 0,
      requirements: {
        minimum: { gpu: formData.minGpu, ram: formData.minRam, cpu: formData.minCpu },
        recommended: { gpu: formData.recGpu, ram: formData.recRam, cpu: formData.recCpu }
      },
      moderationStatus: "pending"
    };

    console.log("Submitting mod...", payload);
    try {
      const res = await fetch(`${API_URL}/api/mods/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit mod");

      setIsSubmitting(false);
      alert(t('submitMod.alertSubmitted'));
      navigate({ to: '/' });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Error submitting mod. Please try again.");
    }
  };

  return (
    <div className="bg-app-light dark:bg-app-bg text-gray-800 dark:text-gray-200 font-sans h-screen flex flex-col relative selection:bg-app-accent selection:text-black overflow-hidden">
      
      {/* STICKY TOP NAV */}
      <nav className="h-16 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#121212] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: '/' })} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
            <i className="ph-bold ph-arrow-left text-xl"></i>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-black dark:hover:text-white cursor-pointer">{t('sidebar.library')}</Link>
            <i className="ph ph-caret-right"></i>
            <span className="text-gray-900 dark:text-white font-medium">{t('submitMod.title')}</span>
          </div>
        </div>
        
        <button onClick={() => setIsDark(!isDark)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-300 transition-colors">
          <i className={`ph ${isDark ? 'ph-moon' : 'ph-sun'} text-xl`}></i>
        </button>
      </nav>

      {/* STICKY ACTION BAR */}
      <div className={`absolute top-16 left-0 w-full bg-white dark:bg-app-surface border-b border-gray-200 dark:border-app-accent/20 z-30 transform transition-transform duration-300 shadow-md dark:shadow-neon flex items-center justify-between px-6 py-3 ${showStickyBar ? 'translate-y-0' : '-translate-y-[150%]'}`}>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded bg-gray-200 dark:bg-white/10 flex items-center justify-center">
             <i className="ph-bold ph-upload-simple text-gray-500"></i>
           </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('submitMod.newSubmission')}</h3>
            <span className="text-xs text-gray-500 dark:text-app-accent">{t('submitMod.draft')}</span>
          </div>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-app-accent hover:bg-app-accentHover text-black px-6 py-2 rounded font-bold text-sm shadow-neon transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? <i className="ph-bold ph-spinner animate-spin"></i> : <i className="ph-bold ph-paper-plane-right"></i>}
          {t('submitMod.submitAction')}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto animate-fade-in" ref={mainRef}>
        
        {/* 1. HERO UPLOAD SECTION */}
        <section ref={heroRef} className="relative h-[600px] w-full overflow-hidden group bg-gray-100 dark:bg-[#0a0a0a]">
          {/* Cover Image Dropzone */}
          <label className="absolute inset-0 w-full h-full cursor-pointer group/upload">
            {coverImage ? (
              <img src={coverImage} className="w-full h-full object-cover opacity-50 group-hover/upload:opacity-30 transition-opacity" alt="Cover Preview" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover/upload:text-app-accent transition-colors">
                <i className="ph-duotone ph-image text-6xl mb-4"></i>
                <span className="text-lg font-medium">{t('submitMod.uploadCover')}</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-app-light via-transparent to-transparent dark:from-[#121212] pointer-events-none"></div>
          </label>

          {/* Hero Inputs */}
          <div className="absolute bottom-0 left-0 w-full px-8 pb-12 pt-24 pointer-events-none">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="flex-1 pointer-events-auto w-full">
                <div className="flex items-center gap-3 mb-4">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="bg-app-accent text-black text-xs font-bold px-3 py-1 rounded uppercase tracking-wider outline-none cursor-pointer border-none focus:ring-2 focus:ring-white"
                  >
                    <option>{t('library.filters.graphics')}</option>
                    <option>{t('library.filters.vehicles')}</option>
                    <option>{t('library.filters.fps')}</option>
                    <option>{t('library.filters.scripts')}</option>
                  </select>
                  <span className="bg-gray-500/20 backdrop-blur text-gray-400 border border-gray-500/30 text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
                    <i className="ph-fill ph-clock"></i> {t('submitMod.draft')}
                  </span>
                </div>
                
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('submitMod.enterTitle')} 
                  className="w-full bg-transparent text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight drop-shadow-lg placeholder-gray-400/50 border-b-2 border-transparent focus:border-app-accent outline-none transition-colors"
                />
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold overflow-hidden">
                      {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" /> : (user?.username?.[0] || "U")}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{user ? user.username : t('submitMod.byYou')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-center pointer-events-auto">
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-app-accent hover:bg-app-accentHover text-black px-10 py-4 rounded-xl font-bold text-lg shadow-neon transform hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? <i className="ph-bold ph-spinner animate-spin"></i> : <i className="ph-bold ph-paper-plane-right"></i>}
                  {t('submitMod.submit')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CONTENT FORM */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Video Input */}
              <div className="bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-dashed border-gray-300 dark:border-white/20 aspect-video relative group flex items-center justify-center">
                <div className="text-center w-full px-10">
                  <i className="ph-fill ph-youtube-logo text-4xl text-gray-400 mb-2"></i>
                  <input 
                    type="text" 
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleInputChange}
                    placeholder={t('submitMod.youtubePlaceholder')} 
                    className="w-full bg-transparent text-center text-gray-900 dark:text-white border-b border-gray-500 focus:border-app-accent outline-none py-2 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Gallery Upload */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <i className="ph ph-images text-gray-900 dark:text-app-accent"></i> {t('submitMod.screenshots')}
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                  {/* Upload Button */}
                  <label className="snap-start flex-shrink-0 w-[300px] h-[200px] rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/20 cursor-pointer hover:border-app-accent hover:bg-app-accent/5 transition-all group flex flex-col items-center justify-center gap-2">
                    <i className="ph-bold ph-plus text-3xl text-gray-400 group-hover:text-app-accent"></i>
                    <span className="text-sm text-gray-500 group-hover:text-app-accent">{t('submitMod.addScreenshot')}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'screenshot')} />
                  </label>

                  {/* Previews */}
                  {screenshots.map((src, idx) => (
                    <div key={idx} className="snap-start flex-shrink-0 w-[300px] h-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-white/5 relative group">
                      <img src={src} className="w-full h-full object-cover" alt={`Screenshot ${idx + 1}`} />
                      <button 
                        onClick={() => setScreenshots(s => s.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <i className="ph-bold ph-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Description Editor */}
              <section className="markdown-content">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('submitMod.description')}</h2>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full h-64 bg-transparent border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-800 dark:text-gray-200 focus:border-app-accent focus:ring-1 focus:ring-app-accent outline-none resize-y"
                  placeholder={t('submitMod.descriptionPlaceholder')}
                ></textarea>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{t('submitMod.features')}</h3>
                <textarea 
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  className="w-full h-32 bg-transparent border border-gray-300 dark:border-white/10 rounded-xl p-4 text-gray-800 dark:text-gray-200 focus:border-app-accent focus:ring-1 focus:ring-app-accent outline-none"
                  placeholder={t('submitMod.featuresPlaceholder')}
                ></textarea>
              </section>

              <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-8"></div>

              {/* Requirements Inputs */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('submitMod.requirements')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Minimum */}
                  <div className="bg-white dark:bg-app-surface p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-card">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-4">{t('submitMod.min')}</h4>
                    <div className="space-y-4">
                      <input type="text" name="minGpu" value={formData.minGpu} onChange={handleInputChange} placeholder={t('submitMod.gpuPlaceholder')} className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm focus:border-app-accent outline-none dark:text-white" />
                      <input type="text" name="minRam" value={formData.minRam} onChange={handleInputChange} placeholder={t('submitMod.ramPlaceholder')} className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm focus:border-app-accent outline-none dark:text-white" />
                      <input type="text" name="minCpu" value={formData.minCpu} onChange={handleInputChange} placeholder={t('submitMod.cpuPlaceholder')} className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm focus:border-app-accent outline-none dark:text-white" />
                    </div>
                  </div>
                  {/* Recommended */}
                  <div className="bg-white dark:bg-app-surface p-6 rounded-xl border border-gray-200 dark:border-app-accent/20 relative overflow-hidden shadow-card">
                    <h4 className="text-gray-900 dark:text-app-accent text-sm font-bold uppercase mb-4">{t('submitMod.rec')}</h4>
                    <div className="space-y-4">
                      <input type="text" name="recGpu" value={formData.recGpu} onChange={handleInputChange} placeholder={t('submitMod.gpuPlaceholder')} className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm focus:border-app-accent outline-none dark:text-white" />
                      <input type="text" name="recRam" value={formData.recRam} onChange={handleInputChange} placeholder={t('submitMod.ramPlaceholder')} className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm focus:border-app-accent outline-none dark:text-white" />
                      <input type="text" name="recCpu" value={formData.recCpu} onChange={handleInputChange} placeholder={t('submitMod.cpuPlaceholder')} className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-sm focus:border-app-accent outline-none dark:text-white" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR (Sticky) */}
            <aside className="lg:col-span-4 relative">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white dark:bg-app-surface rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-card">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{t('submitMod.modDetails')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-bold">{t('submitMod.version')}</label>
                      <input type="text" name="version" value={formData.version} onChange={handleInputChange} placeholder="1.0.0" className="w-full bg-gray-100 dark:bg-white/5 rounded px-3 py-2 mt-1 text-sm dark:text-white focus:ring-1 focus:ring-app-accent outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-bold">{t('submitMod.downloadUrl')}</label>
                      <input type="text" name="downloadUrl" value={formData.downloadUrl} onChange={handleInputChange} placeholder="https://..." className="w-full bg-gray-100 dark:bg-white/5 rounded px-3 py-2 mt-1 text-sm dark:text-white focus:ring-1 focus:ring-app-accent outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-bold">{t('submitMod.fileSize')}</label>
                      <input type="number" name="fileSize" value={formData.fileSize} onChange={handleInputChange} placeholder="0" className="w-full bg-gray-100 dark:bg-white/5 rounded px-3 py-2 mt-1 text-sm dark:text-white focus:ring-1 focus:ring-app-accent outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-bold">{t('submitMod.tags')}</label>
                      <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder={t('submitMod.tags')} className="w-full bg-gray-100 dark:bg-white/5 rounded px-3 py-2 mt-1 text-sm dark:text-white focus:ring-1 focus:ring-app-accent outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <i className="ph-fill ph-info text-blue-400 text-xl"></i>
                    <p className="text-sm text-blue-200">
                      {t('submitMod.reviewInfo')}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}