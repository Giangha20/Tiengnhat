import { NextResponse } from 'next/server';
import { getUserFromSession, updateUserAvatar } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

// POST: Cập nhật avatar của người dùng
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
    const { avatar } = body;

    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json({ success: false, error: 'Dữ liệu avatar không hợp lệ.' }, { status: 400, headers: corsHeaders });
    }

    const result = await updateUserAvatar(user.id, avatar);
    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error || 'Không thể cập nhật avatar.' }, { status: 400, headers: corsHeaders });
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Đã cập nhật ảnh đại diện thành công!',
        user: result.user,
      },
      { headers: corsHeaders }
    );

    // Cập nhật cookie nihongo_session với token mới
    if (result.token) {
      response.cookies.set('nihongo_session', result.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 ngày
      });
    }

    return response;
  } catch (error) {
    console.error('Lỗi API POST /api/user/avatar:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật ảnh đại diện.' }, { status: 500, headers: corsHeaders });
  }
}
