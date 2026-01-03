// app/api/tournaments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const tournaments = await sql`
    SELECT * FROM tournaments ORDER BY start_date DESC
  `;
  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const { name, penalty_win_points, penalty_loss_points } = await req.json();
  
  const result = await sql`
    INSERT INTO tournaments (name, penalty_win_points, penalty_loss_points)
    VALUES (${name}, ${penalty_win_points || 2}, ${penalty_loss_points || 1})
    RETURNING *
  `;
  
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const { id, name, status } = await req.json();
  
  await sql`
    UPDATE tournaments SET name = ${name}, status = ${status}
    WHERE id = ${id}
  `;
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM tournaments WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}