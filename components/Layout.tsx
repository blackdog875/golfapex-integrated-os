
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AREA_CODES = {
  California: ["209", "213", "310", "323", "408", "415", "424", "442", "510", "530", "559", "562", "619", "626", "650", "657", "661", "669", "707", "714", "747", "760", "805", "818", "831", "858", "909", "916", "925", "949", "951"],
  Arizona: ["480", "520", "602", "623", "928"],
  Florida: ["239", "305", "321", "352", "386", "407", "561", "727", "754", "772", "786", "813", "850", "863", "904", "941", "954"],
  Oregon: ["503", "541", "971"]
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  
  const navItems = [
    { path: '/', icon: 'fa-home', label: 'Home' },
    { path: '/on-course', icon: 'fa-golf-ball-tee', label: 'Play' },
    { path: '/on-course?camera=true', icon: 'fa-camera', label: 'Camera' },
    { path: 'https://youtube.com', icon: 'fa-brands fa-youtube', label: 'Social', external: true },
    { path: '/tournaments', icon: 'fa-trophy', label: 'Events' },
    { path: '/wallet', icon: 'fa-wallet', label: 'Wallet' },
    { path: '/merch', icon: 'fa-shopping-bag', label: 'Merch' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 pb-24 md:pb-0 md:pl-20">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tighter text-emerald-500">
            GOLF<span className="text-white">APEX</span>
          </h1>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <i className="fa-solid fa-bell text-gray-400"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold">JD</div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:w-20 md:h-screen bg-gray-900 border-t md:border-t-0 md:border-r border-gray-800 z-50 px-2 py-4">
        <div className="flex md:flex-col justify-around md:justify-start items-center h-full gap-8">
          <div className="hidden md:block mb-8">
             <i className="fa-solid fa-mountain-sun text-emerald-500 text-2xl"></i>
          </div>
          {navItems.map((item) => (
            item.external ? (
              <a 
                key={item.label}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-gray-500 hover:text-red-500"
              >
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
              </a>
            ) : (
              <Link 
                key={item.label} 
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  location.pathname + location.search === item.path ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-500 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </nav>

      <footer className="bg-gray-900 border-t border-gray-800 p-8 mt-auto hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div>
            <h3 className="text-lg font-bold mb-4 text-emerald-500">GolfAPEX Franchise</h3>
            <p className="text-sm text-gray-400 mb-4">Own your county's golf future. Exclusive rights for League Directors and State Commissioners available.</p>
            <button 
              onClick={() => setShowFranchiseModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Purchase Area Code
            </button>
          </div>
          <div className="flex flex-col gap-2">
             <h3 className="font-bold text-gray-300">Quick Links</h3>
             <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors">Course Integration B2B</a>
             <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors">Tournament Setup</a>
             <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors">Charity Partnerships</a>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-600">© 2024 GolfAPEX OS. All Rights Reserved.</p>
             <div className="flex gap-4 justify-end mt-4">
               <i className="fa-brands fa-instagram text-gray-600 hover:text-white"></i>
               <i className="fa-brands fa-youtube text-gray-600 hover:text-red-500"></i>
               <i className="fa-brands fa-twitter text-gray-600 hover:text-white"></i>
               <i className="fa-brands fa-facebook text-gray-600 hover:text-white"></i>
             </div>
          </div>
        </div>
      </footer>

      {/* Area Code Selection Modal */}
      {showFranchiseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-emerald-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div>
                <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">Franchise Opportunities</h2>
                <p className="text-sm text-gray-400">Select an Area Code to purchase exclusive Director rights.</p>
              </div>
              <button onClick={() => setShowFranchiseModal(false)} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-500 transition-all">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {Object.entries(AREA_CODES).map(([state, codes]) => (
                <div key={state}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    {state}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {codes.map(code => (
                      <button 
                        key={code}
                        className="bg-gray-800 hover:bg-emerald-600 hover:text-white transition-all p-3 rounded-xl border border-white/5 font-mono font-bold text-sm shadow-sm"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-emerald-500/10 border-t border-emerald-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                <p><span className="text-emerald-400 font-bold">Price per Area:</span> $25,000 USD / Year</p>
                <p>Includes full operational stack and CRM integration.</p>
              </div>
              <button className="w-full sm:w-auto bg-emerald-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                Contact Licensing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
