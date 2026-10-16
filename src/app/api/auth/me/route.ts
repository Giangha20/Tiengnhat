import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    // Read token from cookie or Authorization header
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/nihongo_session=([^;]+)/);
    let token = match ? match[1] : null;

    if (!token) {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200, headers: corsHeaders });
    }

    const user = await getUserFromSession(token);

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Lỗi API /api/auth/me:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500, headers: corsHeaders });
  }
}
