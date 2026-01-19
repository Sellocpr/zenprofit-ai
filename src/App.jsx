import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, PieChart, CreditCard, Plus, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Zap, Languages, LogOut, X, History, BrainCircuit,
  LayoutDashboard, ExternalLink, Trash2, Target, Sparkles, Trophy, Gift, Rocket,
  Search, Bell, Info, ChevronRight, Activity, HelpCircle, Laptop, Globe, Crown, Check
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

// --- Components ---

const MarketTicker = ({ prices }) => {
  const tickerItems = useMemo(() => {
    if (!prices) return ['BTC: Loading...', 'ETH: Loading...', 'EUR/USD: 1.087', 'GOLD: $2,045', 'S&P 500: 4,780'];
    return [
      `BTC: $${prices.bitcoin?.usd.toLocaleString() || '---'}`,
      `ETH: $${prices.ethereum?.usd.toLocaleString() || '---'}`,
      `SOL: $${prices.solana?.usd.toLocaleString() || '---'}`,
      `BNB: $${prices.binancecoin?.usd.toLocaleString() || '---'}`,
      `EUR/USD: 1.087`,
      `GOLD: $2,045`
    ];
  }, [prices]);

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md border-b border-white/5 py-3 px-10 flex overflow-hidden whitespace-nowrap z-50">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="flex gap-20 items-center"
      >
        {tickerItems.map((item, i) => (
          <span key={i} className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase">
            <Activity className="w-3 h-3 text-indigo-400" /> {item}
          </span>
        ))}
        {tickerItems.map((item, i) => (
          <span key={i + "-2"} className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase">
            <Activity className="w-3 h-3 text-indigo-400" /> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const AdBanner = ({ type, onUpgrade, isPremium }) => {
  if (isPremium) return null; // No ads for premium users

  if (type === 'sidebar') return (
    <div onClick={onUpgrade} className="mt-8 p-6 glass-card bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-indigo-500/50 overflow-hidden relative group cursor-pointer hover:shadow-indigo-500/20 shadow-2xl transition-all">
      <div className="relative z-10">
        <p className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-2">Pro Recommendation</p>
        <h4 className="text-sm font-black text-white italic mb-1 uppercase tracking-tighter">Eliminar Anuncios</h4>
        <p className="text-[10px] text-slate-400 leading-tight mb-4">Pásate a Pro para una experiencia limpia y AI avanzada.</p>
        <button className="w-full py-2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Upgrade Now</button>
      </div>
      <Crown className="absolute -bottom-2 -right-2 w-16 h-16 text-white/10" />
    </div>
  );

  return (
    <div className="p-10 glass-card bg-slate-900/60 border-indigo-500/20 relative overflow-hidden group mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 text-center md:text-left">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Gift className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">ZenProfit Pro <span className="text-indigo-400">Oferta de Lanzamiento</span></h3>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Acceso Ilimitado • AI Coach Avanzado • Sin Anuncios</p>
          </div>
        </div>
        <button onClick={onUpgrade} className="px-10 py-5 bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/40 italic whitespace-nowrap">¡Hacerme Pro!</button>
      </div>
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

// --- Main App ---

function App() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('zenprofit_pro') === 'true');

  const [aiThinking, setAiThinking] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('income');
  const [newCategory, setNewCategory] = useState('Otros');
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [marketPrices, setMarketPrices] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd');
        const data = await res.json();
        setMarketPrices(data);
      } catch (err) { console.error("Price fetch failed", err); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000 * 5); // 5 min
    return () => clearInterval(interval);
  }, []);

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
        const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) : 0;
        const highestCategory = transactions.reduce((acc, curr) => {
          if (curr.type === 'expense') acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
          return acc;
        }, {});
        const topCat = Object.keys(highestCategory).reduce((a, b) => highestCategory[a] > highestCategory[b] ? a : b, 'Otros');

        let ins = "";
        if (isPremium) {
          if (expenseRatio > 0.7) {
            ins = `Alerta Pro: Tu ratio de gastos (${(expenseRatio * 100).toFixed(0)}%) es crítico. Reduce gastos en "${topCat}" para asegurar tu meta de 50k.`;
          } else if (totalIncome > 0) {
            ins = `Análisis Pro: Estás ahorrando un ${(100 - (expenseRatio * 100)).toFixed(0)}% de tus ingresos. A este ritmo, alcanzarás tu meta en ${Math.ceil((50000 - (totalIncome - totalExpenses)) / (totalIncome - totalExpenses || 1))} períodos.`;
          } else {
            ins = "Análisis Pro: Registra ingresos para calcular tu proyección de libertad financiera.";
          }
        } else {
          ins = expenseRatio > 0.5 ? "Cuidado con los gastos elevados. ZenProfit sugiere revisar la categoría " + topCat + "." : "Tu balance es saludable. Sigue registrando para mejorar el análisis.";
        }
        setAiInsight(ins); setAiThinking(false);
      }, 2500);
    }
  }, [transactions, isPremium, totalIncome, totalExpenses]);

  const addNotification = (title, type = 'info') => {
    const newNotif = { id: Date.now(), title, type, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [newNotif, ...prev].slice(0, 8));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault(); if (!newAmount || !newDesc) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), { userId: currentUser.uid, amount: Number(newAmount), description: newDesc.trim(), type: newType, category: newCategory, createdAt: serverTimestamp() });
      addNotification(`Operación: ${newDesc}`, 'success');
      setIsAddModalOpen(false); setNewAmount(''); setNewDesc('');
    } catch (err) { console.error(err); addNotification('Error en la nube', 'error'); } finally { setLoading(false); }
  };

  const handleUpgrade = () => {
    setLoading(true);
    // Simular procesamiento de pago
    setTimeout(() => {
      setIsPremium(true);
      localStorage.setItem('zenprofit_pro', 'true');
      setLoading(false);
      setIsUpgradeModalOpen(false);
      addNotification('¡Bienvenido a la Élite ZenProfit!', 'success');
    }, 2500);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const chartData = useMemo(() => filteredTransactions.slice(0, 7).reverse().map(t => ({ name: t.description.substring(0, 5), val: t.type === 'income' ? t.amount : -t.amount })), [filteredTransactions]);
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
        <div className="animate-in fade-in duration-700">
          <AdBanner type="top" onUpgrade={() => setIsUpgradeModalOpen(true)} isPremium={isPremium} />
          {/* Tarjetas de Balance con Diseño Fluido (Fix para el corte visual) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 overflow-visible">
            <div className="glass-card p-10 bg-slate-900/40 border-white/5 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
              <TrendingUp className="absolute top-4 right-4 w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Ingresos Live</p>
              <h3 className="text-4xl font-black text-white mt-2 tabular-nums">{formatValue(totalIncome)}</h3>
            </div>
            <div className="glass-card p-10 bg-slate-900/40 border-white/5 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
              <ShieldCheck className="absolute top-4 right-4 w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Fiscal (Est.)</p>
              <h3 className="text-4xl font-black text-white mt-2 tabular-nums">{formatValue(totalIncome * 0.2)}</h3>
            </div>
            <div className="glass-card p-10 bg-slate-900/40 border-white/5 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
              <Zap className="absolute top-4 right-4 w-12 h-12 opacity-5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Gasto Real</p>
              <h3 className="text-4xl font-black text-white mt-2 tabular-nums text-rose-400">{formatValue(totalExpenses)}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-8 glass-card p-10 bg-slate-900/60 shadow-2xl relative min-h-[450px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white italic tracking-tighter">Actividad Operativa</h3>
                <div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /><div className="w-2 h-2 rounded-full bg-white/20" /></div>
              </div>
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center gap-6">
                  <Sparkles className="w-16 h-16 text-indigo-400/40 animate-pulse" />
                  <h3 className="text-xl font-black text-white italic">Motor ZenProfit listo. Registra tu primera entrada.</h3>
                </div>
              ) : (
                <div className="h-[320px] w-full" dir="ltr">
                  <ResponsiveContainer><AreaChart data={chartData}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '22px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} /><Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={6} fill="url(#g)" /></AreaChart></ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8 h-full flex flex-col">
              <div className={`glass-card p-10 border-2 transition-all relative overflow-hidden flex-1 min-h-[220px] flex flex-col justify-center ${isPremium ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-slate-900/40'}`}>
                <BrainCircuit className={`absolute top-4 right-4 w-12 h-12 text-indigo-400 ${aiThinking ? 'animate-spin' : 'opacity-20'}`} />
                <div className="relative z-10 w-full">
                  <h3 className="text-xl font-black text-white mb-4 italic flex items-center gap-2">AI Coach {isPremium ? "PRO" : "Basic"} {isPremium && <Crown className="w-4 h-4 text-indigo-400" />}</h3>
                  <p className="text-slate-300 text-sm italic leading-relaxed font-medium">"{aiThinking ? 'Analizando mercados internacionales...' : aiInsight || 'Sincroniza datos para activar el coach.'}"</p>
                  {!isPremium && <button onClick={() => setIsUpgradeModalOpen(true)} className="mt-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-all">Desbloquear Análisis Profundo →</button>}
                </div>
              </div>

              <div className="glass-card p-10 bg-slate-900/60 border-white/5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-white flex gap-2 items-center uppercase tracking-widest"><Target className="w-4 h-4 text-emerald-400" /> Meta 50k</h3>
                  <span className="text-xs font-black text-emerald-400">{((totalIncome / 50000) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalIncome / 50000) * 100)}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      case 'savings': return (
        <div className="glass-card bg-slate-900/60 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-700">
          <div className="p-10 border-b border-white/5 bg-white/5 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Historial Operativo ({filteredTransactions.length})</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group w-full sm:w-[350px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-all" />
                <input
                  type="text"
                  placeholder="Buscar Concepto o Categoría..."
                  className="bg-slate-950/60 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs text-white focus:border-indigo-500 outline-none w-full shadow-inner shadow-black/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-8 px-6 py-3 bg-slate-950/40 rounded-2xl border border-white/5">
                <span className="text-emerald-400 font-black tabular-nums">+{formatValue(totalIncome)}</span>
                <span className="text-rose-400 font-black tabular-nums">-{formatValue(totalExpenses)}</span>
              </div>
            </div>
          </div>
          <div className="max-h-[650px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {filteredTransactions.length === 0 ? (
              <div className="py-20 text-center uppercase text-[10px] font-black text-slate-600 tracking-widest italic">No se encontraron movimientos.</div>
            ) : filteredTransactions.map(t => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-7 bg-slate-950/40 rounded-[30px] border border-white/5 flex justify-between items-center group hover:bg-slate-900 transition-all shadow-xl">
                <div className="flex items-center gap-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xl uppercase italic tracking-tighter">{t.description}</h4>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">{t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`text-2xl font-black tabular-nums ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type === 'income' ? '+' : '-'}{formatValue(t.amount)}</span>
                  <button onClick={() => deleteDoc(doc(db, "transactions", t.id))} className="opacity-0 group-hover:opacity-100 p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
      case 'guide': return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-20">
            <div className="inline-block p-4 bg-indigo-500/10 rounded-3xl mb-6 border border-indigo-500/20"><HelpCircle className="w-16 h-16 text-indigo-400 animate-pulse" /></div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">Manual de Usuario Pro</h2>
            <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.6em]">Domina tus Finanzas con ZenProfit</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { t: '1. Registro en Vivo', d: 'Usa el botón "+" para añadir entradas o salidas. Categoriza cada gasto para que la IA aprenda de ti.', i: Plus, c: 'indigo' },
              { t: '2. Escucha al Coach', d: 'El Coach Pro analiza tu Wealth Score. Si ves la luz azul parpadear, pulsa para ver consejos avanzados.', i: BrainCircuit, c: 'purple' },
              { t: '3. Nomad Mode', d: 'En el menú superior puedes cambiar a USD o GBP. ZenProfit recalcula tus balances al instante.', i: Globe, c: 'cyan' },
              { t: '4. Búsqueda Instantánea', d: 'En la pestaña "Historial" tienes un buscador potente. Encuentra cualquier gasto por palabra clave.', i: Search, c: 'emerald' },
              { t: '5. Alertas de Seguridad', d: 'La campana te avisará si se borra algo o si tu meta de 50k está cerca de cumplirse.', i: Bell, c: 'rose' },
              { t: '6. Ventaja Premium', d: 'Solo por ser Pro, tendrás acceso a ofertas exclusivas y el Coach desbloquea tácticas de inversión.', i: Crown, c: 'amber' }
            ].map((step, idx) => (
              <div key={idx} className="glass-card p-10 bg-slate-900/60 border-white/5 flex flex-col h-full group hover:border-indigo-500/30 transition-all">
                <div className={`w-12 h-12 bg-${step.c}-500/10 rounded-xl flex items-center justify-center mb-8 border border-${step.c}-500/20`}><step.i className={`w-6 h-6 text-${step.c}-400`} /></div>
                <h3 className="text-2xl font-black text-white italic mb-4 uppercase tracking-tighter">{step.t}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{step.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 glass-card bg-gradient-to-r from-indigo-600 to-purple-700 border-none shadow-[0_40px_100px_-20px_rgba(99,102,241,0.5)] flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h4 className="text-3xl font-black text-white italic tracking-tighter">¿Aún tienes dudas?</h4>
              <p className="text-indigo-100/70 text-sm font-bold uppercase tracking-widest mt-2">Nuestro soporte Pro atiende 24/7 a inversores como tú.</p>
            </div>
            <button className="px-12 py-6 bg-white text-indigo-600 font-extrabold uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">Contactar Soporte</button>
          </div>
        </div>
      );
      case 'stats': return (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
          <div className="glass-card p-12 bg-slate-900/60 flex flex-col items-center justify-center min-h-[500px]">
            <h3 className="text-2xl font-black text-white mb-10 italic uppercase tracking-widest border-b border-indigo-500/20 pb-4">Balance de Activos</h3>
            <div className="h-[350px] w-full"><ResponsiveContainer><RePieChart><Pie data={pieData} innerRadius={90} outerRadius={130} paddingAngle={10} dataKey="value">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: '20px', backgroundColor: '#0f172a', border: 'none' }} /></RePieChart></ResponsiveContainer></div>
            <div className="flex gap-10 mt-10">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-indigo-500" /><span className="text-[10px] font-black uppercase text-slate-400">Ingresos</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-rose-500" /><span className="text-[10px] font-black uppercase text-slate-400">Gastos</span></div>
            </div>
          </div>
          <div className="glass-card p-12 bg-indigo-500/5 flex flex-col justify-center border-indigo-500/10 shadow-indigo-500/20 shadow-2xl relative overflow-hidden">
            <Trophy className="w-20 h-20 text-indigo-400 mb-8 animate-bounce" />
            <h4 className="text-4xl font-black text-white italic tracking-tighter">Wealth Score</h4>
            <p className="text-8xl font-black text-indigo-400 italic tabular-nums leading-none">
              {Math.min(100, Math.max(0, Math.floor(((totalIncome - totalExpenses) / (totalIncome || 1)) * 100)) || 0)}
              <span className="text-3xl text-slate-600">/100</span>
            </p>
            <div className="w-full h-4 bg-slate-950 rounded-full mt-10 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, Math.floor(((totalIncome - totalExpenses) / (totalIncome || 1)) * 100)) || 0)}%` }}
                className="h-full bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.6)]"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-8 uppercase font-black tracking-[0.4em]">Nivel Inversor: {totalIncome > 10000 ? 'Estratégico Elite' : 'Aprendiz Zen'}</p>
          </div>
        </div>
      );
      case 'cards': return (
        <div className="space-y-16">
          <div className="glass-card p-12 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/30 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-[600px] text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-500/20 mb-6 font-black text-[9px] text-indigo-400 uppercase tracking-widest animate-pulse">Referral Program</div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">Invita a 3 amigos y gana <span className="text-indigo-400">Pro Lifetime</span></h3>
              <p className="text-slate-400 text-sm font-bold leading-relaxed italic">Comparte ZenProfit con otros inversores y desbloquea todas las funciones premium de forma gratuita para siempre.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-white/5 flex items-center gap-6 flex-1 lg:min-w-[300px]">
                <code className="text-indigo-400 font-black tracking-widest text-sm uppercase">ZEN-{currentUser?.uid?.substring(0, 8).toUpperCase()}</code>
              </div>
              <button className="px-10 py-6 bg-white text-indigo-600 font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">Copiar Link</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mb-20 overflow-visible">
            {[
              { n: 'Revolut Pro', d: 'Banca sin fronteras para nómadas digitales.', b: '50€ de Regalo', c: 'indigo', link: 'https://revolut.com' },
              { n: 'SafetyWing', d: 'Seguro médico global para viajeros remotos.', b: '1 Mes Gratis', c: 'emerald', link: 'https://safetywing.com' },
              { n: 'NordVPN Premium', d: 'Protege tus datos en cualquier red WiFi.', b: '3 Meses Extra', c: 'blue', link: 'https://nordvpn.com' },
              { n: 'Binance Global', d: 'El exchange líder para crecer tus criptos.', b: '100$ Voucher', c: 'yellow', link: 'https://binance.com' },
              { n: 'Wise Business', d: 'Pagos internacionales con comisiones mínimas.', b: 'Fee-Free 1k', c: 'green', link: 'https://wise.com' },
              { n: 'TradingView Pro', d: 'Gráficos avanzados y señales en tiempo real.', b: '30$ Descuento', c: 'cyan', link: 'https://tradingview.com' }
            ].map(o => (
              <div key={o.n} className="glass-card p-12 bg-slate-900/60 border-white/5 group hover:border-indigo-500/40 transition-all shadow-2xl flex flex-col justify-between min-h-[350px] overflow-visible">
                <div className="overflow-visible">
                  <div className="flex justify-between items-start mb-8 overflow-visible">
                    <div className={`w-16 h-16 bg-${o.c}-500/20 rounded-2xl flex items-center justify-center text-${o.c}-400`}><CreditCard className="w-8 h-8" /></div>
                    <span className="text-[9px] font-black bg-white/5 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/5 italic">Sponsor</span>
                  </div>
                  <h4 className="text-3xl font-black text-white italic mb-4 tracking-tighter uppercase">{o.n}</h4>
                  <p className="text-sm text-slate-500 font-bold mb-10 leading-relaxed italic">{o.d}</p>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-10">
                  <div><p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Benefit</p><p className="text-2xl font-black text-indigo-400 tracking-tighter">{o.b}</p></div>
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"><ExternalLink className="w-6 h-6" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="relative h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-inter selection:bg-indigo-500 selection:text-white">
      {/* Background Aura */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[200px] animate-aura rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[200px] animate-aura rounded-full" />
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 bg-slate-950/90 backdrop-blur-3xl w-[320px] h-screen p-10 border-r border-white/5 z-[200] flex flex-col transition-all duration-700 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-5 mb-16">
          <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl p-1 shadow-2xl">
            <img src={APP_LOGO} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Z&background=6366f1&color=fff" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter leading-none">ZenProfit</h1>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.5em] mt-1 block">Ultimate Edition</span>
          </div>
        </div>

        <nav className="space-y-4 flex-1">
          {[
            { id: 'dashboard', l: 'Dashboard', i: LayoutDashboard },
            { id: 'savings', l: 'Historial', i: History },
            { id: 'stats', l: 'Análisis', i: PieChart },
            { id: 'cards', l: 'Marketplace', i: CreditCard },
            { id: 'guide', l: 'Manual', i: HelpCircle }
          ].map(it => (
            <button key={it.id} onClick={() => { setActiveTab(it.id); setIsMobileMenuOpen(false) }} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] transition-all group ${activeTab === it.id ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}><it.i className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeTab === it.id ? 'text-white' : 'text-slate-600'}`} /> {it.l}</button>
          ))}
        </nav>

        <AdBanner type="sidebar" isPremium={isPremium} onUpgrade={() => setIsUpgradeModalOpen(true)} />

        <div className="mt-10 pt-10 border-t border-white/5">
          <button onClick={logout} className="flex items-center gap-4 text-slate-600 hover:text-rose-500 font-black text-[11px] uppercase tracking-[0.4em] transition-all"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        <MarketTicker prices={marketPrices} />
        <header className="px-10 py-10 flex justify-between items-center bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 relative z-[150]">
          <div className="md:hidden font-black text-3xl italic text-white flex items-center gap-4" onClick={() => setIsMobileMenuOpen(true)}>ZenProfit <Activity className="w-6 h-6 text-indigo-400" /></div>

          <div className="hidden lg:flex items-center gap-8"><CurrencySelector current={currency} onChange={setCurrency} /><LanguageSelector currentLanguage={i18n.language} onChange={i18n.changeLanguage} /></div>

          <div className="flex items-center gap-10">
            {/* Notification Center */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-all shadow-xl">
                <Bell className="w-7 h-7" />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute right-0 mt-5 w-[350px] glass-card bg-slate-950/95 border-white/10 p-8 shadow-[0_50px_100px_rgba(0,0,0,0.9)] z-[500]">
                    <div className="flex justify-between items-center mb-8"><h4 className="text-xs font-black uppercase text-white tracking-[0.3em] italic">Operaciones Live</h4><button onClick={() => setNotifications([])} className="text-[10px] text-slate-500 hover:text-white uppercase font-black">Limpiar</button></div>
                    <div className="space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-[10px] text-slate-600 font-black uppercase italic tracking-widest">Sin actividad reciente.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="flex gap-5 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : n.type === 'warning' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}><Activity className="w-5 h-5" /></div>
                            <div className="flex flex-col justify-center"><p className="text-[12px] text-white font-black leading-snug uppercase italic tracking-tighter">{n.title}</p><p className="text-[9px] text-slate-500 mt-1 font-bold tabular-nums">{n.time}</p></div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-6 py-2 px-3 pr-8 bg-slate-900/60 rounded-[30px] border border-white/5 shadow-2xl relative group">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-2xl group-hover:scale-105 transition-all">
                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=6366f1&color=fff`} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${isPremium ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{isPremium ? 'PRO Account' : 'Free Plan'}</p>
                </div>
                <p className="text-lg font-black text-white italic tracking-tighter leading-none mt-1">{currentUser.displayName || currentUser.email.split('@')[0]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrolling View */}
        <div className="flex-1 overflow-y-auto p-12 pb-56 custom-scrollbar scroll-smooth">
          <div className="max-w-[1700px] mx-auto">
            {renderView()}
          </div>
        </div>

        {/* FAB: Add Transaction */}
        <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-12 right-12 w-24 h-24 bg-indigo-500 text-white rounded-[40px] flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-90 transition-all z-[110] border-2 border-indigo-400 group">
          <Plus className="w-14 h-14 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl" onClick={() => setIsAddModalOpen(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="glass-card w-full max-w-2xl p-14 bg-slate-900 border-white/10 relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-12"><h3 className="text-4xl font-black text-white italic tracking-tighter uppercase w-full text-center ml-10">Nueva Operación Live</h3><button onClick={() => setIsAddModalOpen(false)} className="p-4 text-slate-500 hover:text-white transition-all"><X className="w-10 h-10" /></button></div>
              <form onSubmit={handleAddTransaction} className="space-y-10">
                <div className="flex gap-6 p-3 bg-slate-950 rounded-[28px] shadow-inner border border-white/5">
                  <button type="button" onClick={() => setNewType('income')} className={`flex-1 py-5 text-[11px] font-black uppercase rounded-[22px] transition-all tracking-widest ${newType === 'income' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-500'}`}>Entrada</button>
                  <button type="button" onClick={() => setNewType('expense')} className={`flex-1 py-5 text-[11px] font-black uppercase rounded-[22px] transition-all tracking-widest ${newType === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-500'}`}>Salida</button>
                </div>
                <div className="space-y-8">
                  <input type="text" required placeholder="Concepto del Movimiento..." className="w-full bg-slate-950/40 border border-white/10 rounded-3xl px-10 py-6 text-white font-bold text-xl outline-none focus:border-indigo-500 shadow-xl transition-all" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <div className="relative">
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-4xl font-black text-indigo-400 italic">{currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'}</span>
                    <input type="number" required placeholder="0.00" className="w-full bg-slate-950/40 border border-white/10 rounded-3xl pl-20 pr-10 py-8 text-white font-black text-6xl tracking-tighter outline-none focus:border-indigo-500 shadow-xl transition-all" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className={`w-full py-8 rounded-[35px] font-black uppercase tracking-[0.6em] text-white shadow-2xl transition-all italic text-sm ${newType === 'income' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/40'}`}>{loading ? 'Sincronizando...' : 'Confirmar Registro'}</button>
              </form>
            </motion.div>
          </div>
        )}

        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setIsUpgradeModalOpen(false)}>
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="glass-card w-full max-w-2xl p-0 bg-slate-900 border-indigo-500/20 relative shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-12 text-center relative overflow-hidden">
                <Crown className="w-16 h-16 text-white/20 absolute -top-4 -right-4 rotate-12" />
                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Checkout Seguro</h3>
                <p className="text-indigo-100/70 text-xs font-black uppercase tracking-widest">Activa tu Acceso Ultimate de por vida</p>
              </div>

              <div className="p-12 space-y-10">
                <div className="flex justify-between items-center p-6 bg-slate-950/40 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-indigo-400" /></div>
                    <div><p className="text-xs font-black text-white uppercase italic">ZenProfit Pro Life</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pago Único • Sin Renovación</p></div>
                  </div>
                  <p className="text-2xl font-black text-white italic">49€</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-all" />
                    <input type="text" placeholder="Número de Tarjeta" className="w-full bg-slate-950/40 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" defaultValue="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="MM/YY" className="bg-slate-950/40 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" defaultValue="12/28" />
                    <input type="text" placeholder="CVC" className="bg-slate-950/40 border border-white/10 rounded-2xl px-8 py-5 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" defaultValue="123" />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <button onClick={handleUpgrade} disabled={loading} className="w-full py-7 bg-indigo-500 text-white font-black uppercase tracking-[0.4em] rounded-[30px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-4 italic overflow-hidden relative">
                    {loading ? (
                      <div className="flex items-center gap-3"><Activity className="w-5 h-5 animate-spin" /> Verificando...</div>
                    ) : (
                      <>Pagar Ahora <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-3 opacity-30">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">Procesado de Forma Segura • Datos Encriptados</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
