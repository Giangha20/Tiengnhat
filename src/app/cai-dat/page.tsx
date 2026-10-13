'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { useProgress } from '@/components/providers/ProgressProvider';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function CaiDatPage() {
  const { theme, setTheme } = useTheme();
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
    setStatusMsg({ text: 'Đã lưu mục tiêu hàng ngày!', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    setStatusMsg({ text: 'Đã thiết lập lại toàn bộ tiến độ về trạng thái ban đầu.', type: 'info' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Export to file
  const handleExportFile = () => {
    try {
      const { filename, sizeKb } = exportToFile();
      setStatusMsg({
        text: `Đã xuất tệp thành công: ${filename} (${sizeKb} KB). Hãy lưu trữ cẩn thận!`,
        type: 'success',
      });
    } catch {
      setStatusMsg({ text: 'Có lỗi xảy ra khi tạo tệp xuất dữ liệu.', type: 'error' });
    }
  };

  // Import from file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg({ text: 'Đang kiểm tra và nhập dữ liệu từ tệp...', type: 'info' });
    const res = await importFromFile(file);
    if (res.success) {
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

  // Save to cloud online
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

  // Load from cloud online
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

  // Copy sync code
  const handleCopyCode = () => {
    if (typeof window !== 'undefined' && codeInputValue) {
      navigator.clipboard.writeText(codeInputValue.toUpperCase());
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-extrabold text-foreground">Cài đặt & Dữ liệu</h1>
        <Link
          href="/ho-so"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors"
        >
          ← Xem Hồ sơ học tập
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Quản lý hiển thị, lưu trữ tiến độ ra tệp tin và đồng bộ trực tuyến trên đám mây.
      </p>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center justify-between animate-fade-in ${
            statusMsg.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : statusMsg.type === 'error'
              ? 'bg-error/10 border-error/30 text-error'
              : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {statusMsg.type === 'success' ? '✅' : statusMsg.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* NEW SECTION: Lưu file & Đồng bộ Online */}
        <section className="bg-card rounded-2xl border border-primary/30 p-6 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>💾</span>
                <span>Lưu Trữ Tệp & Đồng Bộ Trực Tuyến</span>
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

          {/* Phần 1: Lưu File Offline */}
          <div className="space-y-3 bg-background/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>📁</span>
                <span>Lưu ra Tệp Tin (File Backup)</span>
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                Định dạng .JSON
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tải toàn bộ tiến độ (từ vựng, kanji, ngữ pháp, flashcard, điểm thi) về máy của bạn để lưu giữ an toàn.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleExportFile}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span>
                <span>Tải tệp tiến độ về máy (.json)</span>
              </button>

              <button
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

          {/* Phần 2: Đồng bộ Online Đám Mây */}
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

            {/* Sync Code Input Box */}
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

        {/* Theme */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-bold text-base text-foreground">Giao diện (Theme)</h2>
          <div className="flex flex-wrap gap-3">
            {([
              { value: 'light', label: '☀️ Sáng', desc: 'Giao diện nền sáng trang nhã' },
              { value: 'dark', label: '🌙 Tối', desc: 'Giao diện nền tối dịu mắt' },
              { value: 'system', label: '💻 Hệ thống', desc: 'Tự động theo thiết bị' },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
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
          <h2 className="font-bold text-base text-foreground">Mục tiêu hàng ngày</h2>
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

        {/* Audio */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-3">
          <h2 className="font-bold text-base text-foreground">Âm thanh & Phát âm</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hệ thống sử dụng Web Speech API của trình duyệt với giọng chuẩn `ja-JP` để phát âm từng từ và câu ví dụ tiếng Nhật.
          </p>
          <div className="p-3 bg-secondary/50 rounded-xl border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">💡 Lưu ý quan trọng:</p>
            <p>• Trình duyệt Chrome và Microsoft Edge cung cấp giọng đọc tiếng Nhật tự nhiên và rõ ràng nhất.</p>
            <p>• Đây là giọng đọc hỗ trợ học tập, pitch accent và ngữ điệu có thể khác biệt đôi chút so với người bản ngữ trong đời sống.</p>
          </div>
        </section>

        {/* Danger Zone: Reset Data */}
        <section className="bg-card rounded-2xl border border-error/20 p-6 space-y-4">
          <h2 className="font-bold text-base text-error">Xóa Dữ Liệu</h2>
          <p className="text-xs text-muted-foreground">
            Xóa bỏ toàn bộ lịch sử học tập, số từ vựng đã nhớ và kết quả thi thử trên trình duyệt này.
          </p>

          {!showResetConfirm ? (
            <button
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
                  onClick={handleReset}
                  className="px-4 py-2 bg-error text-white rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Xác nhận xóa
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section className="bg-card rounded-2xl border border-border p-6 space-y-2 text-xs text-muted-foreground">
          <h2 className="font-bold text-sm text-foreground mb-2">Về NihongoMaster</h2>
          <p>• Phiên bản: 1.0.0 (Mã nguồn mở)</p>
          <p>• Kho mã nguồn chính thức: <a href="https://github.com/Giangha20/Tiengnhat" target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono">Giangha20/Tiengnhat</a></p>
          <p>• Dữ liệu đối chiếu: Minna no Nihongo, Genki, JLPT Sensei, Tae Kim Japanese Grammar.</p>
        </section>
      </div>
    </div>
  );
}
