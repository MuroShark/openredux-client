import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";
import { isPremium } from "../data/user";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuthStore();
  const { t } = useTranslation();
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState({ discord: "", telegram: "", youtube: "", website: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSocials({
        discord: user.socialLinks?.discord || "",
        telegram: user.socialLinks?.telegram || "",
        youtube: user.socialLinks?.youtube || "",
        website: user.socialLinks?.website || "",
      });
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ bio, socialLinks: socials });
    setIsSaving(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-app-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden transform transition-all animate-slide-up">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-app-accent/20 to-blue-500/20">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-app-surface overflow-hidden bg-gray-800">
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="pt-12 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {user.username}
                {isPremium(user) && <i className="ph-fill ph-seal-check text-app-accent text-xl" title="Premium"></i>}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4 text-center">
              <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg min-w-[80px]">
                <div className="text-lg font-bold text-app-accent">{user.downloadsCount || 0}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">{t('profileModal.downloads')}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('profileModal.bio')}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-app-accent resize-none h-24"
                placeholder={t('profileModal.bioPlaceholder')}
              />
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('profileModal.socialLinks')}</label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10">
                  <i className="ph-bold ph-discord-logo text-xl text-[#5865F2]"></i>
                  <input 
                    value={socials.discord}
                    onChange={(e) => setSocials({...socials, discord: e.target.value})}
                    className="bg-transparent w-full text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder={t('profileModal.discordPlaceholder')}
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10">
                  <i className="ph-bold ph-telegram-logo text-xl text-[#229ED9]"></i>
                  <input 
                    value={socials.telegram}
                    onChange={(e) => setSocials({...socials, telegram: e.target.value})}
                    className="bg-transparent w-full text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder={t('profileModal.telegramPlaceholder')}
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10">
                  <i className="ph-bold ph-youtube-logo text-xl text-[#FF0000]"></i>
                  <input 
                    value={socials.youtube}
                    onChange={(e) => setSocials({...socials, youtube: e.target.value})}
                    className="bg-transparent w-full text-sm text-gray-900 dark:text-white focus:outline-none"
                    placeholder={t('profileModal.youtubePlaceholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('profileModal.cancel')}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-app-accent text-black text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isSaving ? t('profileModal.saving') : t('profileModal.save')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}