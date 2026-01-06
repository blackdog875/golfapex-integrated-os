
import React, { useState } from 'react';
import { Tournament, TeeTime, Participant, LeaderboardEntry } from '../types';
import { collectTournamentFee, initiateStripeCheckout, FEES } from '../services/paymentService';

const CHARITY_PARTNERS = [
  { name: "Wounded Warrior Project", focus: "Veteran Support", impact: "High" },
  { name: "St. Jude Children's Research Hospital", focus: "Childhood Cancer", impact: "High" },
  { name: "First Tee", focus: "Youth Development", impact: "Direct Golf" },
  { name: "Red Cross", focus: "Disaster Relief", impact: "Global" },
  { name: "Make-A-Wish Foundation", focus: "Wish Granting", impact: "Personal" },
  { name: "Boys & Girls Clubs of America", focus: "Youth Mentorship", impact: "Local" },
  { name: "Special Olympics", focus: "Inclusive Sports", impact: "High" },
  { name: "Feeding America", focus: "Hunger Relief", impact: "High" },
  { name: "WWF", focus: "Conservation", impact: "Global" },
  { name: "Water.org", focus: "Clean Water", impact: "Direct" },
  { name: "Habitat for Humanity", focus: "Housing", impact: "Local" },
  { name: "Direct Relief", focus: "Medical Aid", impact: "Emergency" },
  { name: "Save the Children", focus: "Child Welfare", impact: "Global" },
  { name: "Doctors Without Borders", focus: "Global Health", impact: "High" },
  { name: "Environmental Defense Fund", focus: "Climate Action", impact: "Critical" },
  { name: "Mercy Ships", focus: "Floating Hospitals", impact: "Global Medical" },
].sort((a, b) => a.name.localeCompare(b.name));

