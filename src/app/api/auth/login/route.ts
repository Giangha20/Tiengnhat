import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401, headers: corsHeaders }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        token: result.token,
        message: 'Đăng nhập thành công!',
      },
      { headers: corsHeaders }
    );

    if (result.token) {
      response.cookies.set('nihongo_session', result.token, {
        httpOnly: false,
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
      { status: 500, headers: corsHeaders }
    );
  }
}
