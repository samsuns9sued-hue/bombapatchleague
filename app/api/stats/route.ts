// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const player1 = searchParams.get('player1');
  const player2 = searchParams.get('player2');
  const tournamentId = searchParams.get('tournament_id');
  
  // Head-to-Head
  if (type === 'h2h' && player1 && player2) {
    const matches = await sql`
      SELECT * FROM matches
      WHERE (player_home_id = ${player1} AND player_away_id = ${player2})
         OR (player_home_id = ${player2} AND player_away_id = ${player1})
      ORDER BY date_played DESC
    `;
    
    let p1Wins = 0, p2Wins = 0, draws = 0, totalGoals = 0;
    matches.forEach((m: any) => {
      totalGoals += m.score_home + m.score_away;
      if (m.winner_id == player1) p1Wins++;
      else if (m.winner_id == player2) p2Wins++;
      else draws++;
    });
    
    return NextResponse.json({
      matches,
      p1Wins, p2Wins, draws,
      total: matches.length,
      avgGoals: matches.length ? (totalGoals / matches.length).toFixed(1) : 0
    });
  }
  
  // Ranking/Tabela
  const players = await sql`SELECT * FROM players`;
  
  let matchesQuery = tournamentId 
    ? await sql`SELECT * FROM matches WHERE tournament_id = ${tournamentId}`
    : await sql`SELECT * FROM matches`;
  
  // Pega config de pontos do torneio
  let penWin = 2, penLoss = 1;
  if (tournamentId) {
    const t = await sql`SELECT * FROM tournaments WHERE id = ${tournamentId}`;
    if (t[0]) {
      penWin = t[0].penalty_win_points;
      penLoss = t[0].penalty_loss_points;
    }
  }
  
  // Calcula stats por jogador
  const stats: any = {};
  players.forEach((p: any) => {
    stats[p.id] = {
      id: p.id, name: p.name, nickname: p.nickname,
      games: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
      penaltyWins: 0, penaltyGames: 0
    };
  });
  
  matchesQuery.forEach((m: any) => {
    const home = stats[m.player_home_id];
    const away = stats[m.player_away_id];
    if (!home || !away) return;
    
    home.games++; away.games++;
    home.goalsFor += m.score_home;
    home.goalsAgainst += m.score_away;
    away.goalsFor += m.score_away;
    away.goalsAgainst += m.score_home;
    
    if (m.win_method === 'regular') {
      if (m.winner_id === m.player_home_id) {
        home.wins++; home.points += 3;
        away.losses++;
      } else {
        away.wins++; away.points += 3;
        home.losses++;
      }
    } else if (m.win_method === 'penalties') {
      home.penaltyGames++; away.penaltyGames++;
      if (m.winner_id === m.player_home_id) {
        home.wins++; home.points += penWin; home.penaltyWins++;
        away.losses++; away.points += penLoss;
      } else {
        away.wins++; away.points += penWin; away.penaltyWins++;
        home.losses++; home.points += penLoss;
      }
    } else {
      home.draws++; away.draws++;
      home.points++; away.points++;
    }
  });
  
  // Ordena por critérios de desempate
  const ranking = Object.values(stats)
    .filter((p: any) => p.games > 0)
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      const saldoA = a.goalsFor - a.goalsAgainst;
      const saldoB = b.goalsFor - b.goalsAgainst;
      if (saldoB !== saldoA) return saldoB - saldoA;
      return b.goalsFor - a.goalsFor;
    });
  
  // Curiosidades
  if (type === 'curiosidades') {
    const artilheiro = [...Object.values(stats)].sort((a: any, b: any) => b.goalsFor - a.goalsFor)[0];
    const paredao = [...Object.values(stats)]
      .filter((p: any) => p.games >= 3)
      .sort((a: any, b: any) => (a.goalsAgainst/a.games) - (b.goalsAgainst/b.games))[0];
    const sacoPancada = [...Object.values(stats)].sort((a: any, b: any) => b.losses - a.losses)[0];
    
    const goleada = await sql`
      SELECT m.*, ph.name as home_name, pa.name as away_name
      FROM matches m
      JOIN players ph ON m.player_home_id = ph.id
      JOIN players pa ON m.player_away_id = pa.id
      ORDER BY ABS(m.score_home - m.score_away) DESC
      LIMIT 1
    `;
    
    const reiPenaltis = [...Object.values(stats)]
      .filter((p: any) => p.penaltyGames >= 2)
      .sort((a: any, b: any) => (b.penaltyWins/b.penaltyGames) - (a.penaltyWins/a.penaltyGames))[0];
    
    return NextResponse.json({
      artilheiro, paredao, sacoPancada,
      goleada: goleada[0] || null,
      reiPenaltis
    });
  }
  
  return NextResponse.json({ ranking });
}