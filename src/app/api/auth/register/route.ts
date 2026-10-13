import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const result = await registerUser(name, email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Tạo tài khoản thành công!',
    });

    // Set secure HTTP-only cookie
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
    console.error('Lỗi API /api/auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi máy chủ khi đăng ký tài khoản.' },
      { status: 500 }
    );
  }
}
