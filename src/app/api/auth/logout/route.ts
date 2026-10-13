import { NextResponse } from 'next/server';
import { removeSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/nihongo_session=([^;]+)/);
    let token = match ? match[1] : null;

    if (!token) {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      await removeSession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Đã đăng xuất thành công.',
    });

    response.cookies.set('nihongo_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Lỗi API /api/auth/logout:', error);
    return NextResponse.json({ success: false, error: 'Lỗi đăng xuất.' }, { status: 500 });
  }
}
