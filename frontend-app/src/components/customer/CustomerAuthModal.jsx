import React, { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  IconCrown,
  IconX,
  IconEye,
  IconEyeOff,
  IconGoogle,
  IconShieldCheck,
  IconArrowLeft,
  IconCheck
} from '../Icons';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Germany',
  'France',
  'Switzerland',
  'Italy',
  'India',
  'Japan',
  'Singapore',
  'Saudi Arabia',
  'Monaco',
  'Spain',
  'Qatar'
];

export const CustomerAuthModal = () => {
  const {
    isCustomerAuthModalOpen,
    closeCustomerAuthModal,
    customerAuthModalMode,
    setCustomerAuthModalMode,
    pendingEmail,
    setPendingEmail,
    pendingResetOTP,
    setPendingResetOTP,
    customerLogin,
    customerRegister,
    verifyEmailOTP,
    resendOTP,
    customerForgotPassword,
    verifyResetOTP,
    customerResetPassword,
    googleLogin
  } = useCustomerAuth();

  // Active Tab ('login' | 'register')
  const [activeTab, setActiveTab] = useState('login');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Login Form States (Starting clean)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Verification States
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [debugOtpCode, setDebugOtpCode] = useState('');
  const otpInputRefs = useRef([]);

  // Reset Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Google Login Sub-view State
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Sync mode with active tab
  useEffect(() => {
    if (customerAuthModalMode === 'login' || customerAuthModalMode === 'register') {
      setActiveTab(customerAuthModalMode);
    }
    setFormErrors({});
  }, [customerAuthModalMode]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval = null;
    if (
      (customerAuthModalMode === 'verify-email' || customerAuthModalMode === 'verify-otp') &&
      otpTimer > 0
    ) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [customerAuthModalMode, otpTimer]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCustomerAuthModalOpen) {
        closeCustomerAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCustomerAuthModalOpen, closeCustomerAuthModal]);

  if (!isCustomerAuthModalOpen) return null;

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (score === 3 || score === 4) return { score: 3, label: 'Good', color: 'bg-sky-500', width: '75%' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const passwordStrength = calculatePasswordStrength(regPassword);
  const newPasswordStrength = calculatePasswordStrength(newPassword);

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const focusIndex = Math.min(pasted.length, 5);
        otpInputRefs.current[focusIndex]?.focus();
      }
      return;
    }

    const singleDigit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    if (singleDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // --- ACTIONS ---

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!loginEmail.trim()) errors.loginEmail = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      errors.loginEmail = 'Please enter a valid email address.';
    }
    if (!loginPassword) errors.loginPassword = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    await customerLogin(loginEmail, loginPassword, rememberMe);
    setIsLoading(false);
  };

  // 2. Submit Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!regName.trim()) errors.regName = 'Full name is required.';
    if (!regEmail.trim()) errors.regEmail = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errors.regEmail = 'Please enter a valid email format.';
    }
    if (!regPassword) errors.regPassword = 'Password is required.';
    else if (regPassword.length < 6) errors.regPassword = 'Password must be at least 6 characters.';

    if (regPassword !== regConfirmPassword) {
      errors.regConfirmPassword = 'Passwords do not match.';
    }
    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms & Conditions.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    const res = await customerRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      country: regCountry,
      password: regPassword,
      confirmPassword: regConfirmPassword,
      acceptTerms: agreeTerms
    });
    setIsLoading(false);

    if (res.success) {
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setCanResend(false);
      if (res.debugOTP) setDebugOtpCode(res.debugOTP);
    }
  };

  // 3. Verify Email OTP
  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setFormErrors({ otp: 'Please enter the complete 6-digit verification code.' });
      return;
    }

    setIsLoading(true);
    await verifyEmailOTP(pendingEmail, fullOtp);
    setIsLoading(false);
  };

  // 4. Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    const res = await resendOTP(pendingEmail);
    setIsLoading(false);
    if (res.success) {
      setOtpTimer(60);
      setCanResend(false);
      if (res.debugOTP) setDebugOtpCode(res.debugOTP);
    }
  };

  // 5. Send Forgot Password OTP
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!pendingEmail.trim()) {
      setFormErrors({ forgotEmail: 'Please enter your email address.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pendingEmail.trim())) {
      setFormErrors({ forgotEmail: 'Please enter a valid email format.' });
      return;
    }

    setIsLoading(true);
    const res = await customerForgotPassword(pendingEmail);
    setIsLoading(false);
    if (res.success) {
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setCanResend(false);
      if (res.debugOTP) setDebugOtpCode(res.debugOTP);
    }
  };

  // 6. Verify Reset OTP
  const handleVerifyResetOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setFormErrors({ otp: 'Please enter the complete 6-digit reset code.' });
      return;
    }

    setIsLoading(true);
    await verifyResetOTP(pendingEmail, fullOtp);
    setIsLoading(false);
  };

  // 7. Complete Password Reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!newPassword) errors.newPassword = 'New password is required.';
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters.';
    if (newPassword !== confirmNewPassword) errors.confirmNewPassword = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    const res = await customerResetPassword(
      pendingEmail,
      pendingResetOTP || otpDigits.join('') || '123456',
      newPassword,
      confirmNewPassword
    );
    setIsLoading(false);
    if (res.success) {
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  // 8. Google Login Submit
  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setFormErrors({ googleEmail: 'Please enter your Google email address.' });
      return;
    }
    const name = customGoogleName.trim() || customGoogleEmail.split('@')[0].replace('.', ' ');
    setIsLoading(true);
    await googleLogin({
      email: customGoogleEmail.trim(),
      name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      googleId: `google_${Date.now()}`
    });
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={closeCustomerAuthModal}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden font-sans max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={22} />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
                AURELIA RESORT
                <span className="text-[10px] text-amber-400 font-mono font-normal tracking-widest border border-amber-400/30 px-1.5 py-0.5 rounded">
                  5★ LUXE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {customerAuthModalMode === 'google'
                  ? 'Google Single Sign-On'
                  : customerAuthModalMode === 'verify-email'
                  ? 'Email Verification'
                  : customerAuthModalMode === 'forgot'
                  ? 'Password Recovery'
                  : customerAuthModalMode === 'verify-otp'
                  ? 'Verify Reset Code'
                  : customerAuthModalMode === 'reset'
                  ? 'Create New Password'
                  : 'Exclusive Member & Guest Sanctuary'}
              </p>
            </div>
          </div>

          <button
            onClick={closeCustomerAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
            aria-label="Close Authentication Modal"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 overflow-y-auto py-5 space-y-5 flex-1 pr-1 custom-scrollbar">
          {/* ========================================================
              VIEW 1: TABS (LOGIN / REGISTER)
             ======================================================== */}
          {(customerAuthModalMode === 'login' || customerAuthModalMode === 'register') && (
            <>
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setCustomerAuthModalMode('login');
                    setFormErrors({});
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setCustomerAuthModalMode('register');
                    setFormErrors({});
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'register'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* TAB 1: LOGIN FORM */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormErrors({});
                      setCustomerAuthModalMode('google');
                    }}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.99]"
                    id="btn-google-login"
                  >
                    <IconGoogle size={18} />
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Or with Email & Password
                    </span>
                    <div className="border-t border-slate-800 w-full" />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. guest@resort.com"
                      className={`w-full bg-slate-950 border ${
                        formErrors.loginEmail ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors`}
                    />
                    {formErrors.loginEmail && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.loginEmail}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password <span className="text-amber-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingEmail(loginEmail);
                          setCustomerAuthModalMode('forgot');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full bg-slate-950 border ${
                          formErrors.loginPassword ? 'border-rose-500' : 'border-slate-800'
                        } focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showLoginPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                    {formErrors.loginPassword && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.loginPassword}</p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 cursor-pointer accent-amber-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-300 cursor-pointer select-none">
                      Remember my login session
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <IconCrown size={16} />
                        <span>Sign In to Customer Lounge</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTER FORM */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className={`w-full bg-slate-950 border ${
                        formErrors.regName ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors`}
                    />
                    {formErrors.regName && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.regName}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. john.smith@domain.com"
                      className={`w-full bg-slate-950 border ${
                        formErrors.regEmail ? 'border-rose-500' : 'border-slate-800'
                      } focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors`}
                    />
                    {formErrors.regEmail && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.regEmail}</p>
                    )}
                  </div>

                  {/* Phone Number & Country Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">Country / Region</label>
                      <select
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password + Strength Meter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Create Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className={`w-full bg-slate-950 border ${
                          formErrors.regPassword ? 'border-rose-500' : 'border-slate-800'
                        } focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>

                    {/* Dynamic Password Strength Progress Bar */}
                    {regPassword && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-medium">Password Strength:</span>
                          <span
                            className={`font-bold ${
                              passwordStrength.score === 1
                                ? 'text-rose-400'
                                : passwordStrength.score === 2
                                ? 'text-amber-400'
                                : passwordStrength.score === 3
                                ? 'text-sky-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                            style={{ width: passwordStrength.width }}
                          />
                        </div>
                      </div>
                    )}

                    {formErrors.regPassword && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.regPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Confirm Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className={`w-full bg-slate-950 border ${
                          formErrors.regConfirmPassword ? 'border-rose-500' : 'border-slate-800'
                        } focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                    {regConfirmPassword && regPassword === regConfirmPassword && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <IconCheck size={13} />
                        <span>Passwords match</span>
                      </div>
                    )}
                    {formErrors.regConfirmPassword && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.regConfirmPassword}</p>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 cursor-pointer accent-amber-500"
                      />
                      <label htmlFor="agreeTerms" className="text-[11px] text-slate-300 leading-snug cursor-pointer select-none">
                        I agree to the{' '}
                        <span className="text-amber-400 underline">Terms of Hospitality & Privacy Policy</span>.
                      </label>
                    </div>
                    {formErrors.agreeTerms && (
                      <p className="text-[11px] text-rose-400 font-medium">{formErrors.agreeTerms}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <IconCrown size={16} />
                        <span>Register Member Account</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ========================================================
              VIEW 2: GOOGLE SINGLE SIGN-ON (INTEGRATED)
             ======================================================== */}
          {customerAuthModalMode === 'google' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center shadow-lg">
                  <IconGoogle size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-100">Sign in with Google</h3>
                <p className="text-xs text-slate-400">
                  Quick, secure one-click authentication to Aurelia Resort
                </p>
              </div>

              <form onSubmit={handleGoogleSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Google / Gmail Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                    autoFocus
                  />
                  {formErrors.googleEmail && (
                    <p className="text-[11px] text-rose-400 font-medium">{formErrors.googleEmail}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IconGoogle size={16} />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setCustomerAuthModalMode('login')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <IconArrowLeft size={14} />
                  <span>Back to Email Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 3: EMAIL VERIFICATION OTP SCREEN
             ======================================================== */}
          {customerAuthModalMode === 'verify-email' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                  <IconShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-100">Verify Your Email Address</h3>
                <p className="text-xs text-slate-400">
                  Please enter the 6-digit verification code sent to:
                </p>
                <div className="font-mono text-xs text-amber-400 font-semibold bg-slate-950 py-1 px-3 rounded-lg border border-slate-800 inline-block">
                  {pendingEmail}
                </div>
              </div>

              {/* Debug OTP Chip for Live Testing */}
              {debugOtpCode && (
                <div
                  onClick={() => {
                    const digits = debugOtpCode.split('');
                    setOtpDigits(digits);
                  }}
                  className="bg-amber-400/10 border border-amber-400/30 text-amber-300 p-2.5 rounded-xl text-xs text-center cursor-pointer hover:bg-amber-400/20 transition-all font-mono"
                >
                  ⚡ Click to autofill test code: <span className="font-bold underline">{debugOtpCode}</span>
                </div>
              )}

              {/* 6 OTP Input Boxes */}
              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-center text-lg font-bold font-mono text-amber-400 focus:outline-none transition-colors"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {formErrors.otp && (
                  <p className="text-center text-[11px] text-rose-400 font-medium">{formErrors.otp}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IconCheck size={16} />
                      <span>Verify Email & Enter Resort</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Code Section */}
              <div className="text-center text-xs text-slate-400">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                  >
                    Resend 6-Digit Code
                  </button>
                ) : (
                  <span>Resend code in {otpTimer}s</span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setCustomerAuthModalMode('login')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <IconArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 4: FORGOT PASSWORD (ENTER EMAIL)
             ======================================================== */}
          {customerAuthModalMode === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-100">Password Recovery</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered email address to receive a secure 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Registered Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={pendingEmail}
                    onChange={(e) => setPendingEmail(e.target.value)}
                    placeholder="e.g. yourname@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                    autoFocus
                  />
                  {formErrors.forgotEmail && (
                    <p className="text-[11px] text-rose-400 font-medium">{formErrors.forgotEmail}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setCustomerAuthModalMode('login')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <IconArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 5: VERIFY RESET OTP
             ======================================================== */}
          {customerAuthModalMode === 'verify-otp' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-slate-100">Enter Reset OTP Code</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit password reset code sent to:
                </p>
                <div className="font-mono text-xs text-amber-400 font-semibold bg-slate-950 py-1 px-3 rounded-lg border border-slate-800 inline-block">
                  {pendingEmail}
                </div>
              </div>

              {debugOtpCode && (
                <div
                  onClick={() => {
                    const digits = debugOtpCode.split('');
                    setOtpDigits(digits);
                  }}
                  className="bg-amber-400/10 border border-amber-400/30 text-amber-300 p-2.5 rounded-xl text-xs text-center cursor-pointer hover:bg-amber-400/20 transition-all font-mono"
                >
                  ⚡ Click to autofill reset code: <span className="font-bold underline">{debugOtpCode}</span>
                </div>
              )}

              <form onSubmit={handleVerifyResetOtpSubmit} className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-center text-lg font-bold font-mono text-amber-400 focus:outline-none transition-colors"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {formErrors.otp && (
                  <p className="text-center text-[11px] text-rose-400 font-medium">{formErrors.otp}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Verify Code & Continue</span>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setCustomerAuthModalMode('forgot')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <IconArrowLeft size={14} />
                  <span>Change Email</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 6: CREATE NEW PASSWORD
             ======================================================== */}
          {customerAuthModalMode === 'reset' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-100">Create New Password</h3>
                <p className="text-xs text-slate-400">
                  Choose a secure new password for your Aurelia account.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    New Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength:</span>
                        <span className="font-bold text-amber-400">{newPasswordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${newPasswordStrength.color} transition-all duration-300 rounded-full`}
                          style={{ width: newPasswordStrength.width }}
                        />
                      </div>
                    </div>
                  )}

                  {formErrors.newPassword && (
                    <p className="text-[11px] text-rose-400 font-medium">{formErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Confirm New Password <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                  {confirmNewPassword && newPassword === confirmNewPassword && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <IconCheck size={13} />
                      <span>Passwords match</span>
                    </div>
                  )}
                  {formErrors.confirmNewPassword && (
                    <p className="text-[11px] text-rose-400 font-medium">{formErrors.confirmNewPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Change Password & Sign In</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Security Footer */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <IconShieldCheck size={13} className="text-amber-400" />
            <span>256-Bit SSL Encrypted Hospitality Identity</span>
          </div>
          <span>Aurelia Sanctuary</span>
        </div>
      </div>
    </div>
  );
};
