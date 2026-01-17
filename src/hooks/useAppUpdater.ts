import { useState, useCallback, useEffect, useRef } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export const useAppUpdater = (autoCheck = true) => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [version, setVersion] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'downloading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Храним объект обновления, чтобы не запрашивать его повторно при установке
  const updateRef = useRef<Update | null>(null);

  const checkUpdate = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const update = await check();
      if (update) {
        updateRef.current = update;
        setUpdateAvailable(true);
        setVersion(update.version);
        setStatus('idle');
        return update;
      } else {
        updateRef.current = null;
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
    // Если объект обновления не был получен ранее, пробуем получить его сейчас
    if (!updateRef.current) {
      const update = await checkUpdate();
      if (!update) return;
    }

    const update = updateRef.current;
    if (!update) return;

    setStatus('downloading');
    setDownloadProgress(0);
    
    let downloaded = 0;
    let totalLength = 0;

    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            totalLength = event.data.contentLength || 0;
            setDownloadProgress(0);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (totalLength > 0) {
              setDownloadProgress(Math.round((downloaded / totalLength) * 100));
            }
            break;
          case 'Finished':
            setStatus('ready');
            setDownloadProgress(100);
            break;
        }
      });

      // Перезапуск приложения после установки
      await relaunch();
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }, [checkUpdate]);

  useEffect(() => {
    if (autoCheck) checkUpdate();
  }, [autoCheck, checkUpdate]);

  return { 
    updateAvailable, 
    version, 
    status, 
    error, 
    downloadProgress, 
    checkUpdate, 
    installUpdate 
  };
};