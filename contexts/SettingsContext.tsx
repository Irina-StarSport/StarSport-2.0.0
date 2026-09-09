import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadSettings, saveSettings, AppSettings, DEFAULT_SETTINGS } from '@/utils/storage';

interface SettingsContextType {
  settings: AppSettings;
  updateTextSize: (size: AppSettings['textSize']) => void;
  updateLanguage: (lang: AppSettings['language']) => void;
  textScale: number;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateTextSize = useCallback((size: AppSettings['textSize']) => {
    setSettings((prev) => {
      const updated = { ...prev, textSize: size };
      saveSettings(updated);
      console.log(`[SettingsContext] textSize updated: ${size}`);
      return updated;
    });
  }, []);

  const updateLanguage = useCallback((lang: AppSettings['language']) => {
    setSettings((prev) => {
      const updated = { ...prev, language: lang };
      saveSettings(updated);
      console.log(`[SettingsContext] language updated: ${lang}`);
      return updated;
    });
  }, []);

  const textScale = settings.textSize === 'small' ? 0.85 : settings.textSize === 'large' ? 1.2 : 1;

  return (
    <SettingsContext.Provider value={{ settings, updateTextSize, updateLanguage, textScale }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
