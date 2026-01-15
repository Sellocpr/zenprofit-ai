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
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import Login from './Login';

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {change}
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </motion.div>
);

const AffiliateOffer = ({ title, desc, commission, logo: Icon, tag, perSignupLabel }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 group-hover:border-indigo-500/50 transition-colors shrink-0">
      <Icon className="w-6 h-6 text-indigo-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 overflow-hidden">
        <h4 className="text-white font-semibold truncate">{title}</h4>
        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold uppercase tracking-wider">
          {tag}
        </span>
      </div>
      <p className="text-slate-400 text-xs mt-0.5 truncate">{desc}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-emerald-400 font-bold text-sm">+{commission}</p>
      <p className="text-slate-500 text-[10px] uppercase font-bold">{perSignupLabel}</p>
    </div>
  </div>
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
        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
      >
        <Languages className="w-5 h-5" />
        <span className="text-xs font-bold uppercase">{currentLanguage}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-40 glass-card p-2 z-50 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChange(lang.code);
                      setIsOpen(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentLanguage === lang.code
                        ? 'bg-indigo-500/20 text-indigo-400'
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Cargar datos de Firestore en tiempo real
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newAmount || !newDesc) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "transactions"), {
        userId: currentUser.uid,
        amount: Number(newAmount),
        description: newDesc,
        type: newType,
        createdAt: serverTimestamp()
      });
      setIsAddModalOpen(false);
      setNewAmount('');
      setNewDesc('');
    } catch (err) {
      console.error("Error adding document: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para el gráfico
  const chartData = transactions.slice(0, 7).reverse().map(t => ({
    name: t.description.substring(0, 5),
    earnings: t.type === 'income' ? t.amount : -t.amount
  }));

  const displayChartData = chartData.length > 0 ? chartData : [
    { name: 'Lun', earnings: 0 },
    { name: 'Mar', earnings: 0 },
    { name: 'Mié', earnings: 0 },
    { name: 'Jue', earnings: 0 },
    { name: 'Vie', earnings: 0 },
  ];

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className={`flex min-h-screen bg-[#020617] text-slate-200 flex-col md:flex-row ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-8 relative z-110 border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Añadir Operación</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg"><X /></button>
              </div>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-4">
                  <button
                    type="button" onClick={() => setNewType('income')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newType === 'income' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    INGRESO
                  </button>
                  <button
                    type="button" onClick={() => setNewType('expense')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newType === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    GASTO
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                  <input
                    type="text" required placeholder="Ej. Cliente Pro, Café..."
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-indigo-500/50"
                    value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cantidad (€)</label>
                  <input
                    type="number" required placeholder="0.00"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-indigo-500/50"
                    value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white mt-4 transition-all ${newType === 'income' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'}`}
                >
                  {loading ? 'Guardando...' : `Guardar ${newType === 'income' ? 'Ingreso' : 'Gasto'}`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-600/20 border-b border-indigo-500/20 px-4 py-2 flex items-center justify-between overflow-hidden relative z-[60]"
          >
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>{t('install_guide')}</span>
            </div>
            <button onClick={() => setShowInstallGuide(false)} className="text-slate-400 hover:text-white p-1">
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#020617] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" />
          <span className="font-bold text-white italic">ZenProfit AI</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector currentLanguage={i18n.language} onChange={changeLanguage} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-white/5"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <aside className={`
        fixed md:relative top-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} bottom-0 z-40
        w-72 border-r border-white/5 p-8 flex flex-col gap-8 bg-[#020617]
        transition-transform duration-300 md:translate-x-0
        ${isMobileMenuOpen
          ? 'translate-x-0'
          : (i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full')
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white italic">ZenProfit AI</h1>
          </div>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          {[
            { id: 'dashboard', icon: BarChart3, label: t('nav_dashboard') },
            { id: 'savings', icon: Wallet, label: t('nav_earnings') },
            { id: 'stats', icon: PieChart, label: t('nav_analysis') },
            { id: 'cards', icon: CreditCard, label: t('nav_cards') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="glass-card p-4 bg-indigo-500/5 relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
              <Zap className="w-12 h-12 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-white relative z-10">{t('pro_plan')}</h4>
            <p className="text-xs text-slate-400 mt-1 relative z-10">{t('unlock_ai')}</p>
            <button className="w-full mt-3 py-2 text-xs font-bold bg-white text-black rounded-lg hover:bg-slate-200 transition-colors">
              {t('upgrade_now')}
            </button>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {t('welcome').replace('Alex', currentUser.displayName || currentUser.email.split('@')[0])}
            </h2>
            <p className="text-slate-400 mt-1 text-sm md:text-base">{t('growth')}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="premium-btn flex items-center gap-2 px-6 py-2.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Añadir Operación</span>
            </button>
            <div className="hidden md:block">
              <LanguageSelector currentLanguage={i18n.language} onChange={changeLanguage} />
            </div>
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                className="bg-slate-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm w-40 md:w-64 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors shrink-0">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden shrink-0">
              <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=6366f1&color=fff`} alt="Avatar" />
            </div>
          </div>
        </header>

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8`}>
          <StatCard title={t('monthly_income')} value={`${totalIncome.toFixed(2)}€`} change="Real" trend="up" icon={TrendingUp} />
          <StatCard title={t('tax_savings')} value={`${(totalIncome * 0.2).toFixed(2)}€`} change="Est." trend="up" icon={ShieldCheck} />
          <StatCard title={t('passive_potential')} value={`${totalExpenses.toFixed(2)}€`} change="Gastos" trend="down" icon={Zap} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 glass-card p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{t('weekly_performance')}</h3>
              <select className="bg-slate-800 border-none text-[10px] md:text-xs rounded-lg px-2 py-1 outline-none text-slate-300">
                <option>{t('last_7_days')}</option>
              </select>
            </div>
            <div className="h-[250px] md:h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayChartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Últimas Operaciones</h3>
            </div>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              {transactions.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-10 italic">No hay datos todavía. ¡Pulsa "+" para empezar!</p>
              ) : (
                transactions.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs text-white font-bold">{t.description}</p>
                        <p className="text-[10px] text-slate-500">{t.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount}€
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate-500 leading-tight uppercase font-bold tracking-widest text-center">
                ZenProfit IA v1.3 • Live Database Active
              </p>
            </div>
          </div>
        </div>
      </main>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
