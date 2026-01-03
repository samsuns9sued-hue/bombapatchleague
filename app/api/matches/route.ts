// app/api/matches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get('tournament_id');
  
  let matches;
  if (tournamentId) {
    matches = await sql`
      SELECT m.*, 
        ph.name as home_name, ph.nickname as home_nickname,
        pa.name as away_name, pa.nickname as away_nickname
      FROM matches m
      JOIN players ph ON m.player_home_id = ph.id
      JOIN players pa ON m.player_away_id = pa.id
      WHERE m.tournament_id = ${tournamentId}
      ORDER BY m.date_played DESC
    `;
  } else {
    matches = await sql`
      SELECT m.*, 
        ph.name as home_name, ph.nickname as home_nickname,
        pa.name as away_name, pa.nickname as away_nickname
      FROM matches m
      JOIN players ph ON m.player_home_id = ph.id
      JOIN players pa ON m.player_away_id = pa.id
      ORDER BY m.date_played DESC
      LIMIT 50
    `;
  }
  
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { 
    tournament_id, player_home_id, player_away_id,
    score_home, score_away, penalties_home, penalties_away 
  } = data;
  
  // Calcula vencedor
  let winner_id = null;
  let win_method = 'draw';
  
  if (score_home > score_away) {
    winner_id = player_home_id;
    win_method = 'regular';
  } else if (score_away > score_home) {
    winner_id = player_away_id;
    win_method = 'regular';
  } else if (penalties_home !== null && penalties_away !== null) {
    win_method = 'penalties';
    if (penalties_home > penalties_away) {
      winner_id = player_home_id;
    } else if (penalties_away > penalties_home) {
      winner_id = player_away_id;
    }
  }
  
  const result = await sql`
    INSERT INTO matches 
    (tournament_id, player_home_id, player_away_id, score_home, score_away,
     penalties_home, penalties_away, winner_id, win_method)
    VALUES 
    (${tournament_id || null}, ${player_home_id}, ${player_away_id},
     ${score_home}, ${score_away}, ${penalties_home || null}, 
     ${penalties_away || null}, ${winner_id}, ${win_method})
    RETURNING *
  `;
  
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, score_home, score_away, penalties_home, penalties_away } = data;
  
  // Busca partida para recalcular
  const match = await sql`SELECT * FROM matches WHERE id = ${id}`;
  if (!match[0]) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  
  const { player_home_id, player_away_id } = match[0];
  
  // Recalcula vencedor
  let winner_id = null;
  let win_method = 'draw';
  
  if (score_home > score_away) {
    winner_id = player_home_id;
    win_method = 'regular';
  } else if (score_away > score_home) {
    winner_id = player_away_id;
    win_method = 'regular';
  } else if (penalties_home && penalties_away) {
    win_method = 'penalties';
    winner_id = penalties_home > penalties_away ? player_home_id : player_away_id;
  }
  
  await sql`
    UPDATE matches SET
      score_home = ${score_home}, score_away = ${score_away},
      penalties_home = ${penalties_home || null},
      penalties_away = ${penalties_away || null},
      winner_id = ${winner_id}, win_method = ${win_method}
    WHERE id = ${id}
  `;
  
  return NextResponse.json({ success: true });
}