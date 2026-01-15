import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Zap, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
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
            setError(t('auth_error') || 'Error de autenticación. Revisa tus datos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            await loginWithGoogle();
        } catch (err) {
            setError('Error al conectar con Google.');
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            {/* Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                        <Zap className="text-white w-10 h-10 fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white italic">ZenProfit AI</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isLogin ? 'Accede a tu libertad financiera' : 'Crea tu cuenta de inversor'}
                    </p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="password"
                            required
                            placeholder="Contraseña"
                            className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full premium-btn font-bold flex items-center justify-center gap-2"
                    >
                        {loading ? 'Procesando...' : isLogin ? <><LogIn className="w-5 h-5" /> Entrar</> : <><UserPlus className="w-5 h-5" /> Crear Cuenta</>}
                    </button>
                </form>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <span className="relative px-4 bg-slate-950/20 text-xs text-slate-500 font-bold uppercase tracking-widest">o continúa con</span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Google
                </button>

                <p className="text-center mt-8 text-sm text-slate-400">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya eres usuario?'} {' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 font-bold hover:underline"
                    >
                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
