import { NextResponse } from 'next/server';
import { getUserFromSession, saveAccountProgress, getAccountProgress } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function getToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/nihongo_session=([^;]+)/);
  if (match) return match[1];

  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// GET: Lấy tiến độ từ tài khoản người dùng trên máy chủ
export async function GET(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập.' }, { status: 401, headers: corsHeaders });
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Phiên làm việc đã hết hạn.' }, { status: 401, headers: corsHeaders });
    }

    const data = await getAccountProgress(user.id);
    return NextResponse.json(
      {
        success: true,
        user,
        progress: data ? data.progress : null,
        updatedAt: data ? data.updatedAt : null,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Lỗi API GET /api/user/progress:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải tiến độ tài khoản.' }, { status: 500, headers: corsHeaders });
  }
}

// POST: Cập nhật và lưu trữ tiến độ bài học lên máy chủ
export async function POST(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập.' }, { status: 401, headers: corsHeaders });
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Phiên làm việc đã hết hạn.' }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json().catch(() => ({}));
    const { progress } = body;

    if (!progress || typeof progress !== 'object') {
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400, headers: corsHeaders });
    }

    await saveAccountProgress(user.id, progress);

    return NextResponse.json(
      {
        success: true,
        message: 'Đã lưu tiến độ bài học lên máy chủ thành công!',
        updatedAt: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Lỗi API POST /api/user/progress:', error);
    return NextResponse.json({ success: false, error: 'Lỗi lưu tiến độ tài khoản.' }, { status: 500, headers: corsHeaders });
  }
}
