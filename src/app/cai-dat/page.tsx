'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { useProgress } from '@/components/providers/ProgressProvider';
import { useUISettings, type DeviceMode, type KanjiSize, type LayoutDensity, type AnimationMode, type WallpaperTheme } from '@/components/providers/UISettingsProvider';
import AudioSpeedControl from '@/components/ui/AudioSpeedControl';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function CaiDatPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, resetSettings: resetUISettings, playTap, playFlip, playCorrect, playCelebration } = useUISettings();
  const {
    progress,
    updateProgress,
    resetProgress,
    exportToFile,
    importFromFile,
    saveToCloud,
    loadFromCloud,
    syncCode,
    setSyncCode,
    lastSyncedAt,
  } = useProgress();

  const [activeTab, setActiveTab] = useState<'display' | 'learning' | 'data' | 'system'>('display');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(progress.dailyGoal);
  const [codeInputValue, setCodeInputValue] = useState(syncCode);

  // Status notifications
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoadingSync, setIsLoadingSync] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCodeInputValue(syncCode);
  }, [syncCode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleSaveDailyGoal = () => {
    updateProgress({ dailyGoal: Math.max(1, Math.min(100, dailyGoal)) });
    playTap();
    setStatusMsg({ text: 'Đã lưu mục tiêu hàng ngày!', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    setStatusMsg({ text: 'Đã thiết lập lại toàn bộ tiến độ về trạng thái ban đầu.', type: 'info' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleExportFile = () => {
    try {
      playTap();
      const { filename, sizeKb } = exportToFile();
      setStatusMsg({
        text: `Đã xuất tệp thành công: ${filename} (${sizeKb} KB). Hãy lưu trữ cẩn thận!`,
        type: 'success',
      });
    } catch {
      setStatusMsg({ text: 'Có lỗi xảy ra khi tạo tệp xuất dữ liệu.', type: 'error' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg({ text: 'Đang kiểm tra và nhập dữ liệu từ tệp...', type: 'info' });
    const res = await importFromFile(file);
    if (res.success) {
      playCorrect();
      setStatusMsg({
        text: `Đã khôi phục thành công toàn bộ tiến độ từ tệp "${file.name}"!`,
        type: 'success',
      });
    } else {
      setStatusMsg({
        text: res.error || 'Tệp tin không hợp lệ.',
        type: 'error',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveCloud = async () => {
    if (!codeInputValue.trim()) {
      setStatusMsg({ text: 'Vui lòng cung cấp mã đồng bộ.', type: 'error' });
      return;
    }
    setIsLoadingSync(true);
    setStatusMsg({ text: 'Đang tải dữ liệu tiến độ lên máy chủ đám mây...', type: 'info' });

    const res = await saveToCloud(codeInputValue);
    setIsLoadingSync(false);

    if (res.success) {
      playCorrect();
      setStatusMsg({
        text: `Sao lưu Online thành công! Mã đồng bộ: ${codeInputValue.toUpperCase()}`,
        type: 'success',
      });
    } else {
      setStatusMsg({
        text: res.message || 'Không thể lưu lên đám mây.',
        type: 'error',
      });
    }
  };

  const handleLoadCloud = async () => {
    if (!codeInputValue.trim()) {
      setStatusMsg({ text: 'Vui lòng nhập mã đồng bộ để khôi phục.', type: 'error' });
      return;
    }
    setIsLoadingSync(true);
    setStatusMsg({ text: 'Đang kết nối máy chủ để tìm dữ liệu...', type: 'info' });

    const res = await loadFromCloud(codeInputValue);
    setIsLoadingSync(false);

    if (res.success) {
      playCelebration();
      setStatusMsg({
        text: `Đã khôi phục thành công tiến độ từ máy chủ đám mây! (Mã: ${codeInputValue.toUpperCase()})`,
        type: 'success',
      });
    } else {
      setStatusMsg({
        text: res.error || 'Không tìm thấy dữ liệu sao lưu tương ứng.',
        type: 'error',
      });
    }
  };

  const handleCopyCode = () => {
    if (typeof window !== 'undefined' && codeInputValue) {
      navigator.clipboard.writeText(codeInputValue.toUpperCase());
      playTap();
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="hanko-stamp">設定</span>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Cài Đặt & Tinh Chỉnh</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tối ưu hóa hiển thị cho Điện thoại & Máy tính, trợ giúp đọc Kanji, hiệu ứng âm thanh và đồng bộ đám mây.
          </p>
        </div>
        <Link
          href="/ho-so"
          onClick={playTap}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-bold transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
        >
          <span>👤</span>
          <span>Xem Hồ sơ cá nhân →</span>
        </Link>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200 ${
            statusMsg.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : statusMsg.type === 'error'
              ? 'bg-error/10 border-error/30 text-error'
              : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">
              {statusMsg.type === 'success' ? '✓' : statusMsg.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* LIVE SANDBOX PREVIEW CARD */}
      <div className="bg-gradient-to-br from-primary/5 via-card to-card rounded-3xl border-2 border-primary/25 p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-primary">
              Xem Trước Trực Tiếp (Live Real-Time Preview)
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Mọi thay đổi áp dụng tức thì
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Visual Sample */}
          <div className="p-5 rounded-2xl bg-background border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                Mẫu hiển thị từ vựng & Kanji
              </span>
              <span className="text-xs text-muted-foreground">N5 Sơ cấp</span>
            </div>

            <div className="py-2 flex flex-col items-center justify-center text-center">
              <ruby className="ja-large font-bold text-foreground">
                桜
                <rt className="text-xs font-semibold text-primary">さくら</rt>
              </ruby>
              {settings.showRomaji && (
                <span className="romaji-text font-mono text-xs text-muted-foreground mt-1">
                  sakura • /sa.ku.ra/
                </span>
              )}
              <p className="text-sm font-bold text-foreground mt-2">Hoa anh đào Nhật Bản</p>
            </div>

            <div className="pt-2 border-t border-border/60 text-center">
              <ruby className="text-sm text-foreground ja-text">
                私<rt className="text-[10px] text-primary">わたし</rt>は
                日本<rt className="text-[10px] text-primary">にほん</rt>へ
                行<rt className="text-[10px] text-primary">い</rt>きます。
              </ruby>
              {settings.showRomaji && (
                <p className="romaji-text text-[11px] font-mono text-muted-foreground mt-0.5">
                  Watashi wa Nihon e ikimasu.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tôi sẽ đi Nhật Bản.</p>
            </div>
          </div>

          {/* Interactive Sound & Tactile Test Area */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground">Thử nghiệm phản hồi xúc giác & âm thanh:</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhấn các nút bên dưới để nghe thử âm thanh Web Audio phản hồi tức thì (0ms trễ):
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={playTap}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold transition-all text-foreground cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🔘</span>
                <span>Gõ phím (Tap)</span>
              </button>
              <button
                type="button"
                onClick={playFlip}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold transition-all text-foreground cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🃏</span>
                <span>Lật thẻ (Flip)</span>
              </button>
              <button
                type="button"
                onClick={playCorrect}
                className="p-2.5 rounded-xl border border-success/30 bg-success/10 text-success text-xs font-bold transition-all hover:bg-success/20 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>✓</span>
                <span>Trả lời đúng</span>
              </button>
              <button
                type="button"
                onClick={playCelebration}
                className="p-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold transition-all hover:bg-primary/20 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🎉</span>
                <span>Chiến thắng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 p-1.5 bg-secondary/80 rounded-2xl border border-border overflow-x-auto">
        <button
          onClick={() => { setActiveTab('display'); playTap(); }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'display'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>📱</span>
          <span>Điện Thoại & PC</span>
        </button>
        <button
          onClick={() => { setActiveTab('learning'); playTap(); }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'learning'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>📖</span>
          <span>Hỗ Trợ Đọc</span>
        </button>
        <button
          onClick={() => { setActiveTab('data'); playTap(); }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'data'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>💾</span>
          <span>Lưu Tệp & Đám Mây</span>
        </button>
        <button
          onClick={() => { setActiveTab('system'); playTap(); }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'system'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>⚙️</span>
          <span>Hệ Thống</span>
        </button>
      </div>

      {/* TAB 1: DISPLAY & DEVICE TUNING (Phone & PC) */}
      {activeTab === 'display' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Device Layout Mode */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>📱</span>
                <span>Chế độ hiển thị thiết bị (Device Optimization)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tự động điều chỉnh kích thước nút bấm và khoảng cách để tối ưu ngón tay (điện thoại) hoặc chuột/phím (PC).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'auto', label: 'Tự động (Khuyên dùng)', desc: 'Tự nhận diện màn hình điện thoại hoặc máy tính' },
                { value: 'mobile', label: 'Tối ưu Điện thoại', desc: 'Nút bấm 48px+, chạm ngón tay 1 tay, thanh dock đáy' },
                { value: 'desktop', label: 'Tối ưu Máy tính PC', desc: 'Layout nhiều cột rộng, phím tắt 1-4, Enter' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    updateSettings({ deviceMode: item.value as DeviceMode });
                    playTap();
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    settings.deviceMode === item.value
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Kanji Font Size */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>漢</span>
                <span>Kích thước chữ Kanji & Kana (Kanji Display Size)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Giúp người học nhìn rõ từng nét bút chữ Hán phức tạp ngay trên màn hình nhỏ.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'standard', label: 'Tiêu chuẩn (100%)', example: '語', desc: 'Cân đối, phù hợp với người đã quen mặt chữ' },
                { value: 'large', label: 'Lớn (120%)', example: '語', desc: 'Rõ nét, dễ phân biệt bộ thủ tương tự nhau' },
                { value: 'xlarge', label: 'Rất lớn (140%)', example: '語', desc: 'Lý tưởng trên điện thoại và người mới học' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    updateSettings({ kanjiSize: item.value as KanjiSize });
                    playTap();
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    settings.kanjiSize === item.value
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div>
                    <span className="ja-text text-3xl font-black text-primary block mb-2">{item.example}</span>
                    <p className="font-bold text-sm text-foreground">{item.label}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Mobile Bottom Dock Toggle */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>⚓</span>
                  <span>Thanh Dock điều hướng nhanh phía dưới (Bottom Navigation)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Thanh điều hướng cố định dưới chân màn hình điện thoại (Trang chủ, Từ vựng, Kanji, Ngữ pháp, Luyện tập, Hồ sơ).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ bottomNavEnabled: !settings.bottomNavEnabled });
                  playTap();
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.bottomNavEnabled ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
                aria-label="Bật tắt thanh điều hướng dưới"
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>
          </section>

          {/* Layout Density */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>📐</span>
                <span>Mật độ bố cục giao diện (Layout Density)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chọn giữa không gian thoáng đãng hoặc hiển thị nhiều nội dung hơn trên một trang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'comfortable', label: 'Rộng rãi (Comfortable)', desc: 'Khoảng cách thoáng, lướt đọc êm ái, giảm mỏi mắt' },
                { value: 'compact', label: 'Gọn gàng (Compact)', desc: 'Thu nhỏ khoảng cách để xem được nhiều thẻ bài cùng lúc' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    updateSettings({ layoutDensity: item.value as LayoutDensity });
                    playTap();
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    settings.layoutDensity === item.value
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Wallpaper Scenery Theme */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>🌸</span>
                <span>Hình nền phong cảnh Nhật Bản (Japanese Atmosphere)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tạo cảm hứng học tập với ảnh nền núi Phú Sĩ, cánh hoa anh đào bay lượn hoặc làn sóng Zen truyền thống.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'fuji_sakura', label: 'Núi Phú Sĩ & Hoa Anh Đào', icon: '🗻🌸', desc: 'Có núi Phú Sĩ, cổng Torii & cánh hoa rơi' },
                { value: 'seigaiha', label: 'Làn Sóng Seigaiha', icon: '🌊', desc: 'Họa tiết làn sóng biển thanh bình' },
                { value: 'torii', label: 'Cổng Đền Torii', icon: '⛩️', desc: 'Cổng đền Thần đạo cổ kính bên rặng thông' },
                { value: 'minimal', label: 'Nền Tối Giản', icon: '🎨', desc: 'Không họa tiết, tập trung tối đa' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    updateSettings({ wallpaper: item.value as WallpaperTheme });
                    playTap();
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    settings.wallpaper === item.value
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div>
                    <span className="text-2xl block mb-2">{item.icon}</span>
                    <p className="font-bold text-xs sm:text-sm text-foreground">{item.label}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: READING & STUDY ASSISTS */}
      {activeTab === 'learning' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Audio Speech Speed Control with live test */}
          <AudioSpeedControl />

          {/* Romaji Visibility Toggle */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>🔤</span>
                  <span>Hiển thị phiên âm Romaji</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                  Bật cho người mới bắt đầu. Khi đã thuộc Hiragana & Katakana, khuyến khích <strong>TẮT ROMAJI</strong> để rèn phản xạ đọc chữ Nhật tự nhiên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ showRomaji: !settings.showRomaji });
                  playTap();
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.showRomaji ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>
          </section>

          {/* Furigana Visibility Toggle */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>🌸</span>
                  <span>Hiển thị cách đọc Furigana trên đầu chữ Hán</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                  Khi tắt, chữ Kana trên đầu Kanji sẽ ẩn đi; bạn chỉ cần rê chuột hoặc chạm vào chữ Kanji để xem cách đọc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ showFurigana: !settings.showFurigana });
                  playTap();
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.showFurigana ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>
          </section>

          {/* Sound Effects Toggle */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>🔊</span>
                  <span>Âm thanh tương tác & Haptic Feedback</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                  Hiệu ứng âm thanh tinh tế khi bấm nút, lật flashcard 3D và trả lời trắc nghiệm (tổng hợp qua Web Audio).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ soundEnabled: !settings.soundEnabled });
                  playTap();
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.soundEnabled ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>
          </section>

          {/* Animation Mode */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>⚡</span>
                <span>Hiệu ứng chuyển động (Animation Mode)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Điều chỉnh độ mượt hoạt ảnh giao diện để cân bằng giữa vẻ đẹp thị giác và thời lượng pin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'smooth', label: 'Đầy đủ & Mượt mà (Smooth)', desc: 'Lật thẻ 3D, hiệu ứng phóng to hover, chuyển trang sinh động' },
                { value: 'minimal', label: 'Tối giản (Minimal)', desc: 'Tắt hoạt ảnh phức tạp, tiết kiệm pin cho điện thoại và máy yếu' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    updateSettings({ animationMode: item.value as AnimationMode });
                    playTap();
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    settings.animationMode === item.value
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: DATA, BACKUP & CLOUD SYNC */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <section className="bg-card rounded-2xl border border-primary/30 p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>💾</span>
                  <span>Sao Lưu Tệp Tin & Đồng Bộ Trực Tuyến Đám Mây</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bảo vệ toàn bộ tiến độ, không lo mất dữ liệu khi đổi trình duyệt hay thiết bị.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                    isOnline
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-error/10 text-error border border-error/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-error'}`} />
                  {isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                </span>
              </div>
            </div>

            {/* Offline File Backup */}
            <div className="space-y-3 bg-background/50 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>📁</span>
                  <span>Lưu ra Tệp Tin (File Backup)</span>
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  .JSON
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tải toàn bộ tiến độ (từ vựng, kanji, ngữ pháp, flashcard, điểm thi) về máy của bạn để lưu giữ an toàn.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleExportFile}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📥</span>
                  <span>Tải tệp tiến độ về máy (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-card border border-border hover:bg-secondary text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📤</span>
                  <span>Khôi phục từ tệp tin</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Online Cloud Sync */}
            <div className="space-y-4 bg-background/50 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>☁️</span>
                  <span>Đồng Bộ Trực Tuyến Đám Mây (Online Cloud Sync)</span>
                </h3>
                {lastSyncedAt && (
                  <span className="text-[10px] text-muted-foreground">
                    Lần cuối: {new Date(lastSyncedAt).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Sử dụng Mã Đồng Bộ để chuyển tiến độ sang điện thoại, máy tính bảng hoặc máy tính khác chỉ với 1 thao tác.
              </p>

              <div className="space-y-2">
                <label htmlFor="sync-code" className="text-xs font-semibold text-foreground block">
                  Mã đồng bộ cá nhân (Sync Key):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="sync-code"
                    type="text"
                    value={codeInputValue}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCodeInputValue(val);
                      setSyncCode(val);
                    }}
                    placeholder="VD: NHG-8A2K-9P3F"
                    className="flex-1 font-mono uppercase text-sm tracking-wider px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-bold transition-colors cursor-pointer"
                    title="Sao chép mã"
                  >
                    {copiedCode ? '✓ Đã chép' : '📋 Chép mã'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveCloud}
                  disabled={isLoadingSync || !isOnline}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-primary text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>☁️ ↑</span>
                  <span>Lưu lên đám mây (Online Backup)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadCloud}
                  disabled={isLoadingSync || !isOnline}
                  className="px-4 py-2.5 bg-card border border-border hover:bg-secondary text-foreground rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>☁️ ↓</span>
                  <span>Tải về từ đám mây (Online Restore)</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: SYSTEM & THEME */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Theme Mode */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>🎨</span>
                <span>Giao diện Màu sắc (Theme Mode)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chuyển đổi giữa chế độ nền sáng và nền tối giảm mỏi mắt khi học vào ban đêm.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { value: 'light', label: '☀️ Sáng', desc: 'Giao diện nền sáng trang nhã' },
                { value: 'dark', label: '🌙 Tối', desc: 'Giao diện nền tối dịu mắt' },
                { value: 'system', label: '💻 Hệ thống', desc: 'Tự động theo thiết bị' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value as 'light' | 'dark' | 'system');
                    playTap();
                  }}
                  className={`flex-1 min-w-[140px] p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    theme === option.value
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{option.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Daily Goal */}
          <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-base text-foreground">🎯 Mục tiêu học hàng ngày</h2>
            <div className="flex items-center gap-4">
              <label htmlFor="daily-goal" className="text-sm text-muted-foreground">
                Số mục tiêu mỗi ngày:
              </label>
              <input
                id="daily-goal"
                type="number"
                min={1}
                max={100}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-center font-bold"
              />
              <button
                type="button"
                onClick={handleSaveDailyGoal}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Lưu mục tiêu
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bao gồm từ vựng, ngữ pháp mới và các mục ôn tập. Khuyến nghị cho người mới bắt đầu: 10-20 mục mỗi ngày.
            </p>
          </section>

          {/* Reset Defaults */}
          <section className="bg-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-foreground">Khôi phục cài đặt giao diện gốc</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đặt lại kích thước Kanji, âm thanh và mật độ giao diện về mặc định ban đầu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetUISettings();
                playTap();
                setStatusMsg({ text: 'Đã khôi phục cài đặt giao diện về mặc định.', type: 'info' });
              }}
              className="px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer self-start sm:self-auto"
            >
              Khôi phục mặc định
            </button>
          </section>

          {/* Danger Zone: Reset Data */}
          <section className="bg-card rounded-2xl border border-error/20 p-6 space-y-4">
            <h2 className="font-bold text-base text-error">⚠️ Vùng nguy hiểm: Xóa Tiến Độ</h2>
            <p className="text-xs text-muted-foreground">
              Xóa bỏ toàn bộ lịch sử học tập, số từ vựng đã nhớ và kết quả thi thử trên trình duyệt này.
            </p>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-error/10 text-error border border-error/30 rounded-xl text-xs font-bold hover:bg-error/20 transition-colors cursor-pointer"
              >
                Xóa toàn bộ tiến độ học tập
              </button>
            ) : (
              <div className="p-4 bg-error/5 border border-error/30 rounded-xl space-y-3">
                <p className="text-xs font-bold text-error">
                  ⚠️ Cảnh báo: Bạn có chắc chắn muốn xóa toàn bộ tiến độ? Hãy tải tệp sao lưu về máy trước nếu cần giữ lại.
                </p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-error text-white rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
