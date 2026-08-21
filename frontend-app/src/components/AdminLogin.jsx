import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconCrown, IconGlobe, IconSparkles, IconX } from './Icons';

export const AdminLogin = () => {
  const { loginAdmin, registerAdmin, setPortalMode, openGoogleModal } = useHotel();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  const [name, setName] = useState('Muhammed Ibrahim');
  const [email, setEmail] = useState('pmmuhammedibrahim786@gmail.com');
  const [password, setPassword] = useState('adminpassword123');
  const [role, setRole] = useState('Manager'); // 'Manager' | 'Receptionist' | 'Housekeeping'
  const [department, setDepartment] = useState('Operations');
  
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!email || !password) {
        setError('Please enter both email address and password.');
        return;
      }

      setIsLoading(true);
      const success = await loginAdmin(email, password);
      setIsLoading(false);

      if (!success) {
        setError('Authentication failed. Check your credentials or use quick demo buttons below.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields to create a staff account.');
        return;
      }

      setIsLoading(true);
      const res = await registerAdmin({ name, email, password, role, department });
      setIsLoading(false);

      if (!res || !res.success) {
        setError(res?.message || 'Failed to register new staff account.');
      }
    }
  };

  const handleRoleFill = (targetRole) => {
    setRole(targetRole);
    if (targetRole === 'Manager') {
      setEmail('pmmuhammedibrahim786@gmail.com');
      setPassword('adminpassword123');
    } else if (targetRole === 'Receptionist') {
      setEmail('pmmuhammedibrahim786@gmail.com');
      setPassword('receptionpassword123');
    } else if (targetRole === 'Housekeeping') {
      setEmail('pmmuhammedibrahim786@gmail.com');
      setPassword('housekeeping123');
    }
    setError('');
  };

  const handleGoogleSignIn = () => {
    setError('');
    openGoogleModal({
      role: 'admin'
    });
  };

  return (
    <div className="relative min-h-[90vh] sm:min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden text-slate-100 font-sans">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')`
        }}
      />

      {/* Dark Luxury Blur Overlays */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      {/* Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/85 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 my-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <IconCrown size={30} />
          </div>

          <h1 className="text-2xl font-bold font-serif tracking-wide text-slate-100">
            AURELIA OPERATIONS
          </h1>
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            Staff Authentication & Management Console
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Staff Sign Up */}
        <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff Sign Up
          </button>
        </div>

        {/* Staff Role Selector Buttons */}
        <div className="space-y-1.5">
          <label className="block text-[11px] uppercase font-bold text-slate-400">Select Staff Role</label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['Manager', 'Receptionist', 'Housekeeping'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleFill(r)}
                className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all truncate px-1 ${
                  role === r
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Google / Gmail Staff Sign In */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
            </svg>
            <span>Staff Sign In with Google Workspace / Gmail</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest absolute">
              OR STAFF CREDENTIALS
            </span>
          </div>
        </div>

        {/* Login / Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Staff Member Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Muhammed Ibrahim"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Staff Email Address / Gmail</label>
              <button
                type="button"
                onClick={() => {
                  setEmail('pmmuhammedibrahim786@gmail.com');
                  setError('Recovered Gmail: pmmuhammedibrahim786@gmail.com');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
              >
                Forgot Gmail?
              </button>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              placeholder="pmmuhammedibrahim786@gmail.com"
            />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => {
                  setPassword('adminpassword123');
                  setError('Recovered Password: adminpassword123');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 pr-14 font-mono"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading
              ? 'Processing...'
              : authMode === 'login'
              ? `Sign In as ${role}`
              : `Create ${role} Account`}
          </button>
        </form>

        {/* Fast Demo Role Auto-Fill Buttons */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
            FAST DEMO ROLE ACCOUNTS:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRoleFill('Manager')}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-center transition-all"
            >
              <div className="text-[10px] font-bold text-amber-400">Manager (Hotel)</div>
              <div className="text-[9px] text-slate-400 truncate">pmmuhammedibrahim786</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleFill('Receptionist')}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-center transition-all"
            >
              <div className="text-[10px] font-bold text-emerald-400">Receptionist (Hotel)</div>
              <div className="text-[9px] text-slate-400 truncate">pmmuhammedibrahim786</div>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setPortalMode('guest')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <IconGlobe size={14} />
              <span>Preview Guest Booking Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
