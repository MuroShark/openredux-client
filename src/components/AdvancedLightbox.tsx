import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface AdvancedLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function AdvancedLightbox({ images, initialIndex, onClose }: AdvancedLightboxProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Навигация: Следующий слайд (циклично)
  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Навигация: Предыдущий слайд (циклично)
  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Синхронизация состояния Fullscreen (HTML5 API)
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Поддержка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Если мы не в полноэкранном режиме - закрываем лайтбокс.
        // Если в полноэкранном - браузер сам обработает Esc и выйдет из него (сработает событие fullscreenchange)
        if (!document.fullscreenElement) {
          onClose();
        }
      }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, next, prev]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      await document.exitFullscreen().catch(console.error);
    }
  };

  const handleClose = () => {
    // Если закрываем лайтбокс в режиме Fullscreen, принудительно выходим из него
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
    onClose();
  };

  // Классы контейнера:
  // Если Fullscreen: перекрываем всё (z-100), черный фон.
  // Если Обычный: отступ сверху для TitleBar (top-[var(--titlebar-height)]), z-40 (под TitleBar), полупрозрачность.
  const containerClass = isFullscreen 
    ? "fixed inset-0 z-[100] bg-black flex items-center justify-center"
    : "fixed inset-0 top-[var(--titlebar-height)] z-40 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in";

  return createPortal(
    <div ref={containerRef} className={containerClass}>
      {/* Close Button (Top Right) - Distinct and separated */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-[#E81123] text-white transition-all backdrop-blur-md z-50 group"
        title={t('lightbox.close')}
      >
        <i className="ph-bold ph-x text-xl group-hover:scale-110 transition-transform"></i>
      </button>

      {/* Navigation Buttons */}
      <button 
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white transition-all hover:scale-110 z-50 group"
      >
        <i className="ph-bold ph-caret-left text-2xl group-hover:-translate-x-0.5 transition-transform"></i>
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white transition-all hover:scale-110 z-50 group"
      >
        <i className="ph-bold ph-caret-right text-2xl group-hover:translate-x-0.5 transition-transform"></i>
      </button>

      {/* Main Image Container (Frame) */}
      <div 
        className={`relative transition-all duration-300 ${isFullscreen ? 'w-full h-full' : 'max-w-[90%] max-h-[85%] aspect-video shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-black'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={images[currentIndex]} alt={`Screenshot ${currentIndex + 1}`} className="w-full h-full object-contain" />
      </div>

      {/* Bottom Control Bar (Steam-like) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-center z-50 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent h-32">
        <div className="relative flex items-center justify-center">
          {/* Counter */}
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium border border-white/10 pointer-events-auto">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Fullscreen Toggle (Icon Only) */}
          <button 
            onClick={toggleFullscreen}
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/5 hover:border-white/20 pointer-events-auto group"
            title={isFullscreen ? t('lightbox.exitFullscreen') : t('lightbox.enterFullscreen')}
          >
            <i className={`ph-bold ${isFullscreen ? 'ph-corners-in' : 'ph-corners-out'} text-xl group-hover:scale-110 transition-transform`}></i>
          </button>
        </div>
      </div>

      {/* Backdrop Click to Close */}
      <div className="absolute inset-0 -z-10" onClick={handleClose} />
    </div>,
    document.body
  );
}