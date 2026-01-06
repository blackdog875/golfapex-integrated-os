
import React, { useState } from 'react';
import { initiateStripeCheckout } from '../services/paymentService';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'ENTRY_FEE' | 'BET_WON' | 'BET_LOST' | 'INSURANCE';
  amount: number;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'ESCROW';
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(2450.00);
  const [escrowBalance, setEscrowBalance] = useState(120.00);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');

  const transactions: Transaction[] = [
    { id: 'tx1', type: 'BET_WON', amount: 40.00, description: 'Skins Game: Hole 14 - Pelican Hill', date: 'Today, 2:15 PM', status: 'COMPLETED' },
    { id: 'tx2', type: 'INSURANCE', amount: -26.25, description: 'HIO Insurance: Hole 3 (Elite)', date: 'Today, 10:45 AM', status: 'COMPLETED' },
    { id: 'tx3', type: 'ENTRY_FEE', amount: -206.00, description: 'National Apex Series Entry', date: 'Yesterday', status: 'COMPLETED' },
    { id: 'tx4', type: 'DEPOSIT', amount: 1000.00, description: 'Stripe Top-up: **** 4242', date: 'Sept 10, 2024', status: 'COMPLETED' },
    { id: 'tx5', type: 'BET_LOST', amount: -20.00, description: 'Private Bet: Longest Drive (Hole 9)', date: 'Sept 09, 2024', status: 'COMPLETED' },
  ];

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount)) return;
    
    const res = await initiateStripeCheckout(amount, "ApexBank Wallet Top-up");
    if (res.success) {
      alert(`Stripe Checkout simulated for $${amount}. Your balance will update once processed.`);
      setShowDepositModal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Wallet Card */}
        <div className="flex-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <i className="fa-solid fa-building-columns text-8xl"></i>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-black text-emerald-100 uppercase tracking-[0.3em] mb-4">Apex Integrated Bank</p>
              <h2 className="text-6xl font-black text-white italic tracking-tighter mb-2">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              <div className="flex items-center gap-2 text-emerald-200/80 text-sm font-medium">
                <i className="fa-solid fa-shield-check"></i>
                <span>Verified Escrow Holder • Level 4 Security</span>
              </div>
              
              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowDepositModal(true)}
                  className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-100 transition-all shadow-xl active:scale-95"
                >
                  <i className="fa-solid fa-plus mr-2"></i> Deposit
                </button>
                <button className="bg-emerald-500/20 text-white border border-emerald-400/30 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500/40 transition-all active:scale-95">
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Money Games / Active Bets */}
          <div className="bg-gray-900 border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold italic uppercase tracking-tight">Active Money Games</h3>
              <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Escrow: ${escrowBalance.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <i className="fa-solid fa-handshake"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Pelican Hill Skins</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black">4 Players • $20/Hole</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white">Live Tracking</span>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">Hole 14: $40 Up</p>
                </div>
              </div>
              
              <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition-all">
                <i className="fa-solid fa-plus-circle mr-2"></i> Create New Private Bet
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Transaction History */}
        <div className="w-full lg:w-96 space-y-6">
           <div className="bg-gray-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Ledger History</h3>
             <div className="space-y-6 flex-1">
               {transactions.map((tx) => (
                 <div key={tx.id} className="flex justify-between items-start">
                   <div className="flex gap-4">
                     <div className={`mt-1 w-2 h-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                     <div>
                       <p className="text-xs font-bold text-gray-100">{tx.description}</p>
                       <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{tx.date}</p>
                     </div>
                   </div>
                   <p className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-gray-300'}`}>
                     {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                   </p>
                 </div>
               ))}
             </div>
             <button className="mt-8 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">Download Annual Statement</button>
           </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-emerald-500/30 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 text-center bg-emerald-500/10 border-b border-emerald-500/20">
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Secure Deposit</h3>
                 <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Instant Settlement via Stripe</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Amount (USD)</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-black text-gray-600">$</span>
                    <input 
                      type="number" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-transparent text-5xl font-black text-white w-40 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {['100', '500', '1000'].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      className={`py-3 rounded-xl border font-black text-xs transition-all ${depositAmount === amt ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-white/5 text-gray-400'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleDeposit}
                  className="w-full py-5 bg-emerald-600 rounded-2xl font-black uppercase text-white shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                >
                  <i className="fa-brands fa-stripe text-2xl"></i> Proceed to Checkout
                </button>
              </div>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="w-full py-6 text-gray-600 text-[10px] font-black uppercase border-t border-white/5 hover:text-white transition-colors"
              >
                Cancel Transaction
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
