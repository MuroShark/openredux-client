interface LightboxProps {
  src: string;
  onClose: () => void;
}

export const Lightbox = ({ src, onClose }: LightboxProps) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50">
        <i className="ph-bold ph-x text-3xl"></i>
      </button>
      <div className="relative w-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={src} className="w-full h-full object-contain rounded shadow-2xl" alt="Full size" />
        <div className="absolute bottom-4 left-0 w-full text-center text-gray-400 text-sm">Click outside to close</div>
      </div>
    </div>
  );
};