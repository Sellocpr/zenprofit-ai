import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, PieChart, CreditCard, Plus, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Zap, Languages, LogOut, X, History, BrainCircuit,
  LayoutDashboard, ExternalLink, Trash2, Target, Sparkles, Trophy, Gift, Rocket
} from 'lucide-react';
import {
  AreaChart, Area, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import Login from './Login';

const APP_LOGO = "/assets/logo-premium.png";

const AdBanner = ({ type }) => {
  if (type === 'sidebar') return (
    <div className="mt-8 p-6 glass-card bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all">
      <div className="relative z-10">
        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Exclusive Offer</p>
        <h4 className="text-sm font-black text-white italic mb-1">PassivWealth Pro</h4>
        <p className="text-[10px] text-slate-400 leading-tight mb-4">Master the markets with our AI-driven signals.</p>
        <button className="w-full py-2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-500/20">Upgrade Now</button>
      </div>
      <Rocket className="absolute -bottom-2 -right-2 w-16 h-16 text-indigo-500/10 group-hover:rotate-12 transition-transform" />
    </div>
  );

  return (
    <div className="p-10 glass-card bg-slate-900/60 border-indigo-500/10 relative overflow-hidden group mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <Gift className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">ZenProfit Pro <span className="text-indigo-400">Launch Sale</span></h3>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Get 50% OFF Lifetime License • Limited Time</p>
          </div>
        </div>
        <button className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 italic">Secure My Slot</button>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
    </div>
  );
};

const LanguageSelector = ({ currentLanguage, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages = [
    { code: 'es', name: 'Español' }, { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' }, { code: 'ar', name: 'العربية' }
  ];
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"><Languages className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">{currentLanguage}</span></button>
      <AnimatePresence>{isOpen && (<><div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} /><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 glass-card p-3 z-50 shadow-2xl border-white/10"><div className="grid grid-cols-1 gap-1">{languages.map((lang) => (<button key={lang.code} onClick={() => { onChange(lang.code); setIsOpen(false); }} className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentLanguage === lang.code ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>{lang.name}</button>))}</div></motion.div></>)}</AnimatePresence>
    </div>
  );
};

const CurrencySelector = ({ current, onChange }) => (
  <div className="flex gap-1 p-1 bg-slate-900/50 border border-white/5 rounded-2xl">
    {['EUR', 'USD', 'GBP'].map(curr => (
      <button key={curr} onClick={() => onChange(curr)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${current === curr ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{curr}</button>
    ))}
  </div>
);

function App() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('income');
  const [newCategory, setNewCategory] = useState('Otros');
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "transactions"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(dataArr);
      const inc = dataArr.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const exp = dataArr.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotalIncome(inc); setTotalExpenses(exp);
    });
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (transactions.length > 0) {
      setAiThinking(true);
      setTimeout(() => {
        const last = transactions[0];
        let ins = last.type === 'income' ? "¡Gran entrada de capital! ZenProfit recomienda diversificar un 15%." : "Análisis de flujo en curso. Tu ratio de gasto es óptimo.";
        setAiInsight(ins); setAiThinking(false);
      }, 2500);
    }
  }, [transactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault(); if (!newAmount || !newDesc) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), { userId: currentUser.uid, amount: Number(newAmount), description: newDesc.trim(), type: newType, category: newCategory, createdAt: serverTimestamp() });
      setIsAddModalOpen(false); setNewAmount(''); setNewDesc('');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const chartData = useMemo(() => transactions.slice(0, 7).reverse().map(t => ({ name: t.description.substring(0, 5), val: t.type === 'income' ? t.amount : -t.amount })), [transactions]);
  const pieData = [{ name: 'In', value: totalIncome || 1, color: '#6366f1' }, { name: 'Out', value: totalExpenses || 1, color: '#f43f5e' }];

  if (!currentUser) return <Login />;

  const formatValue = (val) => {
    const rate = currency === 'USD' ? 1.08 : currency === 'GBP' ? 0.83 : 1;
    const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
    return `${(val * rate).toFixed(0)}${sym}`;
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return (
        <div>
          <AdBanner type="top" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group">
              <TrendingUp className="absolute top-4 right-4 w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ingresos Live</p>
              <h3 className="text-3xl font-black text-white mt-1">{formatValue(totalIncome)}</h3>
            </div>
            <div className="glass-card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group">
              <ShieldCheck className="absolute top-4 right-4 w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protección Fiscal</p>
              <h3 className="text-3xl font-black text-white mt-1">{formatValue(totalIncome * 0.2)}</h3>
            </div>
            <div className="glass-card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group">
              <Zap className="absolute top-4 right-4 w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gasto Real</p>
              <h3 className="text-3xl font-black text-white mt-1">{formatValue(totalExpenses)}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-8 bg-slate-900/60 shadow-2xl relative min-h-[400px]">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-20">
                  <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
                  <h3 className="text-xl font-black text-white italic">Motor ZenProfit listo. Registra tu primera entrada.</h3>
                </div>
              ) : (
                <div className="h-[320px] w-full" dir="ltr">
                  <ResponsiveContainer><AreaChart data={chartData}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} /><Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={5} fill="url(#g)" /></AreaChart></ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="glass-card p-8 bg-indigo-500/10 border-indigo-500/20 relative">
                <BrainCircuit className={`absolute top-4 right-4 w-12 h-12 text-indigo-400 ${aiThinking ? 'animate-spin' : 'opacity-20'}`} />
                <h3 className="text-xl font-black text-white mb-6 italic">AI Coach Pro</h3>
                <p className="text-slate-300 text-sm italic min-h-[100px] leading-relaxed">"{aiThinking ? 'Procesando datos...' : aiInsight || 'Añade datos para activar consejos.'}"</p>
              </div>
              <div className="glass-card p-8 bg-emerald-500/5 border-emerald-500/10"><h3 className="text-lg font-black text-white mb-4 flex gap-2"><Target className="w-5 h-5 text-emerald-400" /> Meta 50k</h3><div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (totalIncome / 50000) * 100)}%` }} /></div></div>
            </div>
          </div>
        </div>
      );
      case 'savings': return (
        <div className="glass-card bg-slate-900/60 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center"><h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Historial Operativo</h3><div className="flex gap-6"><span className="text-emerald-400 font-black">+{formatValue(totalIncome)}</span><span className="text-rose-400 font-black">-{formatValue(totalExpenses)}</span></div></div>
          <div className="max-h-[600px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {transactions.map(t => (
              <div key={t.id} className="p-6 bg-slate-950/40 rounded-3xl border border-white/5 flex justify-between items-center group shadow-xl hover:bg-slate-900/60 transition-all">
                <div className="flex items-center gap-6"><div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{t.type === 'income' ? <ArrowUpRight /> : <ArrowDownRight />}</div><div><h4 className="text-white font-black text-lg uppercase italic">{t.description}</h4><p className="text-[10px] text-slate-600 font-bold">{t.category}</p></div></div>
                <div className="flex items-center gap-6"><span className={`text-2xl font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{formatValue(t.amount)}</span><button onClick={() => deleteDoc(doc(db, "transactions", t.id))} className="opacity-0 group-hover:opacity-100 text-slate-800 hover:text-rose-500 transition-all p-2"><Trash2 /></button></div>
              </div>
            ))}
          </div>
        </div>
      );
      case 'stats': return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-12 bg-slate-900/60 flex flex-col items-center">
            <h3 className="text-2xl font-black text-white mb-10 italic">Balance de Activos</h3>
            <div className="h-[320px] w-full"><ResponsiveContainer><RePieChart><Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></RePieChart></ResponsiveContainer></div>
          </div>
          <div className="glass-card p-12 bg-indigo-500/5 flex flex-col justify-center border-indigo-500/10 shadow-indigo-500/10 shadow-2xl"><Trophy className="w-16 h-16 text-indigo-400 mb-6" /><h4 className="text-3xl font-black text-white italic">Wealth Score</h4><p className="text-7xl font-black text-indigo-400 italic">82/100</p><div className="w-full h-3 bg-slate-950 rounded-full mt-8 overflow-hidden"><div className="h-full bg-indigo-500 w-[82%] shadow-[0_0_20px_rgba(99,102,241,0.5)]" /></div><p className="text-[10px] text-slate-500 mt-6 uppercase font-black tracking-[0.4em]">Nivel: Inversor Estratégico v3.5</p></div>
        </div>
      );
      case 'cards': return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: 'Revolut Pro', d: 'Best for Nomad Banking', b: '50€ Bonus', c: 'indigo', link: 'https://revolut.com' },
            { n: 'SafetyWing', d: 'Insurance for Digital Nomads', b: '1 Month Free', c: 'emerald', link: 'https://safetywing.com' },
            { n: 'NordVPN Premium', d: 'Ultimate Security for Travelers', b: '3 Months Free', c: 'blue', link: 'https://nordvpn.com' },
            { n: 'Binance Global', d: 'Leading Crypto Exchange', b: '$100 Voucher', c: 'yellow', link: 'https://binance.com' },
            { n: 'Wise Business', d: 'Borderless Payments', b: '0% Fees', c: 'green', link: 'https://wise.com' },
            { n: 'TradingView Pro', d: 'Advanced Market Analytics', b: '$30 Reward', c: 'cyan', link: 'https://tradingview.com' }
          ].map(o => (
            <div key={o.n} className="glass-card p-10 bg-slate-900/60 border-white/5 group hover:border-indigo-500/30 transition-all shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <CreditCard className={`w-12 h-12 text-${o.c}-400 group-hover:scale-110 transition-transform`} />
                  <span className="text-[8px] font-black bg-white/10 text-white px-2 py-1 rounded-full uppercase tracking-widest">Sponsored</span>
                </div>
                <h4 className="text-2xl font-black text-white italic mb-2">{o.n}</h4>
                <p className="text-xs text-slate-500 font-bold mb-8 leading-relaxed">{o.d}</p>
              </div>
              <div className="flex justify-between items-end border-t border-white/5 pt-8">
                <div>
                  <p className="text-[10px] text-slate-600 font-black uppercase mb-1">Benefit</p>
                  <p className="text-2xl font-black text-white">{o.b}</p>
                </div>
                <a href={o.link} target="_blank" rel="noopener noreferrer" className="p-5 bg-white text-black rounded-2xl hover:scale-110 transition-all shadow-xl shadow-white/5">
                  <ExternalLink className="w-6 h-6" />
                </a>
              </div>
            </div>
          ))}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-inter">
      <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[180px] animate-pulse rounded-full" /><div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[180px] animate-pulse rounded-full" /></div>
      <aside className={`fixed md:sticky top-0 bg-slate-950/80 backdrop-blur-3xl w-[320px] h-screen p-10 border-r border-white/5 z-[100] transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-5 mb-14"><div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl p-1 shadow-2xl shadow-indigo-500/20"><img src={APP_LOGO} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Z&background=6366f1&color=fff" }} /></div><div><h1 className="text-2xl font-black text-white italic tracking-tighter leading-none">ZenProfit</h1><span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Ultimate v3.5</span></div></div>
        <nav className="space-y-3">
          {[{ id: 'dashboard', l: 'Dashboard', i: LayoutDashboard }, { id: 'savings', l: 'Historial', i: History }, { id: 'stats', l: 'Análisis', i: PieChart }, { id: 'cards', l: 'Marketplace', i: CreditCard }].map(it => (
            <button key={it.id} onClick={() => { setActiveTab(it.id); setIsMobileMenuOpen(false) }} className={`w-full flex items-center gap-5 px-7 py-5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === it.id ? 'bg-white/5 text-indigo-400 border border-white/10 shadow-inner' : 'text-slate-500 hover:text-white'}`}><it.i className="w-6 h-6" /> {it.l}</button>
          ))}
        </nav>
        <AdBanner type="sidebar" />
        <div className="mt-auto pt-10"><button onClick={logout} className="flex items-center gap-4 text-slate-600 hover:text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] scale-95 transition-all"><LogOut className="w-5 h-5" /> Logout</button></div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="px-10 py-8 flex justify-between items-center bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
          <div className="md:hidden font-black text-2xl italic text-white" onClick={() => setIsMobileMenuOpen(true)}>ZenProfit</div>
          <div className="hidden lg:flex items-center gap-6"><CurrencySelector current={currency} onChange={setCurrency} /><LanguageSelector currentLanguage={i18n.language} onChange={i18n.changeLanguage} /></div>
          <div className="flex items-center gap-5 p-2 pr-6 bg-slate-900/60 rounded-3xl border border-white/5 shadow-xl">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20"><img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}`} className="w-full h-full object-cover" /></div>
            <div className="hidden sm:block"><p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Pro Investor</p><p className="text-base font-black text-white italic tracking-tighter leading-none">{currentUser.displayName || currentUser.email.split('@')[0]}</p></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-10 pb-40 custom-scrollbar">{renderView()}</div>
        <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-10 right-10 w-22 h-22 bg-indigo-500 text-white rounded-[35px] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-[110] border-2 border-indigo-400"><Plus className="w-12 h-12" /></button>
      </main>
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl" onClick={() => setIsAddModalOpen(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="glass-card w-full max-w-xl p-12 bg-slate-900 border-white/10 relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10"><h3 className="text-3xl font-black text-white italic tracking-tighter">Nueva Operación</h3><button onClick={() => setIsAddModalOpen(false)} className="p-3 text-slate-500 hover:text-white transition-all"><X className="w-8 h-8" /></button></div>
              <form onSubmit={handleAddTransaction} className="space-y-8">
                <div className="flex gap-4 p-2 bg-slate-950 rounded-2xl shadow-inner shadow-black/50">
                  <button type="button" onClick={() => setNewType('income')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-xl transition-all ${newType === 'income' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-700'}`}>Entrada</button>
                  <button type="button" onClick={() => setNewType('expense')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-xl transition-all ${newType === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-700'}`}>Salida</button>
                </div>
                <input type="text" required placeholder="Concepto..." className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-8 py-5 text-white font-bold text-lg outline-none focus:border-indigo-500" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                <input type="number" required placeholder="Importe (€)" className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-8 py-5 text-indigo-400 font-black text-4xl tracking-tighter outline-none focus:border-indigo-500" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                <button type="submit" disabled={loading} className={`w-full py-7 rounded-3xl font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all italic ${newType === 'income' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/40'}`}>{loading ? 'Sincronizando...' : 'Confirmar Registro Live'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
