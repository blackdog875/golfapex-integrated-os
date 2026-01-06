
import React, { useState, useEffect } from 'react';
import { MerchItem, CartItem } from '../types';

const Merch: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const items: MerchItem[] = [
    { id: 'h1', name: 'Apex Elite National Cap', price: 45, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400', category: 'hat', recognitionTag: 'National Series Participant' },
    { id: 'h2', name: 'Charity Open Commemorative', price: 55, image: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&q=80&w=400', category: 'hat', recognitionTag: 'Benefactor Status' },
    { id: 'm1', name: 'Hole-In-One Memory Plaque', price: 125, image: 'https://images.unsplash.com/photo-1614036417651-efe591214971?auto=format&fit=crop&q=80&w=400', category: 'memory' },
    { id: 'e1', name: 'Apex Pro Driver Cover', price: 35, image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400', category: 'equipment' },
  ];

  useEffect(() => {
    const initialQtys: Record<string, number> = {};
    items.forEach(item => initialQtys[item.id] = 1);
    setQuantities(initialQtys);
  }, []);

  const addToCart = (item: MerchItem) => {
    const qty = quantities[item.id] || 1;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...item, quantity: qty }];
    });
    alert(`Added ${qty} ${item.name} to cart.`);
  };

  return (
    <div className="space-y-12">
      {/* Hat of the Day Hero */}
      <div className="relative rounded-[3rem] overflow-hidden min-h-[500px] flex items-center bg-gray-950 border border-white/10 group shadow-2xl">
         <div className="absolute inset-0">
           <img src="https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]" alt="Featured Hat" />
           <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent"></div>
         </div>
         <div className="relative z-10 p-12 max-w-2xl">
           <div className="flex items-center gap-3 mb-6">
             <span className="bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30">Hats of the Day</span>
             <span className="text-white/60 text-xs font-bold uppercase tracking-widest border border-white/20 px-4 py-1.5 rounded-full">Limited Memory Edition</span>
           </div>
           <h2 className="text-6xl md:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-[0.8] text-white">The Apex Shield <span className="text-emerald-500">2024</span></h2>
           <p className="text-gray-400 text-lg mb-8 leading-relaxed font-medium">Built on the memories of the National Charity Series. Each hat carries your unique tournament recognition tag and official course sync status.</p>
           <button onClick={() => addToCart(items[0])} className="bg-white text-black px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-105 shadow-2xl">
             Reserve Yours - $45.00
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="group bg-gray-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden transition-all hover:border-emerald-500/30 shadow-xl">
            <div className="aspect-square relative overflow-hidden">
               <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={item.name} />
               {item.recognitionTag && (
                 <div className="absolute top-4 left-4">
                   <span className="bg-black/60 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                     <i className="fa-solid fa-award mr-1"></i> {item.recognitionTag}
                   </span>
                 </div>
               )}
            </div>
            <div className="p-6">
              <h4 className="font-black text-white italic uppercase tracking-tighter text-lg mb-1 group-hover:text-emerald-400 transition-colors">{item.name}</h4>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">{item.category}</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xl font-black text-white">${item.price}</p>
                <button onClick={() => addToCart(item)} className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all">Add To Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Merch;
