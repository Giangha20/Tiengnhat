'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/providers/ProgressProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { JAPAN_AVATARS, DEFAULT_AVATAR } from '@/lib/avatars';
import type { JLPTLevel } from '@/types';

export default function HoSoPage() {
  const { progress, updateProgress, isLoaded } = useProgress();
  const { user, isAuthenticated, logout, syncWithAccount, updateAvatar } = useAuth();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(progress.dailyGoal);
  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded || !mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
        Đang tải hồ sơ học tập...
      </div>
    );
  }

  const currentAvatar = user?.avatar || progress.avatar || DEFAULT_AVATAR;
  const currentAvatarObj = JAPAN_AVATARS.find((a) => a.src === currentAvatar) || JAPAN_AVATARS[0];

  const handleSelectAvatar = async (avatarSrc: string) => {
    setIsUpdatingAvatar(true);
    const chosen = JAPAN_AVATARS.find((a) => a.src === avatarSrc) || JAPAN_AVATARS[0];
    try {
      // 1. Cập nhật tiến độ local
      updateProgress({ avatar: avatarSrc });

      // 2. Cập nhật tài khoản server nếu đã đăng nhập
      if (isAuthenticated) {
        await updateAvatar(avatarSrc);
        await syncWithAccount({ ...progress, avatar: avatarSrc });
      }

      setAvatarNotice(`✓ Đã đổi ảnh đại diện sang "${chosen.name}" thành công!`);
      setShowAvatarModal(false);
    } catch (err) {
      console.error('Lỗi cập nhật ảnh đại diện:', err);
    } finally {
      setIsUpdatingAvatar(false);
      setTimeout(() => setAvatarNotice(null), 3500);
    }
  };

  const handleSaveGoal = () => {
    updateProgress({ dailyGoal: Math.max(1, Math.min(100, goalInput)) });
    setEditingGoal(false);
  };

  const handleLevelChange = (lvl: JLPTLevel) => {
    updateProgress({ currentLevel: lvl });
  };

  const handleSyncAccount = async () => {
    setSyncStatus('Đang đồng bộ...');
    const res = await syncWithAccount(progress);
    if (res.success) {
      setSyncStatus('✓ Đã đồng bộ lên tài khoản máy chủ thành công!');
    } else {
      setSyncStatus('❌ Không thể đồng bộ: ' + (res.message || 'Lỗi'));
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Hồ sơ học tập</span>
      </nav>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar Container with Edit Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-primary/10 border-2 border-primary/30 p-1 shadow-md shadow-primary/10 transition-transform group-hover:scale-105">
              <img
                src={currentAvatar}
                alt={currentAvatarObj.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-card border border-border shadow-md text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center gap-1 cursor-pointer"
              title="Đổi ảnh đại diện phong cách Nhật Bản"
              type="button"
            >
              <span>✏️</span>
              <span className="text-[11px]">Đổi avatar</span>
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 justify-center sm:justify-start">
                  <span>{isAuthenticated && user ? user.name : 'Học Viên Tiếng Nhật'}</span>
                  <span className="text-base" title={currentAvatarObj.nameJa}>
                    {currentAvatarObj.emoji}
                  </span>
                </h1>
                <p className="text-xs text-primary font-medium mt-0.5">
                  Biểu tượng: {currentAvatarObj.name} ({currentAvatarObj.nameJa})
                </p>
              </div>
              {isAuthenticated && user ? (
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 self-center sm:self-auto">
                  ☁️ Đã kết nối tài khoản đám mây
                </span>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground font-semibold self-center sm:self-auto">
                  Thiết bị này
                </span>
              )}
            </div>

            {isAuthenticated && user && (
              <p className="text-xs font-mono text-muted-foreground">
                Email: {user.email} • Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Mục tiêu học tập hiện tại: <strong>JLPT {progress.currentLevel}</strong>
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleSyncAccount}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    <span>🔄</span>
                    <span>Đồng bộ tiến độ lên máy chủ</span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-error/30 bg-error/10 text-error text-xs font-bold hover:bg-error/20 transition-all cursor-pointer"
                  >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/dang-ky"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-xs"
                  >
                    <span>🚀 Tạo tài khoản đồng bộ nhiều máy</span>
                  </Link>
                  <Link
                    href="/dang-nhap"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-bold transition-all"
                  >
                    <span>🔑 Đăng nhập</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => setShowAvatarModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-bold transition-colors cursor-pointer"
              >
                <span>🎨 Chọn avatar Nhật Bản</span>
              </button>

              <Link
                href="/cai-dat"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              >
                <span>⚙️ Cài đặt & Tệp tin</span>
              </Link>
            </div>

            {avatarNotice && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1 animate-fade-in">{avatarNotice}</p>
            )}

            {syncStatus && (
              <p className="text-xs font-semibold text-primary pt-1 animate-fade-in">{syncStatus}</p>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>🌸</span>
              <span>Bộ Sưu Tập Avatar Học Viên Đậm Chất Nhật Bản</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chọn linh vật hoặc biểu tượng yêu thích của bạn để đồng hành suốt chặng đường học tiếng Nhật.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold w-fit">
            12 Avatar Tuyển Chọn
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {JAPAN_AVATARS.map((avatar) => {
            const isSelected = currentAvatar === avatar.src;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleSelectAvatar(avatar.src)}
                disabled={isUpdatingAvatar}
                className={`group relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30'
                    : 'border-border bg-background/50 hover:bg-secondary/60 hover:border-primary/40'
                }`}
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-primary/5 p-1 border border-border/80 group-hover:scale-105 transition-transform">
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold text-foreground truncate">{avatar.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{avatar.nameJa}</p>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-2xs">
                    ✓ Đang dùng
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Avatar Modal Popup */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>🎨</span>
                  <span>Chọn Ảnh Đại Diện Nhật Bản</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bấm vào một biểu tượng bên dưới để đổi ảnh đại diện
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-border text-foreground flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {JAPAN_AVATARS.map((avatar) => {
                const isSelected = currentAvatar === avatar.src;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar.src)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30'
                        : 'border-border bg-background hover:bg-secondary hover:border-primary/40'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/5 p-1 border border-border/80">
                      <img
                        src={avatar.src}
                        alt={avatar.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{avatar.name}</p>
                      <p className="text-[10px] text-muted-foreground">{avatar.nameJa}</p>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        ✓ Đang dùng
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-border transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Learning Target */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-sm text-foreground">Mục tiêu cấp độ JLPT</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    progress.currentLevel === lvl
                      ? 'bg-primary text-primary-foreground border-primary shadow'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hiện tại hệ thống đã hoàn thiện đầy đủ nội dung Nhập môn và N5. Các cấp độ từ N4 đến N1 đang được biên soạn.
            </p>
          </div>

          {/* Daily Goal */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-foreground">Mục tiêu hằng ngày</h2>
              {!editingGoal && (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Thay đổi
                </button>
              )}
            </div>

            {editingGoal ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={goalInput}
                    onChange={(e) => setGoalInput(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm text-center"
                  />
                  <span className="text-xs text-muted-foreground">mục/ngày</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGoal}
                    className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingGoal(false)}
                    className="px-3 py-1 bg-secondary text-foreground text-xs font-semibold rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {progress.dailyGoal} <span className="text-xs font-normal text-muted-foreground">từ & cấu trúc/ngày</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Đã hoàn thành hôm nay: <strong>{progress.todayItemsLearned + progress.todayItemsReviewed}</strong> / {progress.dailyGoal}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Statistics & Achievements */}
        <div className="md:col-span-2 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-card border border-border rounded-2xl text-center">
              <span className="text-2xl">🔥</span>
              <p className="text-2xl font-bold text-foreground mt-1">{progress.currentStreak}</p>
              <p className="text-[11px] text-muted-foreground">Chuỗi ngày (Streak)</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-2xl text-center">
              <span className="text-2xl">📚</span>
              <p className="text-2xl font-bold text-foreground mt-1">{progress.totalWordsLearned}</p>
              <p className="text-[11px] text-muted-foreground">Từ vựng đã học</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-2xl text-center">
              <span className="text-2xl">漢</span>
              <p className="text-2xl font-bold text-foreground mt-1">{progress.totalKanjiLearned}</p>
              <p className="text-[11px] text-muted-foreground">Chữ Hán Kanji</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-2xl text-center">
              <span className="text-2xl">📝</span>
              <p className="text-2xl font-bold text-foreground mt-1">{progress.totalGrammarLearned}</p>
              <p className="text-[11px] text-muted-foreground">Ngữ pháp đã học</p>
            </div>
          </div>

          {/* Test & Exercise History */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-base text-foreground flex items-center justify-between">
              <span>Lịch sử luyện tập & thi thử</span>
              <span className="text-xs text-muted-foreground font-normal">
                {progress.exerciseResults.length} lượt hoàn thành
              </span>
            </h2>

            {progress.exerciseResults.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Chưa có kết quả bài tập hay thi thử nào được ghi nhận. Hãy vào mục Bài tập hoặc Luyện thi để bắt đầu kiểm tra kiến thức!
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {progress.exerciseResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 bg-background rounded-xl border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{res.exerciseId.split('_')[0].toUpperCase()}</span>
                      <p className="text-muted-foreground text-[10px]">
                        {new Date(res.completedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary text-sm">
                        {res.score} / {res.totalQuestions}
                      </span>
                      <span className="text-muted-foreground block text-[10px]">
                        {Math.round((res.score / res.totalQuestions) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
