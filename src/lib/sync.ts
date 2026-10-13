import type { UserProgress } from '@/types';

export interface BackupData {
  version: string;
  exportedAt: string;
  source: string;
  data: UserProgress;
}

// Generate an easy-to-read sync code: NHG-XXXX-XXXX
export function generateRandomSyncCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NHG-${part1}-${part2}`;
}

// Validate if parsed JSON has correct UserProgress fields
export function validateProgressData(data: unknown): data is UserProgress {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.totalWordsLearned === 'number' &&
    typeof d.totalKanjiLearned === 'number' &&
    typeof d.totalGrammarLearned === 'number' &&
    typeof d.currentLevel === 'string' &&
    Array.isArray(d.reviewQueue)
  );
}

// 1. Export UserProgress to a downloadable JSON file
export function exportProgressToFile(progress: UserProgress): { filename: string; sizeKb: number } {
  const backup: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    source: 'NihongoMaster - Học Tiếng Nhật Toàn Diện',
    data: progress,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `nihongo-master-tien-do-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    filename,
    sizeKb: Math.round((jsonString.length / 1024) * 10) / 10,
  };
}

// 2. Import UserProgress from an uploaded JSON file
export async function importProgressFromFile(
  file: File
): Promise<{ success: boolean; data?: UserProgress; error?: string }> {
  return new Promise((resolve) => {
    if (!file.name.endsWith('.json')) {
      resolve({
        success: false,
        error: 'Tệp tin không đúng định dạng. Vui lòng chọn tệp có đuôi .json.',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Check if file is our wrapper format (BackupData) or direct UserProgress
        let targetData: unknown = parsed;
        if (parsed && typeof parsed === 'object' && 'data' in parsed) {
          targetData = (parsed as BackupData).data;
        }

        if (validateProgressData(targetData)) {
          resolve({
            success: true,
            data: targetData,
          });
        } else {
          resolve({
            success: false,
            error: 'Nội dung tệp JSON không hợp lệ hoặc thiếu các trường thông tin học tập cần thiết.',
          });
        }
      } catch (err) {
        resolve({
          success: false,
          error: `Không thể đọc tệp tin: ${err instanceof Error ? err.message : 'Dữ liệu hỏng'}.`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Đã xảy ra lỗi khi đọc tệp tin từ thiết bị của bạn.',
      });
    };

    reader.readAsText(file);
  });
}

// 3. Save progress online to serverless endpoint /api/sync
export async function saveProgressOnline(
  syncCode: string,
  progress: UserProgress
): Promise<{ success: boolean; message: string; updatedAt?: string }> {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      message: 'Thiết bị hiện đang mất kết nối Internet. Vui lòng kiểm tra lại mạng trước khi sao lưu trực tuyến.',
    };
  }

  const cleanCode = syncCode.trim().toUpperCase();
  if (cleanCode.length < 4) {
    return {
      success: false,
      message: 'Mã đồng bộ phải có tối thiểu 4 ký tự.',
    };
  }

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        syncCode: cleanCode,
        progress,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || 'Máy chủ không phản hồi thành công.',
      };
    }

    return {
      success: true,
      message: 'Đã lưu tiến độ học tập lên đám mây thành công!',
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    return {
      success: false,
      message: `Lỗi kết nối máy chủ: ${error instanceof Error ? error.message : 'Không thể kết nối API'}`,
    };
  }
}

// 4. Load progress online from serverless endpoint /api/sync
export async function loadProgressOnline(
  syncCode: string
): Promise<{ success: boolean; data?: UserProgress; error?: string; updatedAt?: string }> {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      error: 'Thiết bị hiện đang mất kết nối Internet. Vui lòng kiểm tra mạng.',
    };
  }

  const cleanCode = syncCode.trim().toUpperCase();
  if (!cleanCode) {
    return {
      success: false,
      error: 'Vui lòng nhập mã đồng bộ.',
    };
  }

  try {
    const res = await fetch(`/api/sync?code=${encodeURIComponent(cleanCode)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Không tìm thấy dữ liệu sao lưu tương ứng trên đám mây.',
      };
    }

    if (validateProgressData(data.progress)) {
      return {
        success: true,
        data: data.progress,
        updatedAt: data.updatedAt,
      };
    }

    return {
      success: false,
      error: 'Dữ liệu nhận từ máy chủ không đúng định dạng chuẩn.',
    };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Không thể tải từ máy chủ'}`,
    };
  }
}
