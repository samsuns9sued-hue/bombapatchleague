// app/confronto/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function Confronto() {
  const [players, setPlayers] = useState<any[]>([]);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [h2h, setH2h] = useState<any>(null);

  useEffect(() => {
    fetch('/api/players').then(r => r.json()).then(setPlayers);
  }, []);

  const loadH2H = async () => {
    if (!player1 || !player2 || player1 === player2) return;
    const res = await fetch(`/api/stats?type=h2h&player1=${player1}&player2=${player2}`);
    setH2h(await res.json());
  };

  const getPlayer = (id: string) => players.find(p => p.id == id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⚔️ Confronto Direto</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Jogador 1</label>
          <select className="input" value={player1} onChange={e => setPlayer1(e.target.value)}>
            <option value="">Selecione...</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.nickname || p.name}</option>
            ))}
          </select>
        </div>
        
        <div className="text-center text-3xl font-bold text-gray-500">VS</div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Jogador 2</label>
          <select className="input" value={player2} onChange={e => setPlayer2(e.target.value)}>
            <option value="">Selecione...</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.nickname || p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={loadH2H} className="btn btn-primary">
        Comparar
      </button>

      {h2h && (
        <div className="space-y-6">
          <div className="card">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-bold text-green-400">{h2h.p1Wins}</div>
                <div className="text-gray-400">{getPlayer(player1)?.nickname || getPlayer(player1)?.name}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">{h2h.draws}</div>
                <div className="text-gray-400">Empates</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400">{h2h.p2Wins}</div>
                <div className="text-gray-400">{getPlayer(player2)?.nickname || getPlayer(player2)?.name}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-2 text-center">
              <div>
                <div className="text-2xl font-bold">{h2h.total}</div>
                <div className="text-gray-400">Jogos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{h2h.avgGoals}</div>
                <div className="text-gray-400">Média Gols/Jogo</div>
              </div>
            </div>
          </div>

          {h2h.matches.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">📋 Histórico</h3>
              <div className="space-y-2">
                {h2h.matches.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className={m.winner_id == player1 ? 'text-green-400 font-bold' : ''}>
                      {getPlayer(String(m.player_home_id))?.nickname || getPlayer(String(m.player_home_id))?.name}
                    </span>
                    <span className="text-xl font-bold mx-4">
                      {m.score_home} x {m.score_away}
                      {m.penalties_home !== null && (
                        <span className="text-sm text-gray-400 ml-1">
                          ({m.penalties_home}-{m.penalties_away})
                        </span>
                      )}
                    </span>
                    <span className={m.winner_id == player2 ? 'text-green-400 font-bold' : ''}>
                      {getPlayer(String(m.player_away_id))?.nickname || getPlayer(String(m.player_away_id))?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}