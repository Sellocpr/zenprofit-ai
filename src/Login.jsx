import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Zap, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, loginWithGoogle } = useAuth();
    const { t } = useTranslation();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            console.error("Auth Error:", err);
            // Mostrar mensaje amigable basado en el código de error de Firebase si es posible
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Email o contraseña incorrectos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este email ya está registrado.');
            } else {
                setError(t('auth_error') || 'Error al conectar. Verifica tus datos.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError('No se pudo conectar con Google. Asegúrate de que el dominio esté autorizado en Firebase.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[440px]"
            >
                <div className="glass-card shadow-2xl shadow-black/50 overflow-hidden border-white/10">
                    {/* Header Section */}
                    <div className="p-8 pb-4 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6"
                        >
                            <Zap className="text-white w-10 h-10 fill-white" />
                        </motion.div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2">
                            ZenProfit <span className="text-indigo-400">AI</span>
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {isLogin ? t('login_title') : t('signup_title')}
                        </p>
                    </div>

                    <div className="px-8 pb-10">
                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email" required placeholder="tu@email.com"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all text-white"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contraseña</label>
                                    {isLogin && <button type="button" className="text-[10px] text-indigo-400 font-bold hover:underline">¿Olvidaste la clave?</button>}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="password" required placeholder="••••••••"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all text-white"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full premium-btn py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Procesando...' : isLogin ? <><LogIn className="w-5 h-5" /> {t('login_btn')}</> : <><UserPlus className="w-5 h-5" /> {t('register')}</>}
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <span className="relative px-4 bg-[#141d2e] text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                {t('or_continue')}
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </motion.button>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500 text-xs font-medium">
                                {isLogin ? t('no_account') : t('have_account')} {' '}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                    className="text-indigo-400 font-black hover:text-indigo-300 transition-colors uppercase tracking-wider ml-1"
                                >
                                    {isLogin ? t('register') : t('login_btn')}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
                    ZenProfit AI Engine v2.0
                </p>
            </motion.div>
        </div>
    );
}
