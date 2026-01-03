// app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [tab, setTab] = useState('partidas');
  
  // Forms
  const [newPlayer, setNewPlayer] = useState({ name: '', nickname: '' });
  const [newTournament, setNewTournament] = useState({ name: '', penalty_win_points: 2 });
  const [newMatch, setNewMatch] = useState({
    tournament_id: '',
    player_home_id: '',
    player_away_id: '',
    score_home: 0,
    score_away: 0,
    penalties_home: null as number | null,
    penalties_away: null as number | null,
    hasPenalties: false
  });

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    const [p, t, m] = await Promise.all([
      fetch('/api/players').then(r => r.json()),
      fetch('/api/tournaments').then(r => r.json()),
      fetch('/api/matches').then(r => r.json())
    ]);
    setPlayers(p);
    setTournaments(t);
    setMatches(m);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) setIsAdmin(true);
    else alert('Senha incorreta!');
  };

  const addPlayer = async () => {
    if (!newPlayer.name) return;
    await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer)
    });
    setNewPlayer({ name: '', nickname: '' });
    loadData();
  };

  const deletePlayer = async (id: number) => {
    if (!confirm('Excluir jogador?')) return;
    const res = await fetch('/api/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
    }
    loadData();
  };

  const addTournament = async () => {
    if (!newTournament.name) return;
    await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTournament)
    });
    setNewTournament({ name: '', penalty_win_points: 2 });
    loadData();
  };

  const addMatch = async () => {
    if (!newMatch.player_home_id || !newMatch.player_away_id) return;
    if (newMatch.player_home_id === newMatch.player_away_id) {
      alert('Selecione jogadores diferentes!');
      return;
    }
    
    await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newMatch,
        tournament_id: newMatch.tournament_id || null,
        penalties_home: newMatch.hasPenalties ? newMatch.penalties_home : null,
        penalties_away: newMatch.hasPenalties ? newMatch.penalties_away : null
      })
    });
    
    setNewMatch({
      tournament_id: '',
      player_home_id: '',
      player_away_id: '',
      score_home: 0,
      score_away: 0,
      penalties_home: null,
      penalties_away: null,
      hasPenalties: false
    });
    loadData();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">🔐 Área Administrativa</h2>
          <input
            type="password"
            placeholder="Digite a senha"
            className="input mb-4"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="btn btn-primary w-full">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">⚙️ Painel Administrativo</h1>
        <button onClick={() => setIsAdmin(false)} className="btn btn-secondary">
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['partidas', 'jogadores', 'torneios'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Registrar Partida */}
      {tab === 'partidas' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🎮 Registrar Partida</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <select
                className="input"
                value={newMatch.tournament_id}
                onChange={e => setNewMatch({...newMatch, tournament_id: e.target.value})}
              >
                <option value="">Amistoso</option>
                {tournaments.filter(t => t.status === 'ativo').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Jogador Casa</label>
              <select
                className="input"
                value={newMatch.player_home_id}
                onChange={e => setNewMatch({...newMatch, player_home_id: e.target.value})}
              >
                <option value="">Selecione...</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.nickname || p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Jogador Fora</label>
              <select
                className="input"
                value={newMatch.player_away_id}
                onChange={e => setNewMatch({...newMatch, player_away_id: e.target.value})}
              >
                <option value="">Selecione...</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.nickname || p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gols Casa</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newMatch.score_home}
                onChange={e => setNewMatch({...newMatch, score_home: +e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gols Fora</label>
              <input
                type="number"
                min="0"
                className="input"
                value={newMatch.score_away}
                onChange={e => setNewMatch({...newMatch, score_away: +e.target.value})}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={newMatch.hasPenalties}
              onChange={e => setNewMatch({...newMatch, hasPenalties: e.target.checked})}
              className="w-5 h-5"
            />
            <span>Houve disputa de pênaltis?</span>
          </label>

          {newMatch.hasPenalties && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pênaltis Casa</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={newMatch.penalties_home || ''}
                  onChange={e => setNewMatch({...newMatch, penalties_home: +e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pênaltis Fora</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={newMatch.penalties_away || ''}
                  onChange={e => setNewMatch({...newMatch, penalties_away: +e.target.value})}
                />
              </div>
            </div>
          )}

          <button onClick={addMatch} className="btn btn-primary">
            Registrar Partida
          </button>

          {/* Lista de Partidas */}
          <h4 className="text-lg font-bold mt-8 mb-4">📋 Últimas Partidas</h4>
          <div className="space-y-2">
            {matches.slice(0, 10).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <span className="font-semibold">{m.home_nickname || m.home_name}</span>
                  <span className="mx-2 text-xl font-bold">
                    {m.score_home} x {m.score_away}
                  </span>
                  <span className="font-semibold">{m.away_nickname || m.away_name}</span>
                  {m.penalties_home !== null && (
                    <span className="text-sm text-gray-400 ml-2">
                      (Pên: {m.penalties_home}-{m.penalties_away})
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {m.tournament_id ? '🏆' : '⚽'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gerenciar Jogadores */}
      {tab === 'jogadores' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">👥 Gerenciar Jogadores</h3>
          
          <div className="flex gap-2 mb-6">
            <input
              placeholder="Nome"
              className="input flex-1"
              value={newPlayer.name}
              onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
            />
            <input
              placeholder="Apelido (opcional)"
              className="input flex-1"
              value={newPlayer.nickname}
              onChange={e => setNewPlayer({...newPlayer, nickname: e.target.value})}
            />
            <button onClick={addPlayer} className="btn btn-primary">
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <span className="font-semibold">{p.name}</span>
                  {p.nickname && <span className="text-gray-400 ml-2">({p.nickname})</span>}
                </div>
                <button
                  onClick={() => deletePlayer(p.id)}
                  className="btn btn-danger text-sm"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gerenciar Torneios */}
      {tab === 'torneios' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🏆 Gerenciar Torneios</h3>
          
          <div className="flex gap-2 mb-6">
            <input
              placeholder="Nome do Torneio"
              className="input flex-1"
              value={newTournament.name}
              onChange={e => setNewTournament({...newTournament, name: e.target.value})}
            />
            <button onClick={addTournament} className="btn btn-primary">
              Criar
            </button>
          </div>

          <div className="space-y-2">
            {tournaments.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <span className="font-semibold">{t.name}</span>
                  <span className={`ml-2 text-sm ${t.status === 'ativo' ? 'text-green-400' : 'text-gray-400'}`}>
                    ({t.status})
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/tournaments', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        id: t.id, 
                        name: t.name,
                        status: t.status === 'ativo' ? 'finalizado' : 'ativo'
                      })
                    });
                    loadData();
                  }}
                  className="btn btn-secondary text-sm"
                >
                  {t.status === 'ativo' ? 'Finalizar' : 'Reativar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}