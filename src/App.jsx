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
  LogOut
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
import Login from './Login';

const data = [
  { name: 'Lun', earnings: 400 },
  { name: 'Mar', earnings: 700 },
  { name: 'Mié', earnings: 600 },
  { name: 'Jue', earnings: 900 },
  { name: 'Vie', earnings: 1100 },
  { name: 'Sáb', earnings: 1500 },
  { name: 'Dom', earnings: 1300 },
];

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

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Si no hay usuario, mostrar el Login
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className={`flex min-h-screen bg-[#020617] text-slate-200 flex-col md:flex-row ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>

      {/* Installation Guide Banner */}
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

      {/* Mobile Header */}
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

      {/* Sidebar (Desktop & Mobile) */}
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {t('welcome').replace('Alex', currentUser.displayName || currentUser.email.split('@')[0])}
            </h2>
            <p className="text-slate-400 mt-1 text-sm md:text-base">{t('growth')}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0">
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

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8`}>
          <StatCard title={t('monthly_income')} value="4.850,00€" change="12.5%" trend="up" icon={TrendingUp} />
          <StatCard title={t('tax_savings')} value="1.240,50€" change="8.2%" trend="up" icon={ShieldCheck} />
          <StatCard title={t('passive_potential')} value="890,00€" change="2.4%" trend="down" icon={Zap} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-card p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{t('weekly_performance')}</h3>
              <select className="bg-slate-800 border-none text-[10px] md:text-xs rounded-lg px-2 py-1 outline-none text-slate-300">
                <option>{t('last_7_days')}</option>
                <option>{t('last_month')}</option>
              </select>
            </div>
            <div className="h-[250px] md:h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
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
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Panel - Passive Streams */}
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{t('extra_passive')}</h3>
              <div className="p-1 px-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                {t('ai_suggested')}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <AffiliateOffer
                title="Revolut Business"
                desc={t('revolut_desc')}
                commission="50€"
                logo={Globe}
                tag="Fintech"
                perSignupLabel={t('per_signup')}
              />
              <AffiliateOffer
                title="SafetyWing"
                desc={t('safetywing_desc')}
                commission="25€"
                logo={ShieldCheck}
                tag="Seguros"
                perSignupLabel={t('per_signup')}
              />
              <AffiliateOffer
                title="NordVPN"
                desc={t('nordvpn_desc')}
                commission="15€"
                logo={ShieldCheck}
                tag="Oferta"
                perSignupLabel={t('per_signup')}
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 md:mt-6 premium-btn flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('explore_more')}
              </motion.button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate-500 leading-tight uppercase font-bold tracking-widest text-center">
                ZenProfit IA v1.2 • Backend Integrated
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Back Overlay */}
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
