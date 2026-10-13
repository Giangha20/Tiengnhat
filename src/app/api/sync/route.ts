import { NextResponse } from 'next/server';
import type { UserProgress } from '@/types';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface SyncRecord {
  syncCode: string;
  progress: UserProgress;
  updatedAt: string;
}

// Global in-memory store for fast access
declare global {
  var __syncStore: Map<string, SyncRecord> | undefined;
}

const syncStore = globalThis.__syncStore || new Map<string, SyncRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__syncStore = syncStore;
}

const getStorageFilePath = (code: string) => {
  const sanitized = code.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return path.join(os.tmpdir(), `nihongo_sync_${sanitized}.json`);
};

// Validate that an object has the essential structure of UserProgress
function isValidUserProgress(data: unknown): data is UserProgress {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.totalWordsLearned === 'number' &&
    typeof d.totalKanjiLearned === 'number' &&
    typeof d.totalGrammarLearned === 'number' &&
    Array.isArray(d.reviewQueue)
  );
}

// GET: Retrieve progress by syncCode
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã đồng bộ (code).' },
        { status: 400 }
      );
    }

    // Check in-memory store first
    let record = syncStore.get(code);

    // Check disk storage in tmp directory
    if (!record) {
      const filePath = getStorageFilePath(code);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          record = JSON.parse(content) as SyncRecord;
          syncStore.set(code, record);
        } catch (e) {
          console.error('Lỗi đọc file sync:', e);
        }
      }
    }

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: `Không tìm thấy dữ liệu sao lưu cho mã "${code}". Vui lòng kiểm tra lại mã hoặc thực hiện sao lưu trước.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      syncCode: record.syncCode,
      progress: record.progress,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    console.error('Lỗi API GET /api/sync:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi máy chủ khi tải dữ liệu sao lưu.' },
      { status: 500 }
    );
  }
}

// POST: Save progress online with syncCode
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { syncCode, progress } = body;

    const cleanCode = (syncCode as string)?.trim().toUpperCase();

    if (!cleanCode || cleanCode.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Mã đồng bộ phải có ít nhất 4 ký tự.' },
        { status: 400 }
      );
    }

    if (!isValidUserProgress(progress)) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu tiến độ học tập không đúng định dạng chuẩn.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const record: SyncRecord = {
      syncCode: cleanCode,
      progress,
      updatedAt: now,
    };

    // Save to memory
    syncStore.set(cleanCode, record);

    // Save to disk in tmp
    try {
      const filePath = getStorageFilePath(cleanCode);
      fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Cảnh báo ghi file tạm tmp:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu tiến độ học tập lên đám mây thành công!',
      syncCode: cleanCode,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Lỗi API POST /api/sync:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lưu tiến độ lên máy chủ.' },
      { status: 500 }
    );
  }
}
