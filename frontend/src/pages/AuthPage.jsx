import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('doctor@medq.ai');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [role, setRole] = useState('Obstetrician');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name & title');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register(fullName, email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const formatted = detail
          .map((item) => {
            const field = item.loc ? item.loc[item.loc.length - 1] : 'field';
            return `${field}: ${item.msg}`;
          })
          .join(', ');
        setError(formatted);
      } else if (typeof detail === 'object' && detail !== null) {
        setError(JSON.stringify(detail));
      } else {
        setError(detail || err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen w-full flex bg-black font-sans">
      {/* Left Panel (~55%) */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#050811] via-[#0B0F17] to-[#0F172A] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo Header */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 ring-1 ring-white/20">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">MedQ AI</h1>
            <p className="text-xs text-brand-300 font-medium tracking-wide uppercase">Clinical Intelligence Platform</p>
          </div>
        </div>

        {/* Main Headline & Hero Illustration Graphic */}
        <div className="my-auto z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 text-brand-300 text-xs font-semibold backdrop-blur-md mb-6 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-brand-400" /> Next-Gen Diagnostic Decision Support
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white mb-4">
            AI-Powered Risk Prediction for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-brand-300">Healthier Tomorrow</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Empowering maternal and multidisciplinary clinical teams with real-time risk stratification, explainable SHAP diagnostics, and quantum-optimized risk engines.
          </p>

          {/* Graphic Mockup Badge Card */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-2xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Live Clinical Model</p>
              <h4 className="text-sm font-semibold text-white">99.4% Multi-Domain Prediction Accuracy</h4>
              <p className="text-xs text-slate-400">Fully validated across pregnancy sepsis, stroke, and cardiovascular risk domains.</p>
            </div>
          </div>
        </div>

        {/* 3 Feature Callouts */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-brand-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">AI Predictions</h5>
              <p className="text-[11px] text-slate-400">Real-time analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Quantum Enhanced</h5>
              <p className="text-[11px] text-slate-400">Deep stratification</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Secure & Private</h5>
              <p className="text-[11px] text-slate-400">HIPAA Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (~45%) Form Card */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-12 bg-black">
        <div className="w-full max-w-md bg-[#0F172A] rounded-2xl shadow-2xl p-8 border border-slate-800">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              {isRegister
                ? 'Register to access AI clinical risk prediction tools'
                : 'Sign in with your clinical credentials to continue'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name & Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Sarah Johnson"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-all font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-all font-medium placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-all font-medium placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-all font-medium placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Clinical Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Obstetrician / Cardiologist"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 transition-all font-medium placeholder:text-slate-600"
                  />
                </div>
              </>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between py-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 font-medium">
                  <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-900 text-brand-500 focus:ring-brand-500" />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset password.'); }} className="text-brand-400 hover:underline font-semibold">
                  Forgot Password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-brand-400 font-bold hover:underline ml-1"
            >
              {isRegister ? 'Sign In' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
