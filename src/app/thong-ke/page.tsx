'use client';

import { useProgress } from '@/components/providers/ProgressProvider';
import type { LearningStatus } from '@/types';

export default function ThongKePage() {
  const { progress, isLoaded } = useProgress();

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  const hasData = progress.totalWordsLearned > 0 || progress.todayItemsLearned > 0;

  const statusCounts = progress.reviewQueue.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<LearningStatus, number>
  );

  const statusLabels: Record<LearningStatus, string> = {
    new: 'Mới',
    learning: 'Đang học',
    reviewing: 'Đang ôn',
    mastered: 'Đã thuộc',
  };

  const statusColors: Record<LearningStatus, string> = {
    new: 'bg-info/10 text-info',
    learning: 'bg-warning/10 text-warning',
    reviewing: 'bg-indigo-jp/10 text-indigo-jp',
    mastered: 'bg-success/10 text-success',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl font-bold text-foreground">Thống kê học tập</h1>
      <p className="mt-2 text-muted-foreground">
        Theo dõi tiến độ học tiếng Nhật của bạn
      </p>

      {!hasData ? (
        <div className="mt-8 text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-4xl mb-4">📊</p>
          <h2 className="text-xl font-semibold text-foreground">Chưa có dữ liệu</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Bắt đầu học để xem thống kê của bạn. Tiến độ được lưu trên thiết bị này.
          </p>
          <a
            href="/nhap-mon/hiragana"
            className="mt-4 inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Bắt đầu học Hiragana
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            ⚠️ Dữ liệu lưu bằng localStorage. Xóa dữ liệu trình duyệt sẽ mất tiến độ.
          </p>
        </div>
      ) : (
        <>
          {/* Today's Summary */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Đã học hôm nay" value={progress.todayItemsLearned} icon="📚" />
            <StatCard label="Đã ôn hôm nay" value={progress.todayItemsReviewed} icon="🔄" />
            <StatCard
              label="Tỷ lệ đúng"
              value={`${progress.todayCorrectRate}%`}
              icon="✅"
            />
            <StatCard label="Chuỗi ngày" value={progress.currentStreak} icon="🔥" />
          </div>

          {/* Overall Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">Tổng quan</h3>
              <div className="space-y-3">
                <StatRow label="Từ vựng đã học" value={progress.totalWordsLearned} />
                <StatRow label="Kanji đã học" value={progress.totalKanjiLearned} />
                <StatRow label="Ngữ pháp đã học" value={progress.totalGrammarLearned} />
                <StatRow label="Hiragana" value={`${progress.hiraganaProgress}%`} />
                <StatRow label="Katakana" value={`${progress.katakanaProgress}%`} />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">Trạng thái từ vựng</h3>
              <div className="space-y-2">
                {(Object.keys(statusLabels) as LearningStatus[]).map((status) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`text-sm px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                      {statusLabels[status]}
                    </span>
                    <span className="font-medium text-foreground">
                      {statusCounts[status] || 0}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng cộng</span>
                  <span className="font-bold text-foreground">{progress.reviewQueue.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">Mục tiêu</h3>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">
                  {progress.todayItemsLearned + progress.todayItemsReviewed}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  / {progress.dailyGoal} mục tiêu hôm nay
                </p>
                <div className="mt-3 progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        ((progress.todayItemsLearned + progress.todayItemsReviewed) /
                          progress.dailyGoal) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Cấp độ hiện tại: {progress.currentLevel}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-muted-foreground text-center">
            ⚠️ Thống kê dựa trên dữ liệu lưu cục bộ (localStorage) trên thiết bị này.
            Dữ liệu không được đồng bộ giữa các thiết bị.
            Xóa dữ liệu trình duyệt sẽ mất toàn bộ tiến độ.
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
