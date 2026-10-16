import { NextResponse } from 'next/server';
import { removeSession } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

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

    const response = NextResponse.json(
      {
        success: true,
        message: 'Đã đăng xuất thành công.',
      },
      { headers: corsHeaders }
    );

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
    return NextResponse.json({ success: false, error: 'Lỗi đăng xuất.' }, { status: 500, headers: corsHeaders });
  }
}
