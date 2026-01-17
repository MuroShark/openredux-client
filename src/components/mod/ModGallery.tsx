import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ModGalleryProps {
  screenshots: string[];
  onImageClick: (index: number) => void;
}

export const ModGallery = ({ screenshots, onImageClick }: ModGalleryProps) => {
  const { t } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Ref для отслеживания факта перетаскивания (чтобы не срабатывал клик при драге)
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    isDragging.current = false;
    setStartX(e.pageX);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 2; // Скорость прокрутки (множитель)
    sliderRef.current.scrollLeft = scrollLeft - walk;
    
    // Если сдвинули больше чем на 5 пикселей, считаем это драгом, а не кликом
    if (Math.abs(x - startX) > 5) {
      isDragging.current = true;
    }
  };

  const handleItemClick = (index: number) => {
    if (!isDragging.current) {
      onImageClick(index);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <i className="ph ph-images text-gray-900 dark:text-app-accent"></i> {t('modDetails.screenshots')}
      </h2>
      <div 
        ref={sliderRef}
        className={`flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x select-none ${isDown ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {screenshots.map((src, idx) => (
          <div 
            key={idx} 
            className="snap-start flex-shrink-0 w-[300px] h-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-white/5 hover:border-app-accent transition-colors group relative" 
            onClick={() => handleItemClick(idx)}
          >
            <img 
              src={src} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
              alt={`Screenshot ${idx + 1}`} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};