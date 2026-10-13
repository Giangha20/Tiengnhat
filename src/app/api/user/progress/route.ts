import { NextResponse } from 'next/server';
import { getUserFromSession, saveAccountProgress, getAccountProgress } from '@/lib/auth';

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

// GET: Lấy tiến độ từ tài khoản người dùng
export async function GET(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Phiên làm việc đã hết hạn.' }, { status: 401 });
    }

    const data = await getAccountProgress(user.id);
    return NextResponse.json({
      success: true,
      user,
      progress: data ? data.progress : null,
      updatedAt: data ? data.updatedAt : null,
    });
  } catch (error) {
    console.error('Lỗi API GET /api/user/progress:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải tiến độ tài khoản.' }, { status: 500 });
  }
}

// POST: Cập nhật tiến độ tài khoản người dùng
export async function POST(request: Request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const user = await getUserFromSession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Phiên làm việc đã hết hạn.' }, { status: 401 });
    }

    const body = await request.json();
    const { progress } = body;

    if (!progress || typeof progress !== 'object') {
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    await saveAccountProgress(user.id, progress);

    return NextResponse.json({
      success: true,
      message: 'Đã đồng bộ tiến độ vào tài khoản máy chủ thành công!',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lỗi API POST /api/user/progress:', error);
    return NextResponse.json({ success: false, error: 'Lỗi lưu tiến độ tài khoản.' }, { status: 500 });
  }
}
