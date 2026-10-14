'use client';

import React from 'react';
import { useUISettings } from '@/components/providers/UISettingsProvider';

export default function JapaneseAtmosphereBackdrop() {
  const { settings } = useUISettings();

  // If user selected 'minimal' wallpaper, don't render scenery
  if (settings.wallpaper === 'minimal') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Atmospheric Sky Wash & Gentle Horizon Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      {/* 2. Top Japanese Sun / Moon Aura */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-60 dark:opacity-40" />

      {/* 3. Mount Fuji & Scenery Vector Artwork */}
      {(settings.wallpaper === 'fuji_sakura' || settings.wallpaper === 'torii') && (
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-[320px] sm:h-[420px] md:h-[500px] text-foreground transition-opacity duration-500"
          viewBox="0 0 1440 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* Subtle Far Mountain Range */}
          <path
            d="M0 500 L0 340 Q320 280 620 330 T1200 310 L1440 330 L1440 500 Z"
            fill="currentColor"
            className="text-foreground/[0.025] dark:text-foreground/[0.035]"
          />

          {/* Mount Fuji (富士山) Silhouette */}
          <g className="japanese-backdrop-mountains">
            {/* Fuji Base & Slopes */}
            <path
              d="M380 500 L680 180 L760 180 L1060 500 Z"
              fill="currentColor"
              className="text-primary/[0.04] dark:text-primary/[0.06]"
            />
            {/* Fuji Snow Cap */}
            <path
              d="M680 180 L700 230 Q720 220 735 240 Q745 225 760 180 Z"
              fill="currentColor"
              className="text-foreground/[0.06] dark:text-foreground/[0.12]"
            />
          </g>

          {/* Traditional Torii Gate (⛩️) on the Right Shore */}
          <g className="japanese-backdrop-torii">
            <g transform="translate(1120, 290) scale(0.65)">
              {/* Torii Upper Curved Crossbeam (Kasagi) */}
              <path
                d="M-50 15 Q40 0 130 15 L125 25 Q40 12 -45 25 Z"
                fill="currentColor"
                className="text-primary/40 dark:text-primary/50"
              />
              {/* Torii Lower Straight Beam (Nuki) */}
              <rect
                x="-35"
                y="38"
                width="150"
                height="8"
                rx="1"
                fill="currentColor"
                className="text-primary/40 dark:text-primary/50"
              />
              {/* Torii Two Pillars (Hashira) */}
              <rect
                x="-10"
                y="15"
                width="14"
                height="140"
                rx="2"
                fill="currentColor"
                className="text-primary/35 dark:text-primary/45"
              />
              <rect
                x="76"
                y="15"
                width="14"
                height="140"
                rx="2"
                fill="currentColor"
                className="text-primary/35 dark:text-primary/45"
              />
            </g>
          </g>

          {/* Traditional Pine Trees (Matsu) on the Left */}
          <g transform="translate(60, 310) scale(0.7)">
            <path
              d="M80 190 Q90 120 70 70 M70 70 Q60 50 30 55 M70 70 Q95 50 120 60"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className="text-foreground/[0.06] dark:text-foreground/[0.10]"
            />
            {/* Pine needle clusters */}
            <ellipse cx="30" cy="55" rx="35" ry="12" fill="currentColor" className="text-success/[0.07] dark:text-success/[0.12]" />
            <ellipse cx="120" cy="60" rx="38" ry="14" fill="currentColor" className="text-success/[0.07] dark:text-success/[0.12]" />
            <ellipse cx="70" cy="40" rx="42" ry="15" fill="currentColor" className="text-success/[0.08] dark:text-success/[0.14]" />
          </g>
        </svg>
      )}

      {/* 4. Traditional Japanese Seigaiha Waves (Làn sóng bình yên) */}
      {(settings.wallpaper === 'seigaiha' || settings.wallpaper === 'fuji_sakura') && (
        <div className="absolute bottom-0 left-0 right-0 h-28 opacity-[0.035] dark:opacity-[0.05] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-foreground to-transparent [mask-image:linear-gradient(to_bottom,transparent,black)]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="seigaiha-pattern" width="60" height="30" patternUnits="userSpaceOnUse">
                <path d="M0 30 A30 30 0 0 1 60 30 M10 30 A20 20 0 0 1 50 30 M20 30 A10 10 0 0 1 40 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M30 15 A30 30 0 0 1 90 15 M40 15 A20 20 0 0 1 80 15 M50 15 A10 10 0 0 1 70 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M-30 15 A30 30 0 0 1 30 15 M-20 15 A20 20 0 0 1 20 15 M-10 15 A10 10 0 0 1 10 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seigaiha-pattern)" />
          </svg>
        </div>
      )}

      {/* 5. Gently Drifting Sakura Petals (Cánh hoa anh đào lượn êm) */}
      {settings.wallpaper === 'fuji_sakura' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: '10%', delay: '0s', duration: '14s', size: '14px' },
            { left: '25%', delay: '4s', duration: '18s', size: '12px' },
            { left: '42%', delay: '1s', duration: '16s', size: '15px' },
            { left: '60%', delay: '7s', duration: '20s', size: '13px' },
            { left: '78%', delay: '2s', duration: '15s', size: '16px' },
            { left: '92%', delay: '5s', duration: '17s', size: '12px' },
          ].map((petal, idx) => (
            <span
              key={idx}
              className="sakura-petal"
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                width: petal.size,
                height: petal.size,
              }}
            >
              <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 0 C22 8, 30 15, 20 25 C15 30, 8 28, 5 22 C0 15, 8 8, 15 0 Z"
                  fill="#f472b6"
                  className="opacity-40 dark:opacity-35"
                />
              </svg>
            </span>
          ))}
        </div>
      )}

      {/* 6. Soft Radial Vignette for Center Text Readability */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,var(--background)_90%] opacity-70" />
    </div>
  );
}
