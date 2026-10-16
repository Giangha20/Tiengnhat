import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

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
    const { name, email, password } = body;

    const result = await registerUser(name, email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400, headers: corsHeaders }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        token: result.token,
        message: 'Tạo tài khoản thành công!',
      },
      { headers: corsHeaders }
    );

    // Set session cookie
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
    console.error('Lỗi API /api/auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi máy chủ khi đăng ký tài khoản.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
