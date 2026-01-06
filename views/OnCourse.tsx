
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCaddieAdvice, analyzeSwing, checkWeatherRisk } from '../services/geminiService';
import { purchaseInsurance, collectTournamentFee } from '../services/paymentService';
import { getCurrentLocation } from '../services/gpsDataService';
import { ScorecardHole } from '../types';

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface FBItem {
  id: string;
  name: string;
  price: number;
  category: 'drinks' | 'food' | 'snacks';
  description: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const FB_MENU: FBItem[] = [
  { id: 'fb1', name: 'The Birdie Burger', price: 16, category: 'food', description: 'Angus beef, cheddar, brioche bun, secret Apex sauce.' },
  { id: 'fb2', name: 'Transfusion', price: 12, category: 'drinks', description: 'Vodka, ginger ale, grape juice, lime. The classic.' },
  { id: 'fb3', name: 'Apex Club Sandwich', price: 14, category: 'food', description: 'Triple decker, roasted turkey, smoked bacon, aioli.' },
  { id: 'fb4', name: 'Pro Pack Trail Mix', price: 8, category: 'snacks', description: 'Protein heavy nuts, dark chocolate, dried cranberries.' },
  { id: 'fb5', name: 'Iced Gatorade', price: 5, category: 'drinks', description: 'Choice of flavor. Served ice cold.' },
];

const OnCourse: React.FC = () => {
  const location = useLocation();
  const [activeHole, setActiveHole] = useState(3);
  const [par, setPar] = useState(3);
  const [caddieTip, setCaddieTip] = useState("Tap 'Ask Caddie' or use Voice Command.");
  const [isLoadingCaddie, setIsLoadingCaddie] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Video Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [showFBMenu, setShowFBMenu] = useState(false);
  const [fbCart, setFbCart] = useState<{item: FBItem, qty: number}[]>([]);
  const [showHIOInsurance, setShowHIOInsurance] = useState(false);
  const [hioStatus, setHioStatus] = useState<'IDLE' | 'INSURED' | 'PENDING'>( 'IDLE');
  
  // Scoring state
  const [showScoring, setShowScoring] = useState(false);
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [autoSaveActive, setAutoSaveActive] = useState(false);
  const [tempScore, setTempScore] = useState<number>(3); // Quick Entry State
  const [scorecard, setScorecard] = useState<ScorecardHole[]>([
    { hole: 1, par: 4, score: 5, putts: 2 },
    { hole: 2, par: 4, score: 4, putts: 2 },
    { hole: 3, par: 3, score: null, putts: null },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'F&B Service', text: 'Welcome! Use the F&B icon to order to your cart.', time: '10:00 AM', isMe: false },
    { id: '2', sender: 'Pro Shop', text: 'Pace is looking good. Have a great round!', time: '10:15 AM', isMe: false }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('camera') === 'true') {
      requestCameraAccess();
    }
  }, [location.search]);

  useEffect(() => {
    const performWeatherCheck = async () => {
      try {
        const loc = await getCurrentLocation() as {lat: number, lng: number};
        const risk = await checkWeatherRisk(loc.lat, loc.lng);
        if (risk.includes("DANGER") || risk.includes("WARNING")) setWeatherAlert(risk);
        else setWeatherAlert(null);
      } catch (e) { console.warn("Weather check skipped"); }
    };
    performWeatherCheck();
    const interval = setInterval(performWeatherCheck, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';
      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      recog.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceQuery(transcript);
      };
      setRecognition(recog);
    }
  }, []);

  const handleVoiceQuery = async (query: string) => {
    setIsLoadingCaddie(true);
    const tip = await getCaddieAdvice(activeHole, par, 165, "Elevated green, bunker right", query);
    setCaddieTip(tip);
    setIsLoadingCaddie(false);
    const utterance = new SpeechSynthesisUtterance(tip);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => recognition && recognition.start();

  const handleInsurancePurchase = async (tier: 'BASIC' | 'ELITE') => {
    const res = await purchaseInsurance(activeHole.toString(), tier === 'BASIC' ? 10 : 25);
    if (res.success) { setHioStatus('INSURED'); setShowHIOInsurance(false); }
  };

  const handleScoreUpdate = (score: number) => {
    setScorecard(prev => prev.map(h => h.hole === activeHole ? { ...h, score } : h));
    setShowScoring(false);
    setIsEditingScore(false);
    
    // Auto-Save Implementation: Simulate server sync with local feedback
    setAutoSaveActive(true);
    setTimeout(() => setAutoSaveActive(false), 2000);
  };

  const currentHoleScore = scorecard.find(h => h.hole === activeHole)?.score;

  // Initialize temp score when modal opens
  useEffect(() => {
    if (showScoring) {
      setTempScore(currentHoleScore || par);
    }
  }, [showScoring, currentHoleScore, par]);

  const shareScore = () => {
    const total = scorecard.reduce((acc, h) => acc + (h.score || 0), 0);
    const text = `I'm playing at Pelican Hill on GolfAPEX OS! Just finished Hole ${activeHole}. Score: ${total}. Track my round: https://apex.golf/live/jdoe`;
    if (navigator.share) {
      navigator.share({ title: 'My GolfAPEX Round', text, url: window.location.href });
    } else {
      alert("Score shared to your linked SMS contacts!");
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      setShowCamera(true);
      setTimeout(() => { 
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) { setCameraError("Camera permission denied."); }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    setShowCamera(false);
    setIsRecording(false);
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const handleCaptureAndAnalyze = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setIsAnalyzing(true);
      const analysis = await analyzeSwing(canvasRef.current.toDataURL('image/jpeg').split(',')[1]);
      alert("Apex Analysis: " + analysis);
      setIsAnalyzing(false);
      stopCamera();
    }
  };

  const shareToYoutube = () => {
    alert("Redirecting to YouTube for memory upload...");
    window.open("https://youtube.com/upload", "_blank");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-24 relative">
      
      {/* Auto-Save Toast */}
      {autoSaveActive && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-black px-6 py-2 rounded-full font-black uppercase text-xs shadow-2xl animate-in slide-in-from-top duration-300 flex items-center gap-2">
          <i className="fa-solid fa-cloud-arrow-up"></i> Hole {activeHole} Score Saved
        </div>
      )}

      {weatherAlert && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border animate-bounce ${weatherAlert.includes("DANGER") ? 'bg-red-900/60 border-red-500 text-red-100' : 'bg-orange-900/60 border-orange-500 text-orange-100'}`}>
          <div className="flex items-center gap-3">
             <i className="fa-solid fa-triangle-exclamation text-xl"></i>
             <div><p className="font-black uppercase tracking-tighter text-sm">{weatherAlert}</p><p className="text-[10px] opacity-80">Safety protocol active.</p></div>
          </div>
          <button onClick={() => setWeatherAlert(null)}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="flex items-center justify-between bg-black rounded-3xl p-4 border border-emerald-500/40 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => { setShowScoring(true); setIsEditingScore(false); }} className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <i className="fa-solid fa-file-pen text-white"></i>
          </button>
          <div>
            <h2 className="text-xl font-bold">Pelican Hill <span className="text-emerald-500">• Hole {activeHole}</span></h2>
            <p className="text-xs text-gray-500 uppercase font-black">Par {par} | 165 YDS | HCP 18</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {par === 3 && (
            <button onClick={() => setShowHIOInsurance(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${hioStatus === 'INSURED' ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/30' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30 animate-pulse'}`}>
              {hioStatus === 'INSURED' ? <><i className="fa-solid fa-shield-check mr-2"></i>Insured</> : 'HIO Game'}
            </button>
          )}
          <div className="bg-emerald-500/10 px-4 py-2 rounded-xl text-center border border-emerald-500/20">
            <p className="text-[10px] font-black text-emerald-400 uppercase">Pace</p>
            <p className="text-xl font-black text-white tracking-tighter">+02:00</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-900 rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
             <img src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-50 grayscale contrast-125" alt="Hole" />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
             <div className="absolute top-4 left-4 z-10">
                <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
                  <p className="text-2xl font-black text-white">165<span className="text-xs ml-1 text-gray-500">YDS</span></p>
                </div>
             </div>
             <button onClick={requestCameraAccess} className="absolute bottom-4 right-4 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"><i className="fa-solid fa-camera text-xl"></i></button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start mb-4">
               <div><h3 className="font-bold text-emerald-400 flex items-center gap-2"><i className="fa-solid fa-robot"></i> APEX CADDIE</h3><p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Voice Strategic Advice</p></div>
               <div className="flex gap-2">
                 <button onClick={startListening} className={`p-3 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-emerald-500'}`}><i className="fa-solid fa-microphone"></i></button>
                 <button onClick={() => handleVoiceQuery("How should I play this hole?")} disabled={isLoadingCaddie} className="bg-emerald-500 p-3 rounded-full text-white"><i className={`fa-solid ${isLoadingCaddie ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i></button>
               </div>
            </div>
            <p className="text-sm italic text-gray-200 min-h-[60px]">"{caddieTip}"</p>
          </div>

          <div className="bg-gray-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[280px]">
             <div className="p-4 bg-gray-800/50 border-b border-white/5 flex justify-between"><h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Course Comms</h3></div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs ${m.isMe ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-200 border border-white/5'}`}>{m.text}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Scoring Modal with Quick Entry Feature */}
      {showScoring && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-emerald-500/30 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 text-center bg-emerald-500/10 border-b border-emerald-500/20">
                 <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Hole {activeHole} Scoring</p>
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                   {currentHoleScore !== null && !isEditingScore ? `Locked Score: ${currentHoleScore}` : 'Quick Score Entry'}
                 </h3>
              </div>
              
              <div className="p-8 space-y-8">
                {currentHoleScore !== null && !isEditingScore ? (
                  <div className="flex flex-col gap-6 items-center">
                    <div className="w-28 h-28 rounded-full bg-emerald-500 flex items-center justify-center text-5xl font-black text-black shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                      {currentHoleScore}
                    </div>
                    <button 
                      onClick={() => setIsEditingScore(true)}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit Score
                    </button>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Auto-Syncing with Pro Shop...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {/* Stepper Controls */}
                    <div className="flex items-center justify-between bg-black/40 p-2 rounded-[2rem] border border-white/5">
                      <button 
                        onClick={() => setTempScore(prev => Math.max(1, prev - 1))}
                        className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90"
                      >
                        <i className="fa-solid fa-minus text-xl"></i>
                      </button>
                      
                      <div className="text-center group">
                        <input 
                          type="number" 
                          value={tempScore}
                          onChange={(e) => setTempScore(parseInt(e.target.value) || 0)}
                          className="w-24 bg-transparent text-6xl font-black text-white text-center focus:outline-none focus:text-emerald-500 transition-colors cursor-pointer"
                        />
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest -mt-2 group-hover:text-emerald-400">Tap to Type</p>
                      </div>

                      <button 
                        onClick={() => setTempScore(prev => prev + 1)}
                        className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90"
                      >
                        <i className="fa-solid fa-plus text-xl"></i>
                      </button>
                    </div>

                    {/* Instant Access Grid */}
                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Instant Selection</p>
                      <div className="grid grid-cols-3 gap-3">
                         {[1,2,3,4,5,6,7,8,9].map(num => (
                           <button 
                             key={num} 
                             onClick={() => setTempScore(num)} 
                             className={`h-14 rounded-xl border flex items-center justify-center text-xl font-black transition-all ${tempScore === num ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105' : 'bg-gray-800 border-white/5 text-white hover:bg-white/10'}`}
                           >
                             {num}
                           </button>
                         ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleScoreUpdate(tempScore)}
                      className="w-full py-5 bg-emerald-600 rounded-[1.5rem] font-black uppercase text-white shadow-2xl shadow-emerald-900/40 transform active:scale-95 transition-all text-sm tracking-widest"
                    >
                      Confirm Score
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setShowScoring(false); setIsEditingScore(false); }} 
                className="w-full py-6 text-gray-500 text-[10px] font-black uppercase border-t border-white/5 hover:text-white transition-colors"
              >
                Return to Course
              </button>
           </div>
        </div>
      )}

      {/* Floating Action Menu with HIO, Camera and YouTube */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex justify-around items-center bg-gray-950/90 backdrop-blur-2xl border border-white/10 p-2 rounded-full shadow-2xl z-40 w-[94%] max-w-md">
        {[
          { icon: 'fa-burger', label: 'F&B', color: 'text-orange-400', onClick: () => setShowFBMenu(true) },
          { icon: 'fa-brands fa-youtube', label: 'Upload', color: 'text-red-500', onClick: shareToYoutube },
          { icon: 'fa-bullseye', label: 'HIO', color: 'text-yellow-400', onClick: () => setShowHIOInsurance(true) },
          { icon: 'fa-camera', label: 'Camera', color: 'text-emerald-400', onClick: requestCameraAccess },
          { icon: 'fa-phone', label: 'Shop', color: 'text-blue-400', onClick: () => {} },
        ].map((item, i) => (
          <button key={i} onClick={item.onClick} className="flex flex-col items-center gap-1 group py-2 px-3 rounded-full hover:bg-white/5 transition-all">
            <div className={`w-9 h-9 rounded-full bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
              <i className={`${item.icon}`}></i>
            </div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white">{item.label}</span>
          </button>
        ))}
      </div>

      {showHIOInsurance && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-gray-950 border border-yellow-500/40 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
             <div className="p-8 text-center bg-gradient-to-b from-yellow-500/10 to-transparent border-b border-yellow-500/10">
                <div className="w-16 h-16 bg-yellow-500 rounded-[1.5rem] mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)] rotate-6">
                   <i className="fa-solid fa-trophy text-black text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Hole-In-One Game</h3>
                <p className="text-yellow-500/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Validated by Apex Optical Tracking</p>
             </div>
             
             <div className="p-8 space-y-6">
               <div className="bg-white/5 rounded-3xl p-5 border border-white/5 text-left">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-yellow-500"></i> Game Rules & Prizes
                  </h4>
                  <ul className="text-[11px] text-gray-300 space-y-2 leading-relaxed font-medium">
                    <li>• Video Capture must be active via Apex OS on this tee box.</li>
                    <li>• Shot must be validated by cart GPS and Optical ball tracking.</li>
                    <li>• Prize payouts distributed instantly via ApexBank Escrow.</li>
                    <li>• <strong>Basic ($10):</strong> Win $5,000 Cash Instantly.</li>
                    <li>• <strong>Elite ($25):</strong> Win $25,000 + Limited Edition Apex Cap.</li>
                  </ul>
               </div>

               <div className="grid grid-cols-1 gap-3">
                 <button onClick={() => handleInsurancePurchase('BASIC')} className="group flex justify-between items-center p-5 bg-gray-900 rounded-[1.5rem] border border-white/5 hover:border-yellow-500/40 transition-all">
                   <div className="text-left">
                     <p className="font-black text-white uppercase italic tracking-tighter">Basic Entry</p>
                     <p className="text-[10px] text-emerald-400 font-bold">$5,000 Grand Prize</p>
                   </div>
                   <div className="bg-white/10 group-hover:bg-yellow-500 group-hover:text-black px-5 py-2.5 rounded-xl text-sm font-black transition-colors">$10.00</div>
                 </button>
                 
                 <button onClick={() => handleInsurancePurchase('ELITE')} className="group flex justify-between items-center p-5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-[1.5rem] border border-yellow-500/40 hover:scale-[1.02] transition-all shadow-xl shadow-yellow-500/5">
                   <div className="text-left">
                     <p className="font-black text-yellow-500 uppercase italic tracking-tighter">Elite Entry</p>
                     <p className="text-[10px] text-yellow-300 font-bold">$25,000 Grand Prize + Apex Cap</p>
                   </div>
                   <div className="bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-black shadow-lg">$25.00</div>
                 </button>
               </div>
             </div>
             <button onClick={() => setShowHIOInsurance(false)} className="w-full py-6 text-gray-500 text-[10px] font-black uppercase tracking-widest border-t border-white/5 hover:text-white transition-colors">Decline Entry</button>
           </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {recordedVideoUrl && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Review Recording</h3>
              <button onClick={() => setRecordedVideoUrl(null)} className="text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="aspect-video bg-black">
              <video src={recordedVideoUrl} controls className="w-full h-full"></video>
            </div>
            <div className="p-6 flex gap-4">
              <button 
                onClick={shareToYoutube}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center transition-all shadow-xl shadow-red-900/40"
              >
                <i className="fa-brands fa-youtube mr-2"></i> Share to YouTube
              </button>
              <a 
                href={recordedVideoUrl} 
                download={`Apex_Hole_${activeHole}.webm`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center transition-all shadow-xl shadow-emerald-900/40"
              >
                <i className="fa-solid fa-download mr-2"></i> Save Locally
              </a>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          
          <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center z-10">
            <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white hover:bg-red-500 transition-colors">
              <i className="fa-solid fa-times"></i>
            </button>
            <div className="flex gap-4">
              {isRecording && (
                <div className="bg-red-600/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-500/30 flex items-center gap-2 animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-white"></div>
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Recording</p>
                </div>
              )}
              <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/30">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Apex Optics Active</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-0 right-0 flex justify-center items-end gap-8 px-8">
             {/* Analyze/Photo Snap */}
             <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={handleCaptureAndAnalyze}
                  disabled={isAnalyzing || isRecording}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 disabled:opacity-30 shadow-lg"
                >
                  <i className="fa-solid fa-bolt-lightning text-xl text-yellow-400"></i>
                </button>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">AI Analyze</span>
             </div>

             {/* Capture Still Photo */}
             <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={() => {
                    if (videoRef.current && canvasRef.current) {
                      const ctx = canvasRef.current.getContext('2d');
                      canvasRef.current.width = videoRef.current.videoWidth;
                      canvasRef.current.height = videoRef.current.videoHeight;
                      ctx?.drawImage(videoRef.current, 0, 0);
                      alert("Snapshot Captured! Saved to Memories.");
                    }
                  }}
                  disabled={isRecording}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 shadow-xl"
                >
                  <i className="fa-solid fa-camera text-2xl text-white"></i>
                </button>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Snapshot</span>
             </div>

             {/* Main Video Record Button */}
             <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center transition-all p-1 shadow-2xl ${isRecording ? 'animate-pulse' : 'hover:scale-110 active:scale-90'}`}
                >
                  <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 rounded-lg bg-red-600' : 'w-14 h-14 rounded-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]'}`}></div>
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{isRecording ? 'Stop' : 'Rec Video'}</span>
             </div>

             {/* Gallery Access */}
             <div className="flex flex-col items-center gap-3">
                <button 
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-lg"
                >
                  <i className="fa-solid fa-photo-film text-xl text-emerald-400"></i>
                </button>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Memories</span>
             </div>
             
             {/* YouTube Quick Share */}
             <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={shareToYoutube}
                  className="w-14 h-14 rounded-full bg-red-600/20 backdrop-blur-xl border border-red-500/30 flex items-center justify-center hover:bg-red-600/40 transition-all active:scale-95 shadow-lg"
                >
                  <i className="fa-brands fa-youtube text-xl text-red-500"></i>
                </button>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Youtube</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnCourse;