const Tournaments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SHEET' | 'LEADERBOARD' | 'CHARITY'>('SHEET');
  const [showCrowdfund, setShowCrowdfund] = useState(false);
  const [crowdfundAmount, setCrowdfundAmount] = useState('');
  const [crowdfundCause, setCrowdfundCause] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>({
    id: 't1',
    title: 'National Apex: Charity Series',
    tier: 'CHARITY',
    date: 'September 12, 2024',
    course: '85 Participating Courses',
    participants: 15000,
    status: 'ongoing',
    teeSheet: [
      { id: 'tt1', time: '08:00 AM', players: [{ id: 'p1', name: 'Tiger W.', handicap: 0, status: 'PAID' }], maxPlayers: 4, fee: 200 },
      { id: 'tt2', time: '08:10 AM', players: [], maxPlayers: 4, fee: 200 },
      { id: 'tt3', time: '08:20 AM', players: [], maxPlayers: 4, fee: 200 },
    ]
  });

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Scottie S.', score: -8, course: 'Pinehurst', thru: 18 },
    { rank: 2, name: 'Xander S.', score: -7, course: 'Emerald Links', thru: 14 },
    { rank: 3, name: 'John Doe', score: -5, course: 'Pelican Hill', thru: 12 },
    { rank: 4, name: 'Rory M.', score: -4, course: 'Pinehurst', thru: 18 },
    { rank: 5, name: 'Collin M.', score: -3, course: 'Bandon Dunes', thru: 9 },
  ];

  const handleJoin = async (teeTimeId: string) => {
    if (!selectedTournament) return;
    const tt = selectedTournament.teeSheet?.find(t => t.id === teeTimeId);
    if (!tt) return;
    
    setIsProcessing(teeTimeId);
    
    try {
      // 1. Initiate secure checkout via Stripe
      const stripeRes = await initiateStripeCheckout(tt.fee, `Tournament Entry: ${selectedTournament.title}`);
      
      // Simulate delay for secure processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (stripeRes.success) {
        // 2. Process internal Apex fee and update record
        const res = await collectTournamentFee(selectedTournament.id, 'user_current', tt.fee);
        
        if (res.status === 'PAID') {
          alert(`Success! Your entry is secured.\n\nTransaction: ${res.transactionId}\nTotal: $${res.totalCharged.toFixed(2)}\n(Includes 3% Apex Platform Fee: $${res.apexFee.toFixed(2)})`);
        }
      }
    } catch (err) {
      alert("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const grossRevenue = 15000 * 200; 
  const setupFee = grossRevenue * FEES.TOURNY_SETUP;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">National Live Series</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Global Tournament OS</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-md">The world's largest synchronized amateur tournament series. Real-time scoring and escrow pooling.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
           <div className="bg-gray-900 border border-white/5 p-5 rounded-[2rem] min-w-[160px] shadow-xl">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Gross Entry Pot</p>
              <p className="text-2xl font-black text-white">${grossRevenue.toLocaleString()}</p>
           </div>
           <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] min-w-[160px] shadow-xl">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Organizer Setup Fee (10%)</p>
              <p className="text-2xl font-black text-emerald-400">${setupFee.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-900/50 p-2 rounded-2xl w-fit border border-white/5">
         <button onClick={() => setActiveTab('SHEET')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'SHEET' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Tee Sheet</button>
         <button onClick={() => setActiveTab('LEADERBOARD')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'LEADERBOARD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Global Field</button>
         <button onClick={() => setActiveTab('CHARITY')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CHARITY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Charity Partners</button>
      </div>

      <div className="apex-card border border-white/5 rounded-[40px] overflow-hidden shadow-2xl bg-gray-900/40 min-h-[400px]">
        {activeTab === 'SHEET' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Tee Time</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Field Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Join Securely</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectedTournament?.teeSheet?.map((tt) => (
                  <tr key={tt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6 font-mono text-2xl font-black text-emerald-500 tracking-tighter">{tt.time}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {tt.players.map((p, i) => (
                          <div key={i} className="bg-gray-900 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold">
                            {p.name} <span className="text-emerald-500">({p.handicap})</span>
                          </div>
                        ))}
                        {tt.players.length < tt.maxPlayers && <span className="text-xs text-gray-600 italic mt-2">Open Slot Available</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => handleJoin(tt.id)} 
                          disabled={isProcessing === tt.id}
                          className="group relative bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                          {isProcessing === tt.id ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> Processing</>
                          ) : (
                            <><i className="fa-brands fa-stripe text-xl opacity-60 group-hover:opacity-100"></i> Pay Entry</>
                          )}
                        </button>
                        <p className="text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] flex items-center gap-1">
                          <i className="fa-solid fa-shield-halved text-emerald-500"></i> SECURE VIA APEXBANK
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'LEADERBOARD' && (
          <div className="p-8">
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-3xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black italic text-gray-600 group-hover:text-emerald-500 transition-colors">#{entry.rank}</span>
                    <div>
                      <h4 className="font-bold text-gray-100">{entry.name}</h4>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.course} • Thru {entry.thru}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black italic ${entry.score < 0 ? 'text-emerald-500' : 'text-white'}`}>
                      {entry.score === 0 ? 'E' : entry.score > 0 ? `+${entry.score}` : entry.score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CHARITY' && (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHARITY_PARTNERS.map((charity, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <i className="fa-solid fa-hand-holding-heart text-xl"></i>
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-full">{charity.impact} Impact</span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{charity.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{charity.focus}</p>
                  <button className="w-full mt-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400 hover:bg-emerald-600 hover:text-white transition-all">Support Now</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Crowdfund Section for Locals */}
      <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8">
            <i className="fa-solid fa-people-group text-indigo-400 text-7xl opacity-10 group-hover:scale-110 transition-transform duration-700"></i>
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Local Crowdfund (Beta)</span>
              <span className="bg-emerald-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Powered by ApexBank</span>
            </div>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">Fund Your Local Champion</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">Add a dedicated fundraiser to your friends' trip or local club tournament. All donations are pooled into a secure Apex Escrow until the tournament director triggers the payout.</p>
            
            {!showCrowdfund ? (
              <button 
                onClick={() => setShowCrowdfund(true)} 
                className="bg-white text-indigo-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-400 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                Launch Campaign
              </button>
            ) : (
              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Recipient / Cause</p>
                     <input 
                       type="text" 
                       value={crowdfundCause}
                       onChange={(e) => setCrowdfundCause(e.target.value)}
                       placeholder="e.g. Junior Golf Club" 
                       className="bg-transparent border-none text-xl font-black text-white focus:outline-none w-full placeholder:text-gray-700"
                     />
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Campaign Goal ($)</p>
                     <input 
                       type="number" 
                       value={crowdfundAmount}
                       onChange={(e) => setCrowdfundAmount(e.target.value)}
                       placeholder="e.g. 10000" 
                       className="bg-transparent border-none text-xl font-black text-white focus:outline-none w-full placeholder:text-gray-700"
                     />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowCrowdfund(false)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex-1 hover:bg-indigo-500 transition-colors">Start Crowdfund</button>
                  <button onClick={() => setShowCrowdfund(false)} className="bg-white/5 text-gray-400 border border-white/10 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">Cancel</button>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Tournaments;
