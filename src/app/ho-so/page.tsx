'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/providers/ProgressProvider';
import type { JLPTLevel } from '@/types';

export default function HoSoPage() {
  const { progress, updateProgress, isLoaded } = useProgress();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(progress.dailyGoal);
  const [mounted, setMounted] = useState(false);

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

  const handleSaveGoal = () => {
    updateProgress({ dailyGoal: Math.max(1, Math.min(100, goalInput)) });
    setEditingGoal(false);
  };

  const handleLevelChange = (lvl: JLPTLevel) => {
    updateProgress({ currentLevel: lvl });
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
          {/* Avatar Icon */}
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-5xl flex-shrink-0">
            🌸
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Học Viên Tiếng Nhật
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-success/10 text-success font-semibold self-center sm:self-auto">
                Tài khoản cục bộ (Thiết bị này)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mục tiêu học tập hiện tại: <strong>JLPT {progress.currentLevel}</strong>
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Link
                href="/cai-dat"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <span>💾</span>
                <span>Sao lưu tệp & Đồng bộ Online</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
