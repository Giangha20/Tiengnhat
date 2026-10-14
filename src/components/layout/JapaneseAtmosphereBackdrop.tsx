'use client';

import React from 'react';
import Image from 'next/image';
import { useUISettings } from '@/components/providers/UISettingsProvider';

interface RealWallpaperMeta {
  src: string;
  title: string;
  location: string;
  photographerCredit: string;
}

const REAL_WALLPAPERS: Record<string, RealWallpaperMeta> = {
  fuji: {
    src: '/images/wallpapers/fuji.jpg',
    title: 'Núi Phú Sĩ & Chùa Chureito',
    location: 'Yamanashi, Nhật Bản',
    photographerCredit: 'Ảnh thật chụp thực tế tại Yamanashi',
  },
  kyoto_torii: {
    src: '/images/wallpapers/kyoto_torii.jpg',
    title: 'Đền Fushimi Inari Taisha',
    location: 'Kyoto, Nhật Bản',
    photographerCredit: 'Ảnh thật đường hầm nghìn cổng Torii tại Kyoto',
  },
  sakura: {
    src: '/images/wallpapers/sakura.jpg',
    title: 'Mùa Hoa Anh Đào Sakura',
    location: 'Tokyo, Nhật Bản',
    photographerCredit: 'Ảnh thật hoa anh đào nở rộ tại Nhật Bản',
  },
  tokyo_night: {
    src: '/images/wallpapers/tokyo_night.jpg',
    title: 'Phố Đêm Tokyo Rực Rỡ Ánh Đèn',
    location: 'Shinjuku, Tokyo, Nhật Bản',
    photographerCredit: 'Ảnh thật phố đêm Shinjuku Tokyo',
  },
};

export default function JapaneseAtmosphereBackdrop() {
  const { settings } = useUISettings();

  // If user selected 'minimal' wallpaper, don't render photo wallpaper
  if (settings.wallpaper === 'minimal') {
    return null;
  }

  const wallpaper = REAL_WALLPAPERS[settings.wallpaper] || REAL_WALLPAPERS.fuji;

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Real Photography Background Image (100% Ảnh Thật Tại Nhật Bản) */}
      <div className="absolute inset-0">
        <Image
          key={wallpaper.src}
          src={wallpaper.src}
          alt={`Ảnh chụp thật tại ${wallpaper.location} - ${wallpaper.title}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-[1.08] saturate-[1.1] transition-opacity duration-700"
        />
      </div>

      {/* 2. Intelligent Readability & Contrast Shield */}
      {/* Light Mode: Elegant translucent white/parchment wash to make black text pop with perfect contrast */}
      {/* Dark Mode: Deep atmospheric dark wash so Japanese furigana and kanji cards stand out with zero glare */}
      <div className="absolute inset-0 bg-background/80 dark:bg-background/88 backdrop-blur-[1.5px] transition-colors duration-300" />

      {/* 3. Subtle Horizon Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

      {/* 4. Subtle Real Location Tag in Bottom Right Corner */}
      <div className="absolute bottom-2.5 right-4 z-10 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 border border-border/60 backdrop-blur-md text-[10px] text-muted-foreground font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span>📸 Ảnh thật: {wallpaper.title} ({wallpaper.location})</span>
      </div>
    </div>
  );
}
