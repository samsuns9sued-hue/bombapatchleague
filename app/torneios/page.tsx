// app/torneios/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function Torneios() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tournaments').then(r => r.json()).then(setTournaments);
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`/api/stats?tournament_id=${selected}`)
        .then(r => r.json())
        .then(data => setRanking(data.ranking || []));
    }
  }, [selected]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🏆 Torneios</h1>
      
      <select
        className="input max-w-md"
        value={selected}
        onChange={e => setSelected(e.target.value)}
      >
        <option value="">Selecione um torneio...</option>
        {tournaments.map(t => (
          <option key={t.id} value={t.id}>
            {t.name} {t.status === 'finalizado' ? '✓' : ''}
          </option>
        ))}
      </select>

      {selected && ranking.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600 text-gray-400 text-sm">
                <th className="py-3 text-left">#</th>
                <th className="py-3 text-left">Jogador</th>
                <th className="py-3 text-center">J</th>
                <th className="py-3 text-center">V</th>
                <th className="py-3 text-center">E</th>
                <th className="py-3 text-center">D</th>
                <th className="py-3 text-center">SG</th>
                <th className="py-3 text-center font-bold text-green-400">PTS</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((p, i) => (
                <tr key={p.id} className="table-row border-b border-gray-700/50">
                  <td className="py-3 font-bold">{i + 1}</td>
                  <td className="py-3 font-semibold">{p.nickname || p.name}</td>
                  <td className="py-3 text-center">{p.games}</td>
                  <td className="py-3 text-center text-green-400">{p.wins}</td>
                  <td className="py-3 text-center text-yellow-400">{p.draws}</td>
                  <td className="py-3 text-center text-red-400">{p.losses}</td>
                  <td className="py-3 text-center">{p.goalsFor - p.goalsAgainst}</td>
                  <td className="py-3 text-center font-bold text-xl text-green-400">{p.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && ranking.length === 0 && (
        <p className="text-gray-400">Nenhuma partida registrada neste torneio.</p>
      )}
    </div>
  );
}