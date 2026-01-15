import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  Target,
  Sparkles,
  Trophy
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
// Usamos la ruta pública corregida para que el logo se vea siempre en producción
const APP_LOGO = "/assets/logo-premium.png";

// --- Components ---

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-6 relative overflow-hidden group border-white/5 bg-slate-900/40"
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
      <Icon className="w-20 h-20" />
    </div>
    <div className="flex justify-between items-start relative z-10">
      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500/20 transition-colors">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {change}
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-white mt-1 tracking-tighter tabular-nums">{value}</h3>
    </div>
  </motion.div>
);

const ViewContainer = ({ children, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="space-y-8"
  >
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-1 bg-indigo-500 rounded-full" />
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Ultimate Edition</p>
      </div>
      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-none">{title}</h2>
      <p className="text-slate-400 font-medium mt-2 text-sm md:text-base border-l border-white/10 pl-4">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);

const LanguageSelector = ({ currentLanguage, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages = [
    { code: 'es', name: 'Español' }, { code: 'en', name: 'English' }, { code: 'zh', name: '中文' },
    { code: 'de', name: 'Deutsch' }, { code: 'it', name: 'Italiano' }, { code: 'fr', name: 'Français' },
    { code: 'jp', name: '日本語' }, { code: 'ru', name: 'Русский' }, { code: 'ar', name: 'العربية' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl hover:border-indigo-500/30"
      >
        <Languages className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest">{currentLanguage}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-48 glass-card p-3 z-50 overflow-hidden shadow-2xl border-white/10"
            >
              <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { onChange(lang.code); setIsOpen(false); }}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentLanguage === lang.code ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // States para Datos Reales
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('income');
  const [newCategory, setNewCategory] = useState('Otros');
  const [loading, setLoading] = useState(false);

  // Financial Goals Goals
  const FINANCIAL_GOAL = 50000; // Meta base de ejemplo
  const currentProgress = (totalIncome / FINANCIAL_GOAL) * 100;

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

  // AI Insights Trigger
  useEffect(() => {
    if (transactions.length > 0) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const insights = [
          "Tu ratio de ahorro del 20% es saludable. Si optimizas la categoría 'Suscripciones', podrías ganar 150€ anuales adicionales.",
          "Has registrado ingresos consistentes esta semana. Considera mover un 10% a tu cartera de dividendos.",
          "Ojo con el gasto en 'Otros'. Representa un 15% de tu flujo de caja; desglosarlo te daría más control.",
          "¡Meta cerca! Estás al 80% de cubrir tus gastos fijos con ingresos pasivos. Sigue así."
        ];
        setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
        setAiThinking(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [transactions.length]);

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

  const chartData = useMemo(() => transactions.slice(0, 7).reverse().map(t => ({
    name: t.description.substring(0, 8),
    val: t.type === 'income' ? t.amount : -t.amount
  })), [transactions]);

  const pieData = [
    { name: 'Ingresos', value: totalIncome || 1, color: '#6366f1' },
    { name: 'Gastos', value: totalExpenses || 1, color: '#f43f5e' }
  ];

  if (!currentUser) return <Login />;

  // --- Views ---

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ViewContainer title="Dashboard" subtitle={t('growth')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title={t('monthly_income')} value={`${totalIncome.toLocaleString()}€`} change="Real Time" trend="up" icon={TrendingUp} />
              <StatCard title={t('tax_savings')} value={`${(totalIncome * 0.2).toLocaleString()}€`} change="20% Est." trend="up" icon={ShieldCheck} />
              <StatCard title={t('passive_potential')} value={`${totalExpenses.toLocaleString()}€`} change="Actual" trend="down" icon={Zap} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-8 border-white/5 bg-slate-900/60 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3 italic">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      Motor de Rendimiento
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Sincronizado con Live Cloud</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase border border-indigo-500/20">7 Días</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black uppercase border border-white/5 hover:text-white">30 Días</button>
                  </div>
                </div>
                <div className="h-[320px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'Init', val: 0 }]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#818cf8', fontWeight: '900', fontSize: '14px' }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorVal)" animationDuration={2000} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-card p-8 bg-indigo-500/10 border-indigo-500/20 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-4 transition-all duration-1000 ${aiThinking ? 'animate-spin opacity-40' : 'opacity-10'}`}>
                    <BrainCircuit className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    AI Coach Pro
                  </h3>
                  <div className="space-y-6 relative z-10">
                    <div className="min-h-[100px] flex items-center">
                      <AnimatePresence mode="wait">
                        {aiThinking ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </motion.div>
                        ) : (
                          <motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300 text-sm leading-relaxed font-medium italic">
                            "{aiInsight || 'Añade más operaciones para recibir consejos personalizados.'}"
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                      Sincronizar IA
                    </button>
                  </div>
                </div>

                <div className="glass-card p-8 bg-emerald-500/5 border-emerald-500/10">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Libertad Financiera
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Progreso Meta 1</span>
                      <span className="text-lg font-black text-emerald-400 tracking-tighter">{Math.min(100, currentProgress.toFixed(1))}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, currentProgress)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold text-center italic">Calculado sobre meta de {FINANCIAL_GOAL.toLocaleString()}€</p>
                  </div>
                </div>
              </div>
            </div>
          </ViewContainer>
        );

      case 'savings':
        return (
          <ViewContainer title="Historial" subtitle="Gestión total de cada flujo de caja en tiempo real.">
            <div className="glass-card overflow-hidden border-white/5 bg-slate-900/60 shadow-2xl">
              <div className="p-10 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="font-black text-white uppercase tracking-[0.3em] text-[11px]">Libro Mayor Corporativo</h3>
                  <p className="text-slate-500 text-xs font-medium mt-1">Desglosado por orden cronológico inverso.</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center p-4 px-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Entradas</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tighter">+{totalIncome.toLocaleString()}€</p>
                  </div>
                  <div className="text-center p-4 px-8 rounded-3xl bg-rose-500/5 border border-rose-500/20">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Salidas</p>
                    <p className="text-2xl font-black text-rose-400 tracking-tighter">-{totalExpenses.toLocaleString()}€</p>
                  </div>
                </div>
              </div>
              <div className="max-h-[700px] overflow-y-auto custom-scrollbar p-6">
                {transactions.length === 0 ? (
                  <div className="p-32 text-center">
                    <History className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-50" />
                    <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Sin registros financieros.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((t) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        key={t.id}
                        className="p-6 flex items-center justify-between bg-slate-900/40 rounded-3xl border border-white/5 hover:border-white/10 transition-all group hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'} border`}>
                            {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-white font-black text-lg tracking-tight uppercase italic">{t.description}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-[9px] text-white/60 font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">{t.category || 'Otros'}</span>
                              <span className="text-[10px] text-slate-600 font-bold">{t.createdAt?.toDate().toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <p className={`text-2xl font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'} tracking-tighter`}>
                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}€
                          </p>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-3 rounded-xl bg-rose-500/5 text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ViewContainer>
        );

      case 'stats':
        return (
          <ViewContainer title="Análisis" subtitle="Métricas avanzadas para optimizar tu libertad financiera.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-10 bg-slate-900/60 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                <h3 className="text-2xl font-black text-white mb-10 italic">Balance de Capital</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        innerRadius={100}
                        outerRadius={130}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '20px', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-12 mt-6">
                  {pieData.map(d => (
                    <div key={d.name} className="flex flex-col items-center gap-2">
                      <div className="w-10 h-1 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                      <p className="text-xl font-black text-white italic">{((d.value / (totalIncome + totalExpenses)) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass-card p-10 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/10 shadow-indigo-500/5 shadow-2xl">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-4 rounded-3xl bg-indigo-500 shadow-2xl shadow-indigo-500/40 border border-indigo-400">
                      <Trophy className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white italic tracking-tighter">Puntuación de Riqueza</h4>
                      <p className="text-xs text-slate-400 font-medium">Algoritmo ZenProfit Engine v3.5</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden mt-8 border border-white/5 relative shadow-inner">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: '82%' }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Nivel Inversor</p>
                    <p className="text-2xl font-black text-indigo-400 tracking-tighter italic">82/100</p>
                  </div>
                </div>

                <div className="glass-card p-8 border-slate-800 bg-slate-900/60 shadow-2xl">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8 italic">Distribución Estratégica</h4>
                  <div className="space-y-6">
                    {['Servidores', 'Suscripciones', 'Marketing'].map((cat, i) => (
                      <div key={cat} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors">{cat}</span>
                          <span className="text-xs text-white font-black italic">€{(450 - i * 80).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${85 - i * 15}%` }} className="h-full bg-slate-600 rounded-full group-hover:bg-indigo-500 transition-colors" />
                        </div>
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
          <ViewContainer title="Marketplace" subtitle="Accede a la infraestructura de los mejores, con beneficios exclusivos.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Revolut Business', desc: 'Control total de gastos corporativos con cashback ilimitado.', comm: '€50', tag: 'FINTECH', icon: CreditCard, color: 'indigo' },
                { name: 'SafetyWing Nomad', desc: 'Seguro médico global diseñado para nómadas digitales.', comm: '€25', tag: 'INSURANCE', icon: ShieldCheck, color: 'emerald' },
                { name: 'NordVPN Enterprise', desc: 'Cifrado de grado militar para proteger tus datos financieros.', comm: '€20', tag: 'SECURITY', icon: Zap, color: 'blue' },
              ].map((offer) => (
                <motion.div
                  whileHover={{ y: -10 }}
                  key={offer.name}
                  className="glass-card p-8 flex flex-col gap-6 border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                    <offer.icon className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className={`p-4 rounded-3xl bg-${offer.color}-500/10 border border-${offer.color}-500/20`}>
                      <offer.icon className={`w-8 h-8 text-${offer.color}-400`} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] bg-${offer.color}-500/20 text-${offer.color}-400 px-4 py-1.5 rounded-full border border-${offer.color}-500/30`}>
                      {offer.tag}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black text-white tracking-tighter italic leading-none">{offer.name}</h4>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">{offer.desc}</p>
                  </div>
                  <div className="pt-8 mt-auto flex items-center justify-between border-t border-white/5 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Benefit</p>
                      <p className={`text-2xl font-black text-${offer.color === 'indigo' ? 'emerald' : offer.color}-400 tracking-tighter italic`}>{offer.comm}</p>
                    </div>
                    <button className="p-4 rounded-2xl bg-white text-black hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-95">
                      <ExternalLink className="w-5 h-5 font-black" />
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
    <div className={`relative min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden ${i18n.language === 'ar' ? 'font-arabic' : ''}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Animated Aura Background Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-indigo-500/15 blur-[160px] rounded-full animate-aura" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[100%] h-[100%] bg-cyan-500/10 blur-[160px] rounded-full animate-aura" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] bg-purple-500/5 blur-[160px] rounded-full animate-aura" style={{ animationDelay: '6s' }} />
      </div>

      {/* Navigation Backdrop for Mobile Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Sidebar Component */}
      <aside className={`
        fixed md:sticky top-0 ${i18n.language === 'ar' ? 'right-0 shadow-[-30px_0_100px_rgba(0,0,0,0.8)]' : 'left-0 shadow-[30px_0_100px_rgba(0,0,0,0.8)]'} bottom-0 z-[110]
        w-[340px] p-10 flex flex-col gap-12 bg-slate-950/60 backdrop-blur-3xl border-r border-white/5
        transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
      `}>
        <div className="flex items-center justify-between">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[22px] overflow-hidden shadow-2xl shadow-indigo-500/40 border-2 border-white/10 ring-4 ring-indigo-500/5 p-1 bg-slate-900">
              <img src={APP_LOGO} alt="ZenProfit Logo" className="w-full h-full object-cover rounded-[16px]" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Z&background=6366f1&color=fff"; }} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-white italic tracking-tighter leading-none mb-1">ZenProfit</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Ultimate v3.5</span>
              </div>
            </div>
          </motion.div>
          <button className="md:hidden p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-7 h-7" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
            { id: 'savings', icon: History, label: t('nav_earnings') },
            { id: 'stats', icon: PieChart, label: t('nav_analysis') },
            { id: 'cards', icon: CreditCard, label: t('nav_cards') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center justify-between px-6 py-5 rounded-[24px] transition-all duration-500 relative group group overflow-hidden ${activeTab === item.id ? 'text-white shadow-2xl shadow-indigo-500/10' : 'text-slate-500 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-5 relative z-10">
                <item.icon className={`w-6 h-6 transition-all duration-500 ${activeTab === item.id ? 'scale-110 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110'}`} />
                <span className="font-black text-base tracking-tight uppercase italic">{item.label}</span>
              </div>
              {activeTab === item.id && (
                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-[24px] shadow-inner" transition={{ type: "spring", bounce: 0.1, duration: 0.8 }} />
              )}
              {activeTab === item.id && <ChevronRight className="w-4 h-4 text-indigo-400 relative z-10" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-8">
          <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/20 to-transparent border-indigo-500/20 relative group cursor-pointer overflow-hidden rounded-[30px] shadow-2xl">
            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Zap className="w-28 h-28 text-indigo-500" />
            </div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 leading-none">PREMIUM ACCESS</p>
            <h4 className="text-white font-black text-[22px] leading-none mb-6 tracking-tighter italic">Desbloquea el Coach de IA Pro</h4>
            <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-100 transition-all shadow-2xl shadow-white/5 italic">
              UPGRADE NOW
            </button>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-between w-full px-7 py-5 rounded-[24px] bg-slate-900/40 border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all group group"
          >
            <div className="flex items-center gap-5 text-left">
              <LogOut className="w-6 h-6 text-slate-500 group-hover:text-rose-500 transition-all group-hover:-translate-x-1" />
              <div>
                <span className="text-xs font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest block leading-none">Desconectar</span>
                <p className="text-[10px] text-slate-600 font-bold mt-1">Cerrar sesión segura</p>
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area Component Area */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden bg-slate-950/10">

        {/* Top Premium Sticky Header Header */}
        <header className="px-8 py-6 md:px-14 md:py-10 flex items-center justify-between bg-slate-950/20 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-[80] shadow-2xl">
          <div className="md:hidden flex items-center gap-5" onClick={() => setIsMobileMenuOpen(true)}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img src={APP_LOGO} alt="ZenProfit Logo" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Z&background=6366f1&color=fff"; }} />
            </div>
            <h1 className="font-black text-2xl text-white italic tracking-tighter">ZenProfit</h1>
          </div>

          <div className="hidden md:flex items-center gap-6 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Busca cualquier dato en la nube..."
              className="bg-slate-900/60 border border-white/5 rounded-[20px] pl-14 pr-8 py-4 text-sm w-[450px] focus:outline-none focus:border-indigo-500/50 transition-all font-bold text-white shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden lg:block">
              <LanguageSelector currentLanguage={i18n.language} onChange={i18n.changeLanguage} />
            </div>
            <button className="p-4 rounded-[20px] bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl hover:bg-slate-800 group relative">
              <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950 shadow-lg" />
            </button>
            <div className="flex items-center gap-5 p-2 pr-6 rounded-[22px] bg-slate-900/60 border border-white/5 shadow-2xl hover:border-white/10 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-[18px] overflow-hidden border-2 border-white/5 group-hover:border-indigo-500/40 transition-all shadow-2xl">
                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="User" />
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] leading-none mb-1 shadow-indigo-500/20">Inversor Pro</p>
                <p className="text-base font-black text-white tracking-tighter mt-1 italic truncate max-w-[150px]">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Content Scrollable Area Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 md:px-14 md:py-12 pb-40">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </div>

        {/* Global Action Floating Multi-Action Button FAB */}
        <div className="fixed bottom-10 right-10 md:bottom-16 md:right-16 z-[90] flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-indigo-500 text-white flex items-center justify-center shadow-[0_25px_60px_-15px_rgba(99,102,241,0.6)] border-2 border-indigo-400 group relative overflow-hidden"
          >
            <Plus className="w-10 h-10 md:w-12 md:h-12 transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            <div className="absolute inset-0 bg-indigo-400 rounded-3xl blur-[30px] opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
          </motion.button>
        </div>

      </main>

      {/* Corporate Add Transaction Transaction Modal Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 50 }}
              className="glass-card w-full max-w-2xl p-12 relative z-[210] border-white/10 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] bg-slate-900 rounded-[40px] overflow-hidden"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none">Nueva Operación Cloud</h3>
                  <p className="text-slate-500 text-sm font-bold mt-3 uppercase tracking-[0.3em] pl-1 border-l-2 border-indigo-500">Sincronización segura activa</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-4 bg-white/5 hover:bg-rose-500/10 rounded-2xl transition-all group">
                  <X className="w-8 h-8 text-slate-500 group-hover:text-rose-500 transition-colors" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-10">
                <div className="flex gap-6 p-3 bg-slate-950 rounded-[28px] border border-white/5 shadow-inner">
                  <button
                    type="button" onClick={() => setNewType('income')}
                    className={`flex-1 py-5 text-xs font-black rounded-[22px] transition-all uppercase tracking-[0.3em] italic ${newType === 'income' ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30' : 'text-slate-700 hover:text-slate-400'}`}
                  >
                    Entrada <ArrowUpRight className="inline w-5 h-5 ml-1" />
                  </button>
                  <button
                    type="button" onClick={() => setNewType('expense')}
                    className={`flex-1 py-5 text-xs font-black rounded-[22px] transition-all uppercase tracking-[0.3em] italic ${newType === 'expense' ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/30' : 'text-slate-700 hover:text-slate-400'}`}
                  >
                    Salida <ArrowDownRight className="inline w-5 h-5 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Descripción Vía</label>
                    <input
                      type="text" required placeholder="Ej: Cliente Premium..."
                      className="w-full bg-slate-950/60 border border-white/10 rounded-[22px] px-8 py-5 text-base font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                      value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Capital (€)</label>
                    <input
                      type="number" required placeholder="0.00"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-[22px] px-8 py-5 text-2xl font-black text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner tracking-tighter"
                      value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Categoría de Activo</label>
                  <select
                    className="w-full bg-slate-950/60 border border-white/10 rounded-[22px] px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer italic"
                    value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Servidores">Servidores e Infraestructura</option>
                    <option value="Suscripciones">Suscripciones Digitales</option>
                    <option value="Marketing">Marketing y Growth</option>
                    <option value="Ingresos Pasivos">Flujos de Ingresos Pasivos</option>
                    <option value="Otros">Operaciones Diversas</option>
                  </select>
                </div>

                <button
                  type="submit" disabled={loading}
                  className={`w-full py-7 rounded-[28px] font-black text-base uppercase tracking-[0.4em] text-white mt-4 transition-all shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] active:scale-[0.98] italic ${newType === 'income' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30'}`}
                >
                  {loading ? 'Sincronizando con Servidor...' : `Confirmar ${newType === 'income' ? 'Entrada' : 'Salida'}`}
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
