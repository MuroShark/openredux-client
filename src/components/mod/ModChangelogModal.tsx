import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Mod, getLocalized } from '../../data/mods';

const getChangelogTypeStyles = (type: string) => {
  switch (type) {
    case 'NEW': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'FIX': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'IMP': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'REM': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

interface ModChangelogModalProps {
  changelog: Mod['changelog'];
  onClose: () => void;
}

export const ModChangelogModal = ({ changelog, onClose }: ModChangelogModalProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-app-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[80vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-[#181818] rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><i className="ph-bold ph-git-commit text-gray-900 dark:text-app-accent"></i> {t('modDetails.updateHistory')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5">
            <i className="ph-bold ph-x text-xl"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-10">
          {changelog && changelog.length > 0 ? (
            changelog.map((entry, index) => (
              <div key={index} className={`relative pl-8 border-l border-gray-200 dark:border-white/10 ${index > 0 ? 'opacity-75 hover:opacity-100 transition-opacity' : ''}`}>
                {/* Timeline Dot */}
                <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full ring-4 ring-white dark:ring-app-surface ${index === 0 ? 'bg-app-accent shadow-neon' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-bold text-lg tracking-tight ${index === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>Version {entry.version}</h4>
                    {index === 0 && <span className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-app-accent/10 dark:text-app-accent text-[10px] font-bold px-2 py-0.5 rounded border dark:border-app-accent/20 uppercase">Current</span>}
                    {entry.isMajor && index !== 0 && <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 uppercase">Major</span>}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{entry.date}</span>
                </div>

                {/* Changes List */}
                <ul className={`space-y-3 text-sm ${index === 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {entry.changes.map((change, cIdx) => (
                    <li key={cIdx} className="flex gap-3 items-start">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold border mt-0.5 ${getChangelogTypeStyles(change.type)}`}>{change.type}</span>
                      <ReactMarkdown 
                        components={{ 
                          p: "span",
                          strong: (props) => <strong className="text-gray-900 dark:text-white" {...props} />
                        }}
                      >
                        {getLocalized(change.description, i18n.language)}
                      </ReactMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">No changelog available for this mod.</div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#181818] rounded-b-2xl text-center">
          <span className="text-xs text-gray-600">Showing last 3 major updates</span>
        </div>
      </div>
    </div>
  );
};