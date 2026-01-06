
import React, { useState, useEffect } from 'react';
import { Participant, TeeTime, Tournament } from '../types';
import { calculateTournamentSetup } from '../services/paymentService';

const TournamentSetup: React.FC = () => {
  const [tier, setTier] = useState<'LOCAL' | 'AMATEUR' | 'CHARITY'>('LOCAL');
  const [title, setTitle] = useState('Friday Skins Invitational');
  const [course, setCourse] = useState('Pelican Hill');
  const [startTime, setStartTime] = useState('08:00');
  const [interval, setIntervalMins] = useState(10);
  const [players, setPlayers] = useState<Participant[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [playerHandicap, setPlayerHandicap] = useState(10);
  const [teeSheet, setTeeSheet] = useState<TeeTime[]>([]);

  // Automatic handicap-seeded tee sheet logic
  useEffect(() => {
    generateTeeSheet();
  }, [players, tier, startTime, interval]);

  const generateTeeSheet = () => {
    if (players.length === 0) {
      setTeeSheet([]);
      return;
    }

    // Rule: Locals/Small groups always add lowest handicaps first out
    const sortedPlayers = [...players].sort((a, b) => a.handicap - b.handicap);
    const newTeeSheet: TeeTime[] = [];
    const maxPlayersPerGroup = 4;
    
    let currentTime = new Date(`2024-01-01T${startTime}:00`);

    for (let i = 0; i < sortedPlayers.length; i += maxPlayersPerGroup) {
      const groupPlayers = sortedPlayers.slice(i, i + maxPlayersPerGroup);
      const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      newTeeSheet.push({
        id: `tt-${i}`,
        time: timeString,
        players: groupPlayers,
        maxPlayers: maxPlayersPerGroup,
        fee: tier === 'LOCAL' ? 50 : 200
      });

      currentTime = new Date(currentTime.getTime() + interval * 60000);
    }

    setTeeSheet(newTeeSheet);
  };

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) return;
    
    const newPlayer: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      handicap: playerHandicap,
      status: 'PAID'
    };

    setPlayers([...players, newPlayer]);
    setPlayerName('');
    setPlayerHandicap(10);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const setupFee = calculateTournamentSetup(players.length * (tier === 'LOCAL' ? 50 : 200));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Event Architect</h2>
          <p className="text-gray-500 text-sm mt-1">Configure your field, set tee times, and automate handicap seeding.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] shadow-xl">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Apex Platform Setup Fee</p>
          <p className="text-2xl font-black text-white">${setupFee.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">1. Core Config</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tournament Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOCAL', 'AMATEUR', 'CHARITY'] as const).map(t => (
                    <button 
                      key={t}
                      onClick={() => setTier(t)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${tier === t ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Event Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">First Tee Off</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Interval (Mins)</label>
                  <input 
                    type="number" 
                    value={interval}
                    onChange={(e) => setIntervalMins(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">2. Quick Add Players</h3>
            <form onSubmit={addPlayer} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Player Full Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase mb-2">Handicap: {playerHandicap}</p>
                  <input 
                    type="range" 
                    min="0" 
                    max="36" 
                    value={playerHandicap}
                    onChange={(e) => setPlayerHandicap(parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <button type="submit" className="bg-white text-black w-12 h-12 rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {players.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">{p.name}</p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase">HCP: {p.handicap}</p>
                  </div>
                  <button onClick={() => removePlayer(p.id)} className="text-gray-700 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              ))}
              {players.length === 0 && <p className="text-[10px] text-gray-600 italic text-center py-4">No players seeded yet.</p>}
            </div>
          </div>
        </div>

        {/* Live Tee Sheet Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl min-h-full flex flex-col">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Live Tee Sheet</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                  {tier === 'LOCAL' ? 'Handicap Seeded • Lowest Off First' : 'Standard Field Assignment'}
                </p>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-900/40">
                Publish Event
              </button>
            </div>

            <div className="flex-1 p-8 space-y-6">
              {teeSheet.length > 0 ? teeSheet.map((tt, idx) => (
                <div key={tt.id} className="flex flex-col md:flex-row gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  {idx === 0 && <div className="absolute top-0 right-0 bg-emerald-500 text-black px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">First Off</div>}
                  <div className="md:w-32 flex flex-col justify-center items-center md:border-r border-white/5">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Time</p>
                    <p className="text-3xl font-black text-emerald-500 tracking-tighter italic">{tt.time}</p>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array.from({ length: tt.maxPlayers }).map((_, i) => {
                      const player = tt.players[i];
                      return (
                        <div key={i} className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${player ? 'bg-black/40 border-emerald-500/20' : 'bg-black/20 border-white/5 border-dashed'}`}>
                          {player ? (
                            <>
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">{player.name[0]}</div>
                              <p className="text-[9px] font-black text-white text-center px-2 truncate w-full">{player.name}</p>
                              <span className="text-[8px] font-black text-emerald-500 uppercase">HCP {player.handicap}</span>
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-user-plus text-gray-700 text-sm"></i>
                              <span className="text-[8px] font-black text-gray-700 uppercase">Empty</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <i className="fa-solid fa-golf-ball-tee text-6xl"></i>
                  <p className="font-black uppercase tracking-[0.2em] text-sm">Awaiting Player Data to Generate Sheet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSetup;
