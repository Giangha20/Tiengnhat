'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  playTapSound,
  playFlipSound,
  playCorrectSound,
  playIncorrectSound,
  playCelebrationSound,
} from '@/lib/sound';

export type DeviceMode = 'auto' | 'mobile' | 'desktop';
export type KanjiSize = 'standard' | 'large' | 'xlarge';
export type LayoutDensity = 'comfortable' | 'compact';
export type AnimationMode = 'smooth' | 'minimal';
export type WallpaperTheme = 'fuji_sakura' | 'seigaiha' | 'torii' | 'minimal';

export interface UISettings {
  deviceMode: DeviceMode;
  kanjiSize: KanjiSize;
  layoutDensity: LayoutDensity;
  animationMode: AnimationMode;
  showRomaji: boolean;
  showFurigana: boolean;
  soundEnabled: boolean;
  bottomNavEnabled: boolean;
  wallpaper: WallpaperTheme;
  audioSpeed: number;
}

const DEFAULT_SETTINGS: UISettings = {
  deviceMode: 'auto',
  kanjiSize: 'standard',
  layoutDensity: 'comfortable',
  animationMode: 'smooth',
  showRomaji: true,
  showFurigana: true,
  soundEnabled: true,
  bottomNavEnabled: true,
  wallpaper: 'fuji_sakura',
  audioSpeed: 0.75,
};

interface UISettingsContextType {
  settings: UISettings;
  updateSettings: (updates: Partial<UISettings>) => void;
  resetSettings: () => void;
  playTap: () => void;
  playFlip: () => void;
  playCorrect: () => void;
  playIncorrect: () => void;
  playCelebration: () => void;
}

const UISettingsContext = createContext<UISettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
  playTap: () => {},
  playFlip: () => {},
  playCorrect: () => {},
  playIncorrect: () => {},
  playCelebration: () => {},
});

export function useUISettings() {
  return useContext(UISettingsContext);
}

const UI_SETTINGS_KEY = 'nihongo_ui_settings';

export function UISettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UISettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UI_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<UISettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse errors
    }
    setMounted(true);
  }, []);

  // Apply HTML attributes whenever settings change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-kanji-size', settings.kanjiSize);
      root.setAttribute('data-density', settings.layoutDensity);
      root.setAttribute('data-animation', settings.animationMode);
      root.setAttribute('data-romaji', settings.showRomaji ? 'visible' : 'hidden');
      root.setAttribute('data-device-mode', settings.deviceMode);
      root.setAttribute('data-furigana', settings.showFurigana ? 'visible' : 'hidden');
      root.setAttribute('data-wallpaper', settings.wallpaper);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nihongo_audio_speed', settings.audioSpeed.toString());
      }
    }
  }, [settings]);

  // Persist to localStorage
  const updateSettings = useCallback((updates: Partial<UISettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(UI_SETTINGS_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Audio helper bindings
  const playTap = useCallback(() => {
    if (settings.soundEnabled) playTapSound();
  }, [settings.soundEnabled]);

  const playFlip = useCallback(() => {
    if (settings.soundEnabled) playFlipSound();
  }, [settings.soundEnabled]);

  const playCorrect = useCallback(() => {
    if (settings.soundEnabled) playCorrectSound();
  }, [settings.soundEnabled]);

  const playIncorrect = useCallback(() => {
    if (settings.soundEnabled) playIncorrectSound();
  }, [settings.soundEnabled]);

  const playCelebration = useCallback(() => {
    if (settings.soundEnabled) playCelebrationSound();
  }, [settings.soundEnabled]);

  return (
    <UISettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        playTap,
        playFlip,
        playCorrect,
        playIncorrect,
        playCelebration,
      }}
    >
      {children}
    </UISettingsContext.Provider>
  );
}
