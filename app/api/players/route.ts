// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const players = await sql`SELECT * FROM players ORDER BY name`;
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const { name, nickname, avatar_url } = await req.json();
  
  const result = await sql`
    INSERT INTO players (name, nickname, avatar_url)
    VALUES (${name}, ${nickname || null}, ${avatar_url || null})
    RETURNING *
  `;
  
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const { id, name, nickname } = await req.json();
  
  await sql`
    UPDATE players SET name = ${name}, nickname = ${nickname}
    WHERE id = ${id}
  `;
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  
  // Verifica se tem partidas
  const matches = await sql`
    SELECT id FROM matches 
    WHERE player_home_id = ${id} OR player_away_id = ${id}
    LIMIT 1
  `;
  
  if (matches.length > 0) {
    return NextResponse.json(
      { error: 'Jogador tem partidas registradas' }, 
      { status: 400 }
    );
  }
  
  await sql`DELETE FROM players WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}