import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Wallet,
  TrendingUp,
  PieChart,
  CreditCard,
  Search,
  Bell,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Globe,
  Download,
  Languages,
  LogOut,
  X,
  History,
  BrainCircuit,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  Trash2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import Login from './Login';

// --- Assets ---
const APP_LOGO = "/C:/Users/sello/.gemini/antigravity/brain/7f6aab83-e315-456a-86bb-0997737b4089/zenprofit_ultra_premium_v3_5_logo176849458400000_1768490985848.png";

// --- Components ---

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-6 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex justify-between items-start relative z-10">
      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {change}
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}</h3>
    </div>
  </motion.div>
);

const ViewContainer = ({ children, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="space-y-8"
  >
    <div className="mb-2">
      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">{title}</h2>
      <p className="text-slate-400 font-medium mt-1">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);

const LanguageSelector = ({ currentLanguage, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'fr', name: 'Français' },
    { code: 'jp', name: '日本語' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"
      >
        <Languages className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest">{currentLanguage}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-48 glass-card p-3 z-50 overflow-hidden shadow-2xl border-white/10"
            >
              <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChange(lang.code);
                      setIsOpen(false);
                    }}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentLanguage === lang.code
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

function App() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInstallGuide, setShowInstallGuide] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // States para Datos Reales
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('income');
  const [newCategory, setNewCategory] = useState('Otros');
  const [loading, setLoading] = useState(false);

  // --- Effects ---

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(dataArr);

      const income = dataArr.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const expenses = dataArr.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotalIncome(income);
      setTotalExpenses(expenses);
    });

    return unsubscribe;
  }, [currentUser]);

  // --- Handlers ---

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newAmount || !newDesc) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "transactions"), {
        userId: currentUser.uid,
        amount: Number(newAmount),
        description: newDesc.trim(),
        type: newType,
        category: newCategory,
        createdAt: serverTimestamp()
      });
      setIsAddModalOpen(false);
      setNewAmount('');
      setNewDesc('');
      setNewCategory('Otros');
    } catch (err) {
      console.error("Error adding document: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta operación?")) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  // --- Data Preparation ---

  const chartData = transactions.slice(0, 7).reverse().map(t => ({
    name: t.description.substring(0, 8),
    val: t.type === 'income' ? t.amount : -t.amount
  }));

  const pieData = [
    { name: 'Ingresos', value: totalIncome, color: '#6366f1' },
    { name: 'Gastos', value: totalExpenses, color: '#f43f5e' }
  ];

  if (!currentUser) return <Login />;

  // --- Views ---

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ViewContainer title="Dashboard" subtitle={t('growth')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title={t('monthly_income')} value={`${totalIncome.toLocaleString()}€`} change="+12%" trend="up" icon={TrendingUp} />
              <StatCard title={t('tax_savings')} value={`${(totalIncome * 0.2).toLocaleString()}€`} change="Est." trend="up" icon={ShieldCheck} />
              <StatCard title={t('passive_potential')} value={`${totalExpenses.toLocaleString()}€`} change="-5%" trend="down" icon={Zap} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Rendimiento Semanal
                  </h3>
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Ver todos</button>
                </div>
                <div className="h-[300px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.length > 0 ? chartData : [{ name: '...', val: 0 }]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-8 bg-indigo-500/5 group border-indigo-500/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  IA Insights
                </h3>
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
                    <p className="text-slate-300 text-sm leading-relaxed">
                      "Tus ahorros del 20% están en camino. Si reduces un 5% en ocio, podrías invertir 200€ extra en dividendos."
                    </p>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg shadow-white/5">
                    Habilitar IA Pro
                  </button>
                </div>
              </div>
            </div>
          </ViewContainer>
        );

      case 'savings':
        return (
          <ViewContainer title="Historial" subtitle="Gestiona cada céntimo de tu libertad financiera.">
            <div className="glass-card overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Todas las Operaciones</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {totalIncome.toLocaleString()}€
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-400">
                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    {totalExpenses.toLocaleString()}€
                  </div>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {transactions.length === 0 ? (
                  <div className="p-20 text-center">
                    <History className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold tracking-tight">Todavía no has registrado movimientos.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {transactions.map((t) => (
                      <div key={t.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} border shadow-inner`}>
                            {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-base">{t.description}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-slate-800 px-2 py-0.5 rounded-md">{t.category || 'Otros'}</span>
                              <span className="text-[10px] text-slate-600 font-bold">{t.createdAt?.toDate().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'} tracking-tighter`}>
                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}€
                          </p>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ViewContainer>
        );

      case 'stats':
        return (
          <ViewContainer title="Análisis" subtitle="Visualiza tus patrones de gasto e ingresos.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-8">Reparto de Capital</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-4">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Salud Financiera</h4>
                      <p className="text-xs text-slate-400">Puntuación basada en tus gastos.</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mt-6">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    />
                  </div>
                  <p className="text-right text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-widest">75/100 EXCELENTE</p>
                </div>

                <div className="glass-card p-6 border-slate-800">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Top Categorías</h4>
                  <div className="space-y-4">
                    {['Servidores', 'Suscripciones', 'Marketing'].map((cat, i) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">{cat}</span>
                        <div className="flex-1 mx-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-600 rounded-full" style={{ width: `${80 - i * 20}%` }} />
                        </div>
                        <span className="text-xs text-white font-black">€{(350 - i * 50)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ViewContainer>
        );

      case 'cards':
        return (
          <ViewContainer title="Marketplace" subtitle="Accede a herramientas pro con beneficios exclusivos.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Revolut Business', desc: 'Cuenta pro para freelancers con cashback.', comm: '€50', tag: 'Bancario', icon: CreditCard },
                { name: 'SafetyWing', desc: 'Seguro médico global para nómadas.', comm: '€20', tag: 'Seguro', icon: ShieldCheck },
                { name: 'NordVPN', desc: 'Protección de datos y acceso global.', comm: '€15', tag: 'Seguridad', icon: Zap },
              ].map((offer) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={offer.name}
                  className="glass-card p-6 flex flex-col gap-4 border-white/5 active:scale-95 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                      <offer.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md">
                      {offer.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{offer.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{offer.desc}</p>
                  </div>
                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recompensa</p>
                      <p className="text-lg font-black text-emerald-400">{offer.comm}</p>
                    </div>
                    <button className="p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </ViewContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>

      {/* Animated Aura Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/15 blur-[120px] rounded-full animate-aura" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[120px] rounded-full animate-aura" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-aura" style={{ animationDelay: '5s' }} />
      </div>

      {/* Navigation Backdrop for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Sidebar */}
      <aside className={`
        fixed md:sticky top-0 ${i18n.language === 'ar' ? 'right-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]' : 'left-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]'} bottom-0 z-[110]
        w-80 p-8 flex flex-col gap-10 bg-slate-950/50 backdrop-blur-2xl border-r border-white/5
        transition-all duration-500 ease-in-out md:translate-x-0
        ${isMobileMenuOpen
          ? 'translate-x-0'
          : (i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full')
        }
      `}>
        <div className="flex items-center justify-between mb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10 ring-1 ring-white/20">
              <img src={APP_LOGO} alt="ZenProfit Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white italic tracking-tighter leading-none">ZenProfit</h1>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI Engine v3.5</span>
            </div>
          </motion.div>
          <button className="md:hidden p-2 text-slate-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
            { id: 'savings', icon: History, label: t('nav_earnings') },
            { id: 'stats', icon: PieChart, label: t('nav_analysis') },
            { id: 'cards', icon: CreditCard, label: t('nav_cards') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 relative group overflow-hidden ${activeTab === item.id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-200'
                }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`} />
                <span className="font-extrabold text-sm tracking-tight">{item.label}</span>
              </div>
              {activeTab === item.id && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {activeTab === item.id && <ChevronRight className="w-4 h-4 text-indigo-400 relative z-10" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 relative group cursor-pointer overflow-hidden">
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-24 h-24 text-indigo-500" />
            </div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Empieza ahora</p>
            <h4 className="text-white font-black text-lg leading-tight mb-4 tracking-tighter">Desbloquea el Coach de IA</h4>
            <button className="w-full py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
              Actualizar a Pro
            </button>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 text-slate-500 group-hover:text-rose-500 transition-colors" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Salir</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Content */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">

        {/* Top Sticky Header */}
        <header className="px-6 py-5 md:px-12 md:py-8 flex items-center justify-between bg-slate-950/10 backdrop-blur-lg border-b border-white/5 sticky top-0 z-[80]">
          <div className="md:hidden flex items-center gap-4" onClick={() => setIsMobileMenuOpen(true)}>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <img src={APP_LOGO} alt="ZenProfit Logo" />
            </div>
            <h1 className="font-black text-white italic tracking-tighter">ZenProfit</h1>
          </div>

          <div className="hidden md:flex items-center gap-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Busca cualquier dato..."
              className="bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm w-72 focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-white"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden md:block">
              <LanguageSelector currentLanguage={i18n.language} onChange={i18n.changeLanguage} />
            </div>
            <button className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 p-1.5 pr-4 rounded-2xl bg-slate-900/50 border border-white/5 shadow-xl">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=6366f1&color=fff`} className="w-full h-full" alt="User" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Inversor Pro</p>
                <p className="text-sm font-extrabold text-white tracking-tight mt-1 truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Scrollable Area Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 pb-32">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </div>

        {/* Global Floating Action Button Button */}
        <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[90]">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-indigo-400 group relative"
          >
            <Plus className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:rotate-90 duration-500" />
            <div className="absolute inset-0 bg-indigo-400 rounded-3xl blur-[20px] opacity-0 group-hover:opacity-40 transition-opacity" />
          </motion.button>
        </div>

      </main>

      {/* Re-used Add Modal Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="glass-card w-full max-w-lg p-10 relative z-[210] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-slate-900"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none">Nueva Operación</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Añade datos a tu motor financiero</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="flex gap-4 p-2 bg-slate-950 rounded-2xl border border-white/5">
                  <button
                    type="button" onClick={() => setNewType('income')}
                    className={`flex-1 py-4 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${newType === 'income' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    Ingreso <ArrowUpRight className="inline w-4 h-4 ml-1" />
                  </button>
                  <button
                    type="button" onClick={() => setNewType('expense')}
                    className={`flex-1 py-4 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${newType === 'expense' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                    Gasto <ArrowDownRight className="inline w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Descripción</label>
                    <input
                      type="text" required placeholder="Concepto..."
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Monto (€)</label>
                    <input
                      type="number" required placeholder="0.00"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Categoría</label>
                  <select
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                    value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Servidores">Servidores</option>
                    <option value="Suscripciones">Suscripciones</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Ingresos Pasivos">Ingresos Pasivos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <button
                  type="submit" disabled={loading}
                  className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] text-white mt-4 transition-all shadow-2xl ${newType === 'income' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'}`}
                >
                  {loading ? 'Sincronizando...' : `Ejecutar ${newType === 'income' ? 'Ingreso' : 'Gasto'}`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
