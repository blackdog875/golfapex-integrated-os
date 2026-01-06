
import React from 'react';
import { Tournament } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const tournaments: Tournament[] = [
    { id: '1', title: 'Statewide Charity Open', tier: 'CHARITY', date: 'Sept 15, 2024', course: 'Pine Valley', participants: 450, status: 'upcoming' },
    { id: '2', title: 'Local Skins Challenge', tier: 'LOCAL', date: 'Today', course: 'Emerald Links', participants: 4, status: 'ongoing' },
    { id: '3', title: 'National Apex Series', tier: 'AMATEUR', date: 'Oct 01, 2024', course: '85 Courses Nationwide', participants: 15000, status: 'upcoming' },
  ];

  return (
    <div className="space-y-6">
      {/* National Event Banner */}
      <div className="relative overflow-hidden bg-emerald-600 rounded-[2rem] p-8 shadow-2xl shadow-emerald-900/40 group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <i className="fa-solid fa-earth-americas text-emerald-200"></i>
              <span className="text-xs font-black text-emerald-100 uppercase tracking-[0.3em]">Live Global Series</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">The National Apex</h2>
            <p className="text-emerald-100 mt-2 text-sm font-medium">15,000+ Players • 85 Courses • $1.5M Charity Pool</p>
          </div>
          <div className="flex gap-4">
            <Link to="/tournament-setup" className="bg-emerald-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl">
              Host Event
            </Link>
            <Link to="/tournaments" className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl">
              Join Field
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet / FinTech Card */}
        <div className="apex-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
          <div>
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-xs font-black tracking-widest uppercase">Apex Escrow Bank</p>
              <i className="fa-solid fa-shield-halved text-emerald-500"></i>
            </div>
            <h2 className="text-4xl font-black mt-3 text-white tracking-tighter">$2,450.00</h2>
            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Transactional Security Enabled</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Link to="/wallet" className="flex-1 bg-white/5 text-center text-white border border-white/10 py-3 rounded-xl font-bold hover:bg-white/10 transition-all text-sm">Escrow</Link>
            <Link to="/wallet" className="flex-1 bg-emerald-600 text-center py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all text-sm">Deposit</Link>
          </div>
        </div>

        {/* Tournament Management */}
        <div className="col-span-1 md:col-span-2 apex-card p-6 rounded-3xl border border-white/10 bg-gray-900/50">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold tracking-tight">Your Active Tier List</h2>
             <Link to="/tournaments" className="text-emerald-400 text-xs font-black uppercase tracking-widest cursor-pointer hover:underline">View All Tiers</Link>
          </div>
          <div className="space-y-3">
            {tournaments.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl hover:bg-white/10 transition-all border border-white/5 hover:border-emerald-500/30">
                <div className="flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    t.tier === 'CHARITY' ? 'bg-blue-500/20 text-blue-400' :
                    t.tier === 'AMATEUR' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <i className={`fa-solid ${t.tier === 'CHARITY' ? 'fa-hand-holding-heart' : t.tier === 'AMATEUR' ? 'fa-medal' : 'fa-users'}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-100">{t.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{t.course} • {t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white">{t.participants.toLocaleString()} Field</span>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'ongoing' ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                    <span className="text-[9px] uppercase font-black text-gray-500">{t.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid with Prominent HIO and Camera Icons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Skins Game', icon: 'fa-money-bill-transfer', color: 'bg-emerald-600', path: '/wallet' },
          { label: 'Hole-In-One', icon: 'fa-bullseye', color: 'bg-yellow-600', path: '/on-course' },
          { label: 'Apex Camera', icon: 'fa-camera-retro', color: 'bg-red-600', path: '/on-course?camera=true' },
          { label: 'Setup Event', icon: 'fa-calendar-plus', color: 'bg-purple-600', path: '/tournament-setup' },
          { label: 'Hats & Merch', icon: 'fa-hat-wizard', color: 'bg-orange-600', path: '/merch' },
        ].map((feat, i) => (
          <Link 
            key={i} 
            to={feat.path}
            className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gray-900 border border-white/5 hover:border-emerald-500/20 transition-all gap-3 group relative overflow-hidden"
          >
            <div className={`w-12 h-12 ${feat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
              <i className={`fa-solid ${feat.icon} text-xl text-white`}></i>
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white relative z-10">{feat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
