import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useHotel } from '../../context/HotelContext';
import {
  IconCrown,
  IconSparkles,
  IconX,
  IconLock,
  IconMail,
  IconPhone,
  IconEye,
  IconEyeOff,
  IconCheckCircle,
  IconShield,
  IconKey,
  IconUserCheck,
  IconCalendar
} from '../Icons';

export const CustomerAuthModal = () => {
  const {
    isCustomerAuthModalOpen,
    customerAuthModalMode,
    resetEmailPlaceholder,
    closeCustomerAuthModal,
    customerLogin,
    customerRegister,
    customerForgotPassword,
    customerResetPassword,
    setActiveCustomerPage
  } = useCustomerAuth();

  const { addToast, openGoogleModal } = useHotel();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'

  // Form Inputs
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Reset Fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customerAuthModalMode) {
      setMode(customerAuthModalMode);
      setError('');
    }
    if (resetEmailPlaceholder) {
      setUsernameOrEmail(resetEmailPlaceholder);
      setEmail(resetEmailPlaceholder);
    }
  }, [customerAuthModalMode, resetEmailPlaceholder, isCustomerAuthModalOpen]);

  if (!isCustomerAuthModalOpen) return null;

  // Password Strength Calculation Helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (score <= 3) return { score: 2, text: 'Moderate', color: 'bg-amber-400', width: '60%' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-400', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(mode === 'register' ? password : newPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await customerLogin(usernameOrEmail, password, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      closeCustomerAuthModal();
      setActiveCustomerPage('dashboard');
    } else {
      setError(res.message || 'Invalid login credentials. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('Please choose a username (at least 3 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Luxury Stay & Privacy Charter.');
      return;
    }

    setIsSubmitting(true);
    const res = await customerRegister({
      name,
      username,
      email,
      phone,
      password,
      confirmPassword,
      acceptTerms
    });
    setIsSubmitting(false);

    if (res.success) {
      closeCustomerAuthModal();
      setActiveCustomerPage('dashboard');
    } else {
      setError(res.message || 'Failed to create customer account.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await customerForgotPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setGeneratedResetCode(res.resetToken);
      setResetToken(res.resetToken);
    } else {
      setError(res.message || 'Failed to request reset token.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken) {
      setError('Please enter the reset code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await customerResetPassword(resetToken, newPassword, confirmNewPassword);
    setIsSubmitting(false);

    if (res.success) {
      setMode('login');
      setPassword(newPassword);
      setError('');
    } else {
      setError(res.message || 'Failed to reset password.');
    }
  };

  const handle1ClickDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    const res = await customerLogin(demoEmail, demoPass, true);
    setIsSubmitting(false);
    if (res.success) {
      closeCustomerAuthModal();
      setActiveCustomerPage('dashboard');
    }
  };

  const handleGoogleAuthClick = () => {
    closeCustomerAuthModal();
    if (openGoogleModal) {
      openGoogleModal({
        role: 'guest',
        onSelect: () => {
          setActiveCustomerPage('dashboard');
        }
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCustomerAuthModal();
      }}
    >
      <div className="relative w-full max-w-4xl lg:max-w-5xl bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden my-auto text-slate-100 animate-scale-up">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          
          <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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

              <div className="space-y-1 pt-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  Customer Guest Lounge
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sign in or create your member profile to unlock exclusive rates, instant booking management, and VIP concierge privileges.
                </p>
              </div>
            </div>

            <div className="space-y-3 py-6 hidden sm:block">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <IconCrown size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">VIP Member Rates</div>
                  <div className="text-[10px] text-slate-400">Up to 25% off oceanfront villas & penthouses</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <IconCalendar size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">Express Digital Check-In</div>
                  <div className="text-[10px] text-slate-400">Instant keyless folio access & receipt history</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <IconSparkles size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">24/7 AI Concierge</div>
                  <div className="text-[10px] text-slate-400">Instant room dining, spa booking & butler chat</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <IconShield size={14} />
                <span className="font-semibold">256-Bit SSL Encrypted</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">Verified Hospitality</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 bg-slate-900/40">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">
                    {mode === 'login'
                      ? 'Welcome Back'
                      : mode === 'register'
                      ? 'Join Aurelia Luxury Club'
                      : mode === 'forgot'
                      ? 'Forgot Password'
                      : 'Set New Password'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {mode === 'login'
                      ? 'Access your guest dashboard & reservations'
                      : mode === 'register'
                      ? 'Create your customer account in under a minute'
                      : mode === 'forgot'
                      ? 'Enter your email to receive a password reset token'
                      : 'Create your new secure account password'}
                  </p>
                </div>

                <button
                  onClick={closeCustomerAuthModal}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <IconX size={20} />
                </button>
              </div>

              {(mode === 'login' || mode === 'register') && (
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className={`py-2.5 rounded-xl transition-all ${
                      mode === 'login'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Customer Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className={`py-2.5 rounded-xl transition-all ${
                      mode === 'register'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    New Registration
                  </button>
                </div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleAuthClick}
                    className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold py-3 px-4 rounded-2xl transition-all shadow-sm group"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                    </svg>
                    <span>Continue with Google / Gmail ID</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest absolute">
                      OR EMAIL & PASSWORD
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in">
                  <span>{error}</span>
                  <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200 flex-shrink-0">
                    <IconX size={14} />
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Username or Email Address *</label>
                    <div className="relative">
                      <IconMail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ibrahim or guest@resort.com"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300">Security Password *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <IconLock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-10 pr-12 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-amber-400 rounded"
                      />
                      <span>Remember my session</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconSparkles size={16} />
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Customer Portal'}</span>
                  </button>
                </form>
              )}

              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammed Ibrahim"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Select Username *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 font-bold">@</span>
                        <input
                          type="text"
                          required
                          placeholder="ibrahim786"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-7 pr-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="guest@resort.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 786-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-300">Choose Password *</label>
                        {password && (
                          <span className="text-[10px] font-bold text-amber-400">
                            {passwordStrength.text}
                          </span>
                        )}
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-slate-400 text-[11px] leading-tight">
                      <input
                        type="checkbox"
                        required
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="accent-amber-400 mt-0.5 rounded"
                      />
                      <span>
                        I accept the <strong className="text-slate-200">Terms of Luxury Stay</strong> and <strong className="text-slate-200">Privacy Charter</strong>.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <IconCheckCircle size={16} />
                    <span>{isSubmitting ? 'Registering Account...' : 'Complete Customer Registration'}</span>
                  </button>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Your Registered Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="pmmuhammedibrahim786@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  {generatedResetCode && (
                    <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl space-y-2">
                      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        🔐 SIMULATED RESET CODE DISPATCHED
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-100">
                        Reset Code: <span className="text-amber-400">{generatedResetCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="w-full py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                      >
                        Proceed to Reset Password →
                      </button>
                    </div>
                  )}

                  {!generatedResetCode && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-3.5 rounded-2xl shadow-lg transition-all"
                    >
                      {isSubmitting ? 'Generating Token...' : 'Send Password Reset Link'}
                    </button>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {mode === 'reset' && (
                <form onSubmit={handleResetSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Reset Verification Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RESET-786"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">New Password (Min 6 chars) *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold py-3.5 rounded-2xl shadow-lg transition-all"
                  >
                    {isSubmitting ? 'Updating Password...' : 'Save New Password & Log In'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>

            {(mode === 'login' || mode === 'register') && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span>1-Click Fast VIP Demo Logins:</span>
                  <span className="text-amber-400">Pre-Verified</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handle1ClickDemoLogin('pmmuhammedibrahim786@gmail.com', 'customerpassword123')
                    }
                    className="bg-slate-950 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 p-2.5 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-100 group-hover:text-amber-400 truncate flex items-center gap-1">
                      <span>Muhammed Ibrahim</span>
                      <span className="text-[9px] text-amber-400">👑</span>
                    </div>
                    <div className="text-[9px] text-amber-400 font-semibold truncate">
                      Diamond VIP • Suite 401
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handle1ClickDemoLogin('alexander.wright@royals.co.uk', 'customerpassword123')
                    }
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-slate-100 group-hover:text-amber-400 truncate">
                      Lord Alexander
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Gold VIP Member</div>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
