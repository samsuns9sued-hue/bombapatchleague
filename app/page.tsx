// app/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [curiosidades, setCuriosidades] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/stats?type=curiosidades').then(r => r.json())
    ]).then(([rankData, curData]) => {
      setRanking(rankData.ranking || []);
      setCuriosidades(curData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">🏆 Ranking Geral</h1>
      
      {/* Tabela de Ranking */}
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
              <th className="py-3 text-center">GP</th>
              <th className="py-3 text-center">GC</th>
              <th className="py-3 text-center">SG</th>
              <th className="py-3 text-center">%</th>
              <th className="py-3 text-center font-bold text-green-400">PTS</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p, i) => {
              const aprov = p.games > 0 
                ? ((p.points / (p.games * 3)) * 100).toFixed(0) 
                : 0;
              return (
                <tr key={p.id} className="table-row border-b border-gray-700/50">
                  <td className="py-3 font-bold text-gray-400">{i + 1}</td>
                  <td className="py-3">
                    <span className="font-semibold">{p.nickname || p.name}</span>
                    {p.nickname && <span className="text-gray-500 text-sm ml-2">({p.name})</span>}
                  </td>
                  <td className="py-3 text-center">{p.games}</td>
                  <td className="py-3 text-center text-green-400">{p.wins}</td>
                  <td className="py-3 text-center text-yellow-400">{p.draws}</td>
                  <td className="py-3 text-center text-red-400">{p.losses}</td>
                  <td className="py-3 text-center">{p.goalsFor}</td>
                  <td className="py-3 text-center">{p.goalsAgainst}</td>
                  <td className="py-3 text-center">{p.goalsFor - p.goalsAgainst}</td>
                  <td className="py-3 text-center">{aprov}%</td>
                  <td className="py-3 text-center font-bold text-xl text-green-400">{p.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {ranking.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma partida registrada ainda</p>
        )}
      </div>

      {/* Curiosidades */}
      {curiosidades && (
        <div>
          <h2 className="text-2xl font-bold mb-4">🏅 Hall da Fama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curiosidades.artilheiro && (
              <div className="card text-center">
                <div className="text-3xl mb-2">⚽</div>
                <div className="text-gray-400 text-sm">O Artilheiro</div>
                <div className="text-xl font-bold text-green-400">
                  {curiosidades.artilheiro.nickname || curiosidades.artilheiro.name}
                </div>
                <div className="text-gray-400">{curiosidades.artilheiro.goalsFor} gols</div>
              </div>
            )}
            
            {curiosidades.paredao && (
              <div className="card text-center">
                <div className="text-3xl mb-2">🧱</div>
                <div className="text-gray-400 text-sm">O Paredão</div>
                <div className="text-xl font-bold text-blue-400">
                  {curiosidades.paredao.nickname || curiosidades.paredao.name}
                </div>
                <div className="text-gray-400">
                  {(curiosidades.paredao.goalsAgainst / curiosidades.paredao.games).toFixed(1)} gols/jogo
                </div>
              </div>
            )}
            
            {curiosidades.sacoPancada && curiosidades.sacoPancada.losses > 0 && (
              <div className="card text-center">
                <div className="text-3xl mb-2">😢</div>
                <div className="text-gray-400 text-sm">Saco de Pancada</div>
                <div className="text-xl font-bold text-red-400">
                  {curiosidades.sacoPancada.nickname || curiosidades.sacoPancada.name}
                </div>
                <div className="text-gray-400">{curiosidades.sacoPancada.losses} derrotas</div>
              </div>
            )}
            
            {curiosidades.goleada && (
              <div className="card text-center">
                <div className="text-3xl mb-2">💥</div>
                <div className="text-gray-400 text-sm">Maior Goleada</div>
                <div className="text-xl font-bold text-yellow-400">
                  {curiosidades.goleada.score_home} x {curiosidades.goleada.score_away}
                </div>
                <div className="text-gray-400">
                  {curiosidades.goleada.home_name} vs {curiosidades.goleada.away_name}
                </div>
              </div>
            )}
            
            {curiosidades.reiPenaltis && (
              <div className="card text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-gray-400 text-sm">Rei dos Pênaltis</div>
                <div className="text-xl font-bold text-purple-400">
                  {curiosidades.reiPenaltis.nickname || curiosidades.reiPenaltis.name}
                </div>
                <div className="text-gray-400">
                  {curiosidades.reiPenaltis.penaltyWins}/{curiosidades.reiPenaltis.penaltyGames} disputas
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}