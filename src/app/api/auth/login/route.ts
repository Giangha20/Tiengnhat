import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Đăng nhập thành công!',
    });

    if (result.token) {
      response.cookies.set('nihongo_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Lỗi API /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi máy chủ khi đăng nhập.' },
      { status: 500 }
    );
  }
}
