// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  
  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin', 'true', { 
      httpOnly: true, 
      maxAge: 60 * 60 * 24 
    });
    return response;
  }
  
  return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin');
  return response;
}