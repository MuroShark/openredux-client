import { useState, useCallback, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export const useAppUpdater = (autoCheck = true) => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [version, setVersion] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'downloading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const checkUpdate = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const update = await check();
      if (update?.available) {
        setUpdateAvailable(true);
        setVersion(update.version);
        setStatus('idle');
        return update;
      } else {
        setUpdateAvailable(false);
        setStatus('idle');
      }
    } catch (e) {
      console.error('Failed to check for updates:', e);
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
    return null;
  }, []);

  const installUpdate = useCallback(async () => {
    setStatus('downloading');
    try {
      const update = await check();
      if (update?.available) {
        let downloaded = 0;
        let contentLength = 0;
        
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength || 0;
              break;
            case 'Progress':
              downloaded += event.data.chunkLength;
              // Здесь можно добавить логику прогресс-бара
              break;
            case 'Finished':
              setStatus('ready');
              break;
          }
        });

        // Перезапуск приложения после установки
        await relaunch();
      }
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }, []);

  useEffect(() => {
    if (autoCheck) checkUpdate();
  }, [autoCheck, checkUpdate]);

  return { updateAvailable, version, status, error, checkUpdate, installUpdate };
};