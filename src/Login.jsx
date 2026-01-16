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
            const code = err.code || 'unknown';
            if (code === 'auth/operation-not-allowed') {
                setError('Error: Habilita el método en Firebase Console.');
            } else {
                setError(`Error (${code}): Verifica tus datos.`);
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
            setError(`Error de Google: Verifica la configuración en Firebase.`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 bg-slate-950 font-inter">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-cyan-500/10 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-[440px] glass-card p-12 bg-slate-900 border-white/5 shadow-2xl"
            >
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8 border border-white/10 shadow-indigo-500/30">
                        <Zap className="text-white fill-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-2">
                        ZenProfit <span className="text-indigo-400">AI</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">
                        {isLogin ? 'Secure Access' : 'New Investor'}
                    </p>
                </div>

                {error && (
                    <div className="bg-rose-500/5 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase mb-8 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email" required placeholder="Email"
                        className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password" required placeholder="Passcode"
                        className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 italic"
                    >
                        {loading ? 'Analizando...' : isLogin ? 'Entrar' : 'Registrar'}
                    </button>
                </form>

                <div className="relative my-10 flex items-center">
                    <div className="flex-1 border-t border-white/5"></div>
                    <span className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">O entrar con</span>
                    <div className="flex-1 border-t border-white/5"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-100 transition-all text-xs outline-none"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                    Google Account
                </button>

                <p className="text-center mt-10 text-slate-500 text-xs font-medium">
                    {isLogin ? '¿Nuevo aquí?' : '¿Ya eres miembro?'}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 font-black uppercase tracking-widest ml-2 hover:underline"
                    >
                        {isLogin ? 'Registrarse' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </motion.div>
    );
}
