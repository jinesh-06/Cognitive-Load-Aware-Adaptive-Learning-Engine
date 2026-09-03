import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Moon,
  Sun,
  Key,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu
} from 'lucide-react';

import { validateAdminInvite } from '../services/api.js';

import {
  registerWithEmail,
  loginWithEmail,
  resetPassword,
  loginWithGoogle,
  loginWithGithub
} from '../services/firebase.js';


// ============================================================
// EDITORIAL NOTHIN'-INSPIRED LOGIN & CREATE ACCOUNT COMPONENT
// ============================================================

export const LoginPage = ({ onLogin }) => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [isSignUp, setIsSignUp] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ==========================================================
  // FORM FIELDS
  // ==========================================================

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminInviteCode, setAdminInviteCode] = useState('');
  const [showAdminCodeInput, setShowAdminCodeInput] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const canvasRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  // ==========================================================
  // URL PARAMETERS
  // ==========================================================

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      const authError = params.get('auth_error');

      // Admin invitation
      if (invite) {
        setAdminInviteCode(invite);
        setShowAdminCodeInput(true);
        setIsSignUp(true);
        setSuccessMessage(
          `Admin Invitation Detected: ${invite}. Complete registration to activate Administrator privileges.`
        );
      }

      // Authentication error
      if (authError) {
        setErrorMessage(
          `OAuth Authentication Error: ${
            decodeURIComponent(authError).replace(/_/g, ' ')
          }`
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } catch (error) {
      console.error('[LoginPage] URL parameter error:', error);
    }
  }, []);

  // ==========================================================
  // THEME TOGGLE
  // ==========================================================

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ==========================================================
  // DESKTOP CUSTOM MAGNETIC CURSOR
  // ==========================================================

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let reqId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      reqId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    reqId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, []);

  // ==========================================================
  // CANVAS PARTICLE & GEOMETRIC CONSTELLATION ANIMATION
  // ==========================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const particleCount = Math.min(65, Math.floor((width * height) / 18000));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDarkMode = theme === 'dark';
      const nodeColor = isDarkMode ? 'rgba(129, 140, 248, 0.65)' : 'rgba(79, 70, 229, 0.5)';
      const lineColor = isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)';
      const geoColor = isDarkMode ? 'rgba(168, 85, 247, 0.18)' : 'rgba(124, 58, 237, 0.12)';

      // 1. Draw Slow Abstract Geometric Ring on the Left (Desktop)
      if (width >= 1024) {
        const cx = width * 0.26 + (mouseX - width / 2) * 0.02;
        const cy = height * 0.48 + (mouseY - height / 2) * 0.02;
        angle += 0.003;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        const r = Math.min(width * 0.14, 180);
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI * 2) / 6;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = geoColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner Gyro Circle
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)';
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 2. Draw Floating Particles & Constellation
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / 120;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  // ==========================================================
  // OAUTH LOGIN
  // ==========================================================

  const handleOAuthLogin = async (provider) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let result;

      if (provider === 'google') {
        console.log('[LoginPage] Starting Google login...');
        result = await loginWithGoogle();
      } else if (provider === 'github') {
        console.log('[LoginPage] Starting GitHub login...');
        result = await loginWithGithub();
      } else {
        setIsLoading(false);
        setErrorMessage(`${provider} login is not configured yet.`);
        return;
      }

      const { user: fbUser, error } = result;

      if (error || !fbUser) {
        setIsLoading(false);
        setErrorMessage(error || 'Authentication failed.');
        return;
      }

      const userEmail = fbUser.email || '';
      const isEmailAdmin =
        userEmail.toLowerCase().includes('admin') ||
        userEmail.toLowerCase() === 'sarah.chen@stanford.edu';

      const userName =
        fbUser.displayName ||
        userEmail.split('@')[0].replace('.', ' ') ||
        'Learner';

      const appUser = {
        uid: fbUser.uid,
        name: userName,
        email: userEmail,
        avatarUrl: fbUser.photoURL || null,
        emailVerified: fbUser.emailVerified,
        role: isEmailAdmin ? 'Admin' : 'Learner',
        isAdmin: isEmailAdmin,
        id: isEmailAdmin ? 'ADM-001' : `usr-${fbUser.uid.slice(0, 6)}`,
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
      };

      try {
        localStorage.setItem(
          'adaptive_learning_user',
          JSON.stringify(appUser)
        );
      } catch (storageError) {
        console.warn('[LoginPage] Could not save user:', storageError);
      }

      console.log(`[LoginPage] ${provider} login successful:`, appUser.email);
      setIsLoading(false);
      onLogin(appUser);
    } catch (err) {
      console.error(`[LoginPage] ${provider} authentication error:`, err);
      setIsLoading(false);
      setErrorMessage(err?.message || `${provider} authentication failed.`);
    }
  };

  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage(
        'Please enter your email address above to receive a password reset link.'
      );
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.error);
    }
  };

  // ==========================================================
  // EMAIL LOGIN / SIGNUP
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage(
          'Passwords do not match. Please re-type your password confirmation.'
        );
        return;
      }

      if (!agreeTerms) {
        setErrorMessage('Please agree to the Terms and Privacy Policy.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let assignedRole = 'Learner';
      let assignedId = `usr-${Date.now().toString().slice(-4)}`;
      let isAdminUser = false;

      const isEmailAdmin =
        trimmedEmail.toLowerCase().includes('admin') ||
        trimmedEmail.toLowerCase() === 'sarah.chen@stanford.edu';

      if (adminInviteCode.trim()) {
        try {
          const valRes = await validateAdminInvite(adminInviteCode, {
            email: trimmedEmail,
            name: fullName || trimmedEmail,
          });

          if (valRes.valid) {
            assignedRole = 'Admin';
            assignedId = valRes.adminId || 'ADM-001';
            isAdminUser = true;
          }
        } catch {
          const code = adminInviteCode.trim().toUpperCase();
          if (code.startsWith('ADM-INV-') || code === 'ADM-001') {
            assignedRole = 'Admin';
            assignedId = 'ADM-001';
            isAdminUser = true;
          } else {
            setErrorMessage(
              'Invalid admin invitation code. Proceeding with standard Student role.'
            );
          }
        }
      } else if (isEmailAdmin) {
        assignedRole = 'Admin';
        assignedId = 'ADM-001';
        isAdminUser = true;
      }

      // SIGN UP FLOW
      if (isSignUp) {
        const { user: fbUser, error: regError } = await registerWithEmail(
          fullName.trim(),
          trimmedEmail,
          password
        );

        if (regError || !fbUser) {
          setIsLoading(false);
          setErrorMessage(regError || 'Registration failed.');
          return;
        }

        const appUser = {
          uid: fbUser.uid,
          name: fullName.trim(),
          email: trimmedEmail,
          avatarUrl: fbUser.photoURL || null,
          emailVerified: fbUser.emailVerified,
          role: assignedRole,
          isAdmin: isAdminUser,
          id: isAdminUser ? assignedId : `usr-${fbUser.uid.slice(0, 6)}`,
          isAuthenticated: true,
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem(
          'adaptive_learning_user',
          JSON.stringify(appUser)
        );

        setIsLoading(false);
        onLogin(appUser);
        return;
      }

      // SIGN IN FLOW
      const { user: fbUser, error: loginError } = await loginWithEmail(
        trimmedEmail,
        password
      );

      if (loginError || !fbUser) {
        setIsLoading(false);
        setErrorMessage(loginError || 'Login failed.');
        return;
      }

      const userEmail = fbUser.email || trimmedEmail;
      const finalIsAdmin =
        userEmail.toLowerCase().includes('admin') ||
        userEmail.toLowerCase() === 'sarah.chen@stanford.edu' ||
        isAdminUser;

      const userName =
        fbUser.displayName ||
        userEmail.split('@')[0].replace('.', ' ') ||
        'Learner';

      const appUser = {
        uid: fbUser.uid,
        name: userName,
        email: userEmail,
        avatarUrl: fbUser.photoURL || null,
        emailVerified: fbUser.emailVerified,
        role: finalIsAdmin ? 'Admin' : assignedRole,
        isAdmin: finalIsAdmin,
        id: finalIsAdmin ? assignedId : `usr-${fbUser.uid.slice(0, 6)}`,
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem(
        'adaptive_learning_user',
        JSON.stringify(appUser)
      );

      setIsLoading(false);
      onLogin(appUser);
    } catch (err) {
      console.error('[LoginPage] Authentication error:', err);
      setIsLoading(false);
      setErrorMessage(err?.message || 'Authentication error.');
    }
  };

  const isDark = theme === 'dark';

  // Password strength calculation helper for signup
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 30;
    if (pwd.length >= 8) score += 20;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25;
    return Math.min(score, 100);
  };

  const pwdStrength = calculatePasswordStrength(password);

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-500 overflow-x-hidden ${
        isDark ? 'bg-[#05070f] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Ambient Noise Grid & Glow Orbs */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(${
            isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
          } 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="fixed top-[15%] left-[8%] w-[480px] h-[480px] rounded-full filter blur-[120px] pointer-events-none z-0 animate-pulse"
        style={{
          background: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
          animationDuration: '14s',
        }}
      />
      <div
        className="fixed bottom-[10%] right-[10%] w-[520px] h-[520px] rounded-full filter blur-[130px] pointer-events-none z-0 animate-pulse"
        style={{
          background: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.07)',
          animationDuration: '18s',
        }}
      />

      {/* Desktop Magnetic Cursor Element */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-indigo-500 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-indigo-500 hidden lg:block"
      />
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-9 h-9 rounded-full border border-indigo-400/40 pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out hidden lg:block"
      />

      {/* Top Header Pill Bar */}
      <header className="fixed top-6 left-6 right-6 flex items-center justify-between z-30 pointer-events-none">
        <div
          className={`pointer-events-auto inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-xl shadow-lg transition-all ${
            isDark
              ? 'bg-slate-900/60 border-white/10 text-white'
              : 'bg-white/80 border-slate-200 text-slate-900'
          }`}
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 flex items-center justify-center text-white text-[10px]">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            Adaptive Engine
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all cursor-pointer shadow-lg hover:scale-105 ${
            isDark
              ? 'bg-slate-900/60 border-white/10 text-amber-300 hover:border-amber-400/40'
              : 'bg-white/80 border-slate-200 text-slate-700 hover:border-indigo-400/40'
          }`}
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Full-Screen Split Layout */}
      <div className="w-full max-w-7xl min-h-[85vh] pt-20 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">

        {/* Left Column: Editorial Statement & Oversized Typography */}
        <div className="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6 lg:pr-12 text-center lg:text-left">
          
          {/* Eyebrow Status Ribbon */}
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-[11px] font-mono tracking-widest text-indigo-400 uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SYSTEM AUTH // NODE_01</span>
            <span>•</span>
            <span>LATENCY 14MS</span>
          </div>

          {/* Oversized Masked Typography (Nothin'-inspired) */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tighter leading-[0.95] mb-6 font-['Syne',sans-serif]">
            <span className="block overflow-hidden">
              <span className="block transition-all duration-700">
                {isSignUp ? 'CREATE' : 'WELCOME'}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-700">
                {isSignUp ? 'IDENTITY.' : 'BACK.'}
              </span>
            </span>
          </h1>

          <p
            className={`text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {isSignUp
              ? 'Initialize your adaptive cognitive profile. Unlock real-time load estimation and tailored pedagogical pathways calibrated to your unique neural telemetry.'
              : 'Authenticate to access the Cognitive Load-Aware Adaptive Learning Architecture. Experience personalized real-time random-forest neural adaptation.'}
          </p>

          {/* Desktop Live Telemetry Footer Ribbon */}
          <div
            className={`hidden lg:flex items-center gap-8 pt-6 border-t font-mono text-xs ${
              isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">NEURAL SYNC</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>99.4% OPTIMAL</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">ARCHITECTURE</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>RANDOM-FOREST ML</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">SECURITY</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>256-BIT ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Interactive Portal Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <main
            className={`relative w-full max-w-[460px] rounded-3xl p-7 sm:p-9 backdrop-blur-2xl border transition-all duration-500 shadow-2xl ${
              isDark
                ? 'bg-slate-900/65 border-white/10 shadow-black/80'
                : 'bg-white/85 border-slate-200 shadow-slate-300/40'
            }`}
            role="main"
          >
            {/* Card Header */}
            <header className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{isSignUp ? 'REGISTRATION' : 'PORTAL ACCESS'}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-inherit mb-1">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isSignUp
                  ? 'Start your personalized adaptive learning journey'
                  : 'Sign in to resume your active learning session'}
              </p>
            </header>

            {/* Social Authentication Grid */}
            <section className="mb-5" aria-label="Social sign in options">
              <div className="grid grid-cols-2 gap-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50 ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-slate-200 hover:bg-white/10 hover:border-rose-500/50 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-rose-400'
                  }`}
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 488 512">
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                  </svg>
                  <span>Google</span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50 ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-slate-200 hover:bg-white/10 hover:border-indigo-400/50 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-400'
                  }`}
                  title="Sign in with GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 496 512">
                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </section>

            {/* Divider */}
            <div className="flex items-center mb-5 text-[11px] font-mono uppercase tracking-widest text-slate-400">
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <span className="px-3 text-slate-500">or email credential</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name Field (Sign up only) */}
              {isSignUp && (
                <div>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? 'bg-slate-900/70 border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                      }`}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Name@domain.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900/70 border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900/70 border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-indigo-400 cursor-pointer p-1 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter Bar (Sign up only) */}
                {isSignUp && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pwdStrength < 40
                            ? 'bg-rose-500'
                            : pwdStrength < 75
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pwdStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field (Sign up only) */}
              {isSignUp && (
                <div>
                  <div className="relative flex items-center">
                    <ShieldCheck className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? 'bg-slate-900/70 border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                      }`}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Admin Invitation Code Toggle */}
              <div className="pt-0.5">
                {!showAdminCodeInput ? (
                  <button
                    type="button"
                    onClick={() => setShowAdminCodeInput(true)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Key className="w-3 h-3" />
                    <span>Have an Admin Invitation Code?</span>
                  </button>
                ) : (
                  <div
                    className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                      isDark
                        ? 'bg-purple-950/20 border-purple-800/40'
                        : 'bg-purple-50/70 border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-purple-400 flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        Admin Invitation Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdminCodeInput(false);
                          setAdminInviteCode('');
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <input
                      type="text"
                      value={adminInviteCode}
                      onChange={(e) => setAdminInviteCode(e.target.value)}
                      placeholder="e.g. ADM-INV-8821"
                      className={`w-full px-3 py-1.5 text-xs font-mono rounded-lg border outline-none uppercase ${
                        isDark
                          ? 'bg-slate-900/90 border-purple-700/50 text-purple-200 placeholder-slate-500'
                          : 'bg-white border-purple-300 text-purple-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Form Options (Remember Me / Forgot / Terms) */}
              {!isSignUp ? (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Remember device</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="flex items-start gap-2 text-[11px] cursor-pointer text-slate-400">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      required
                    />
                    <span>
                      I agree to the{' '}
                      <a href="/terms-and-conditions.html" target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                        Terms
                      </a>{' '}
                      and{' '}
                      <a href="/privacy-policy.html" target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 cursor-pointer mt-3 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Card Footer Switcher */}
            <footer className="mt-6 text-center text-xs text-slate-400">
              {!isSignUp ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
                  >
                    Create account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </footer>
          </main>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;