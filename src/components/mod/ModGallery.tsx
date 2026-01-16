import { useTranslation } from 'react-i18next';

interface ModGalleryProps {
  screenshots: string[];
  onImageClick: (src: string) => void;
}

export const ModGallery = ({ screenshots, onImageClick }: ModGalleryProps) => {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <i className="ph ph-images text-gray-900 dark:text-app-accent"></i> {t('modDetails.screenshots')}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
        {screenshots.map((src, idx) => (
          <button 
            key={idx} 
            type="button"
            className="snap-start flex-shrink-0 w-[300px] h-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-white/5 cursor-pointer hover:border-app-accent transition-colors group focus:outline-none focus:ring-2 focus:ring-app-accent" 
            onClick={() => onImageClick(src)}
          >
            <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Screenshot ${idx + 1}`} />
          </button>
        ))}
      </div>
    </section>
  );
};