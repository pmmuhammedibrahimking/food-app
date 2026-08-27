import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconCrown, IconGlobe, IconSparkles, IconX, IconBed, IconTrendingUp, IconUsers } from './Icons';

export const AdminLogin = () => {
  const { loginAdmin, registerAdmin, setPortalMode, openGoogleModal, isSocketConnected } = useHotel();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  const [name, setName] = useState('Muhammed Ibrahim');
  const [username, setUsername] = useState('manager');
  const [usernameOrEmail, setUsernameOrEmail] = useState('pmmuhammedibrahim786@gmail.com');
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
      if (!usernameOrEmail || !password) {
        setError('Please enter both staff username/email and password.');
        return;
      }

      setIsLoading(true);
      const success = await loginAdmin(usernameOrEmail, password);
      setIsLoading(false);

      if (!success) {
        setError('Authentication failed. Check your credentials or use quick demo buttons below.');
      }
    } else {
      if (!name || !username || !email || !password) {
        setError('Please fill in all fields (Name, Username, Email, Password) to create a staff account.');
        return;
      }

      setIsLoading(true);
      const res = await registerAdmin({ name, username, email, password, role, department });
      setIsLoading(false);

      if (!res || !res.success) {
        setError(res?.message || 'Failed to register new staff account.');
      }
    }
  };

  const handleRoleFill = (targetRole) => {
    setRole(targetRole);
    if (targetRole === 'Manager') {
      setUsername('manager');
      setUsernameOrEmail('manager');
      setEmail('pmmuhammedibrahim786@gmail.com');
      setPassword('adminpassword123');
    } else if (targetRole === 'Receptionist') {
      setUsername('receptionist');
      setUsernameOrEmail('receptionist');
      setEmail('pmmuhammedibrahim786@gmail.com');
      setPassword('receptionpassword123');
    } else if (targetRole === 'Housekeeping') {
      setUsername('housekeeping');
      setUsernameOrEmail('housekeeping');
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-x-hidden text-slate-100 font-sans">
      {/* Background Image with Dark Luxury Blur */}
      <div
        className="fixed inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')`
        }}
      />

      {/* Dark Overlays */}
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" />
      <div className="fixed inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />

      {/* Background Glowing Ambient Orbs */}
      <div className="fixed top-1/4 left-10 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Main Luxury 2-Column Wide Login Modal Container */}
      <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden my-4 sm:my-8 animate-scale-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* LEFT COLUMN: Luxury Showcase & Branding (Hidden on small mobile, visible >= lg) */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
            {/* Ambient Background Graphic */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Brand Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
                  <IconCrown size={26} />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-serif tracking-wider text-amber-400">
                    AURELIA
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Grand Resort & Spa
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  Staff Operations Portal
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enterprise hospitality console for front desk, housekeeping supervisors, and general management.
                </p>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3 py-6 hidden sm:block">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <IconBed size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">Real-Time Inventory</div>
                  <div className="text-[10px] text-slate-400">Live room status & express check-in</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <IconTrendingUp size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">Executive Financials</div>
                  <div className="text-[10px] text-slate-400">RevPAR, ADR & PDF Report Center</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <IconUsers size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">VIP Concierge</div>
                  <div className="text-[10px] text-slate-400">Room service & butler task dispatch</div>
                </div>
              </div>
            </div>

            {/* Live Sync Status Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className={isSocketConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {isSocketConnected ? 'Live Socket Connected' : 'REST Sync Active'}
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">v2.5 Enterprise</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Authentication Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 bg-slate-900/40">
            
            {/* Top Switcher: Sign In vs Staff Registration */}
            <div className="space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
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
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
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
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  {['Manager', 'Receptionist', 'Housekeeping'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleFill(r)}
                      className={`py-2 text-[11px] font-bold rounded-xl transition-all truncate px-1 ${
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

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold py-3 px-4 rounded-2xl transition-all shadow-sm group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                </svg>
                <span>Staff Sign In with Google Workspace / Gmail</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest absolute">
                  OR CREDENTIALS
                </span>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in">
                  <span>{error}</span>
                  <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
                    <IconX size={14} />
                  </button>
                </div>
              )}

              {/* Login & Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Staff Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                        placeholder="Muhammed Ibrahim"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Select Staff Username *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 font-bold">@</span>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-7 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
                          placeholder="manager786"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {authMode === 'login' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300">Staff Username or Email / Gmail *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setUsernameOrEmail('pmmuhammedibrahim786@gmail.com');
                          setError('Auto-filled: pmmuhammedibrahim786@gmail.com');
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        Auto-Fill Gmail
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="e.g. manager or pmmuhammedibrahim786@gmail.com"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Staff Email Address / Gmail *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="staff@aureliahotel.com"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">
                      {authMode === 'register' ? 'Choose Password (Min 6 chars) *' : 'Password *'}
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPassword('adminpassword123');
                          setError('Auto-filled Password: adminpassword123');
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        Reset Demo Pass
                      </button>
                    )}
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
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <IconSparkles size={16} />
                  <span>
                    {isLoading
                      ? 'Authenticating...'
                      : authMode === 'login'
                      ? `Sign In as ${role}`
                      : `Create ${role} Account`}
                  </span>
                </button>
              </form>
            </div>

            {/* Fast Demo Role Auto-Fill & Guest Portal Switcher */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span>Fast 1-Click Demo Profiles:</span>
                <span className="text-amber-400">Pre-Configured</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleFill('Manager')}
                  className="bg-slate-950 hover:bg-slate-800 border border-amber-500/30 p-2.5 rounded-xl text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-100 group-hover:text-amber-400 truncate flex items-center gap-1">
                    <span>General Manager</span>
                    <span className="text-[9px] text-amber-400">👑</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">pmmuhammedibrahim786</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleFill('Receptionist')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-100 group-hover:text-emerald-400 truncate">
                    Front Desk Reception
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">pmmuhammedibrahim786</div>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setPortalMode('guest')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <IconGlobe size={14} />
                  <span>Switch to Customer Guest Portal →</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

