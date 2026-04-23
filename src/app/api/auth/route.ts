import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}