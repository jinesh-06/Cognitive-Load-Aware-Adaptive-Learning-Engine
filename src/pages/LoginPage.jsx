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
  Key
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
// LOGIN PAGE
// ============================================================

export const LoginPage = ({ onLogin }) => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [isSignUp, setIsSignUp] = useState(false);

  const [theme, setTheme] = useState('dark');

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  // ==========================================================
  // FORM FIELDS
  // ==========================================================

  const [fullName, setFullName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [adminInviteCode, setAdminInviteCode] =
    useState('');

  const [showAdminCodeInput, setShowAdminCodeInput] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [agreeTerms, setAgreeTerms] =
    useState(true);

  const canvasRef = useRef(null);


  // ==========================================================
  // URL PARAMETERS
  // ==========================================================

  useEffect(() => {

    try {

      const params =
        new URLSearchParams(window.location.search);

      const invite =
        params.get('invite');

      const authError =
        params.get('auth_error');


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
            decodeURIComponent(authError)
              .replace(/_/g, ' ')
          }`
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

    } catch (error) {

      console.error(
        '[LoginPage] URL parameter error:',
        error
      );

    }

  }, []);


  // ==========================================================
  // THEME TOGGLE
  // ==========================================================

  const toggleTheme = () => {

    setTheme(prev =>
      prev === 'dark'
        ? 'light'
        : 'dark'
    );

  };


  // ==========================================================
  // CANVAS PARTICLE ANIMATION
  // ==========================================================

  useEffect(() => {

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext('2d');

    let animationFrameId;

    let width =
      (canvas.width =
        window.innerWidth);

    let height =
      (canvas.height =
        window.innerHeight);


    const handleResize = () => {

      width =
        canvas.width =
          window.innerWidth;

      height =
        canvas.height =
          window.innerHeight;

    };


    window.addEventListener(
      'resize',
      handleResize
    );


    const particleCount =
      Math.min(
        80,
        Math.floor(
          (width * height) / 14000
        )
      );


    const particles = [];


    for (
      let i = 0;
      i < particleCount;
      i++
    ) {

      particles.push({

        x:
          Math.random() *
          width,

        y:
          Math.random() *
          height,

        vx:
          (Math.random() - 0.5) *
          0.8,

        vy:
          (Math.random() - 0.5) *
          0.8,

        radius:
          Math.random() * 2 + 1

      });

    }


    const render = () => {

      ctx.clearRect(
        0,
        0,
        width,
        height
      );


      const isDark =
        theme === 'dark';


      const nodeColor =
        isDark
          ? 'rgba(129, 140, 248, 0.7)'
          : 'rgba(79, 70, 229, 0.6)';


      const lineColor =
        isDark
          ? 'rgba(99, 102, 241, 0.12)'
          : 'rgba(99, 102, 241, 0.08)';


      for (
        let i = 0;
        i < particles.length;
        i++
      ) {

        const p =
          particles[i];


        p.x += p.vx;

        p.y += p.vy;


        if (p.x < 0)
          p.x = width;

        if (p.x > width)
          p.x = 0;

        if (p.y < 0)
          p.y = height;

        if (p.y > height)
          p.y = 0;


        // Particle

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          p.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          nodeColor;

        ctx.fill();


        // Connections

        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {

          const p2 =
            particles[j];

          const dx =
            p.x - p2.x;

          const dy =
            p.y - p2.y;

          const dist =
            Math.sqrt(
              dx * dx +
              dy * dy
            );


          if (dist < 130) {

            ctx.beginPath();

            ctx.moveTo(
              p.x,
              p.y
            );

            ctx.lineTo(
              p2.x,
              p2.y
            );

            ctx.strokeStyle =
              lineColor;

            ctx.lineWidth =
              1 - dist / 130;

            ctx.stroke();

          }

        }

      }


      animationFrameId =
        requestAnimationFrame(
          render
        );

    };


    render();


    return () => {

      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

    };

  }, [theme]);


  // ==========================================================
  // OAUTH LOGIN
  // ==========================================================

  const handleOAuthLogin =
    async (provider) => {

      setIsLoading(true);

      setErrorMessage('');

      setSuccessMessage('');


      try {

        let result;


        // ----------------------------------------------------
        // GOOGLE
        // ----------------------------------------------------

        if (provider === 'google') {

          console.log(
            '[LoginPage] Starting Google login...'
          );

          result =
            await loginWithGoogle();

        }


        // ----------------------------------------------------
        // GITHUB
        // ----------------------------------------------------

        else if (provider === 'github') {

          console.log(
            '[LoginPage] Starting GitHub login...'
          );

          result =
            await loginWithGithub();

        }


        // ----------------------------------------------------
        // OTHER PROVIDERS
        // ----------------------------------------------------

        else {

          setIsLoading(false);

          setErrorMessage(
            `${provider} login is not configured yet.`
          );

          return;

        }


        // ----------------------------------------------------
        // CHECK RESULT
        // ----------------------------------------------------

        const {
          user: fbUser,
          error
        } = result;


        if (error || !fbUser) {

          setIsLoading(false);

          setErrorMessage(
            error ||
            'Authentication failed.'
          );

          return;

        }


        // ----------------------------------------------------
        // USER EMAIL
        // ----------------------------------------------------

        const userEmail =
          fbUser.email ||
          '';


        // ----------------------------------------------------
        // ADMIN CHECK
        // ----------------------------------------------------

        const isEmailAdmin =
          userEmail
            .toLowerCase()
            .includes('admin') ||
          userEmail
            .toLowerCase() ===
            'sarah.chen@stanford.edu';


        // ----------------------------------------------------
        // USER NAME
        // ----------------------------------------------------

        const userName =
          fbUser.displayName ||
          userEmail
            .split('@')[0]
            .replace('.', ' ') ||
          'Learner';


        // ----------------------------------------------------
        // APPLICATION USER
        // ----------------------------------------------------

        const appUser = {

          uid:
            fbUser.uid,

          name:
            userName,

          email:
            userEmail,

          avatarUrl:
            fbUser.photoURL ||
            null,

          emailVerified:
            fbUser.emailVerified,

          role:
            isEmailAdmin
              ? 'Admin'
              : 'Learner',

          isAdmin:
            isEmailAdmin,

          id:
            isEmailAdmin
              ? 'ADM-001'
              : `usr-${fbUser.uid.slice(0, 6)}`,

          isAuthenticated:
            true,

          loginTime:
            new Date().toISOString()

        };


        // ----------------------------------------------------
        // SAVE USER
        // ----------------------------------------------------

        try {

          localStorage.setItem(
            'adaptive_learning_user',
            JSON.stringify(appUser)
          );

        } catch (storageError) {

          console.warn(
            '[LoginPage] Could not save user:',
            storageError
          );

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        console.log(
          `[LoginPage] ${provider} login successful:`,
          appUser.email
        );


        setIsLoading(false);

        onLogin(appUser);

      } catch (err) {

        console.error(
          `[LoginPage] ${provider} authentication error:`,
          err
        );

        setIsLoading(false);

        setErrorMessage(
          err?.message ||
          `${provider} authentication failed.`
        );

      }

    };


  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  const handleForgotPassword =
    async (e) => {

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


      const result =
        await resetPassword(
          email.trim()
        );


      setIsLoading(false);


      if (result.success) {

        setSuccessMessage(
          result.message
        );

      } else {

        setErrorMessage(
          result.error
        );

      }

    };


  // ==========================================================
  // EMAIL LOGIN / SIGNUP
  // ==========================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setErrorMessage('');

      setSuccessMessage('');


      const trimmedEmail =
        email.trim();


      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      // ------------------------------------------------------
      // BASIC VALIDATION
      // ------------------------------------------------------

      if (
        !trimmedEmail ||
        !password
      ) {

        setErrorMessage(
          'Please provide both email and password.'
        );

        return;

      }


      if (
        !emailRegex.test(
          trimmedEmail
        )
      ) {

        setErrorMessage(
          'Please enter a valid email address.'
        );

        return;

      }


      // ------------------------------------------------------
      // SIGNUP VALIDATION
      // ------------------------------------------------------

      if (isSignUp) {

        if (!fullName.trim()) {

          setErrorMessage(
            'Please enter your full name.'
          );

          return;

        }


        if (password.length < 6) {

          setErrorMessage(
            'Password must be at least 6 characters.'
          );

          return;

        }


        if (
          password !==
          confirmPassword
        ) {

          setErrorMessage(
            'Passwords do not match. Please re-type your password confirmation.'
          );

          return;

        }


        if (!agreeTerms) {

          setErrorMessage(
            'Please agree to terms and privacy policy.'
          );

          return;

        }

      }


      setIsLoading(true);


      try {

        let assignedRole =
          'Learner';

        let assignedId =
          `usr-${Date.now()
            .toString()
            .slice(-4)}`;

        let isAdminUser =
          false;


        // ----------------------------------------------------
        // EMAIL ADMIN CHECK
        // ----------------------------------------------------

        const isEmailAdmin =
          trimmedEmail
            .toLowerCase()
            .includes('admin') ||
          trimmedEmail
            .toLowerCase() ===
            'sarah.chen@stanford.edu';


        // ----------------------------------------------------
        // ADMIN INVITATION
        // ----------------------------------------------------

        if (
          adminInviteCode.trim()
        ) {

          try {

            const valRes =
              await validateAdminInvite(
                adminInviteCode,
                {
                  email:
                    trimmedEmail,

                  name:
                    fullName ||
                    trimmedEmail
                }
              );


            if (valRes.valid) {

              assignedRole =
                'Admin';

              assignedId =
                valRes.adminId ||
                'ADM-001';

              isAdminUser =
                true;

            }

          } catch {

            const code =
              adminInviteCode
                .trim()
                .toUpperCase();


            if (
              code.startsWith(
                'ADM-INV-'
              ) ||
              code === 'ADM-001'
            ) {

              assignedRole =
                'Admin';

              assignedId =
                'ADM-001';

              isAdminUser =
                true;

            } else {

              setErrorMessage(
                'Invalid admin invitation code. Proceeding with standard Student role.'
              );

            }

          }

        }

        // ----------------------------------------------------
        // EMAIL ADMIN
        // ----------------------------------------------------

        else if (isEmailAdmin) {

          assignedRole =
            'Admin';

          assignedId =
            'ADM-001';

          isAdminUser =
            true;

        }


        // ====================================================
        // SIGN UP
        // ====================================================

        if (isSignUp) {

          const {
            user: fbUser,
            error: regError
          } =
            await registerWithEmail(
              fullName.trim(),
              trimmedEmail,
              password
            );


          if (regError || !fbUser) {

            setIsLoading(false);

            setErrorMessage(
              regError ||
              'Registration failed.'
            );

            return;

          }


          const appUser = {

            uid:
              fbUser.uid,

            name:
              fullName.trim(),

            email:
              trimmedEmail,

            avatarUrl:
              fbUser.photoURL ||
              null,

            emailVerified:
              fbUser.emailVerified,

            role:
              assignedRole,

            isAdmin:
              isAdminUser,

            id:
              isAdminUser
                ? assignedId
                : `usr-${fbUser.uid.slice(0, 6)}`,

            isAuthenticated:
              true,

            loginTime:
              new Date().toISOString()

          };


          // Save user

          localStorage.setItem(
            'adaptive_learning_user',
            JSON.stringify(appUser)
          );


          setIsLoading(false);

          onLogin(appUser);

          return;

        }


        // ====================================================
        // EMAIL SIGN IN
        // ====================================================

        const {
          user: fbUser,
          error: loginError
        } =
          await loginWithEmail(
            trimmedEmail,
            password
          );


        if (
          loginError ||
          !fbUser
        ) {

          setIsLoading(false);

          setErrorMessage(
            loginError ||
            'Login failed.'
          );

          return;

        }


        // ----------------------------------------------------
        // Firebase user data
        // ----------------------------------------------------

        const userEmail =
          fbUser.email ||
          trimmedEmail;


        const finalIsAdmin =
          userEmail
            .toLowerCase()
            .includes('admin') ||
          userEmail
            .toLowerCase() ===
            'sarah.chen@stanford.edu' ||
          isAdminUser;


        const userName =
          fbUser.displayName ||
          userEmail
            .split('@')[0]
            .replace('.', ' ') ||
          'Learner';


        // ----------------------------------------------------
        // APPLICATION USER
        // ----------------------------------------------------

        const appUser = {

          uid:
            fbUser.uid,

          name:
            userName,

          email:
            userEmail,

          avatarUrl:
            fbUser.photoURL ||
            null,

          emailVerified:
            fbUser.emailVerified,

          role:
            finalIsAdmin
              ? 'Admin'
              : assignedRole,

          isAdmin:
            finalIsAdmin,

          id:
            finalIsAdmin
              ? assignedId
              : `usr-${fbUser.uid.slice(0, 6)}`,

          isAuthenticated:
            true,

          loginTime:
            new Date().toISOString()

        };


        // ----------------------------------------------------
        // SAVE USER
        // ----------------------------------------------------

        localStorage.setItem(
          'adaptive_learning_user',
          JSON.stringify(appUser)
        );


        setIsLoading(false);

        onLogin(appUser);

      } catch (err) {

        console.error(
          '[LoginPage] Authentication error:',
          err
        );

        setIsLoading(false);

        setErrorMessage(
          err?.message ||
          'Authentication error.'
        );

      }

    };


  // ==========================================================
  // THEME
  // ==========================================================

  const isDark =
    theme === 'dark';


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div
      className={`
        min-h-screen
        relative
        flex
        items-center
        justify-center
        p-4
        sm:p-6
        transition-colors
        duration-300
        ${
          isDark
            ? 'bg-[#030712] text-slate-100'
            : 'bg-slate-100 text-slate-900'
        }
      `}
    >

      {/* ====================================================
          BACKGROUND
      ==================================================== */}

      <canvas
        ref={canvasRef}
        className="
          fixed
          inset-0
          w-full
          h-full
          pointer-events-none
          z-0
        "
      />


      {/* ====================================================
          THEME BUTTON
      ==================================================== */}

      <button
        onClick={toggleTheme}
        className={`
          fixed
          top-6
          right-6
          z-20
          w-11
          h-11
          rounded-full
          flex
          items-center
          justify-center
          backdrop-blur-md
          border
          transition-all
          cursor-pointer
          shadow-lg
          ${
            isDark
              ? 'bg-slate-900/80 border-slate-700 text-amber-300 hover:bg-slate-800'
              : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
          }
        `}
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >

        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}

      </button>


      {/* ====================================================
          MAIN CARD
      ==================================================== */}

      <main
        className={`
          relative
          z-10
          w-full
          max-w-[440px]
          rounded-[24px]
          p-8
          sm:p-10
          backdrop-blur-[20px]
          border
          transition-all
          duration-300
          shadow-2xl
          ${
            isDark
              ? 'bg-slate-900/65 border-white/10 shadow-black/70'
              : 'bg-white/80 border-white/80 shadow-slate-400/20'
          }
        `}
      >


        {/* ==================================================
            BRAND
        ================================================== */}

        <header className="text-center mb-7">

          <div
            className="
              inline-flex
              items-center
              justify-center
              w-12
              h-12
              rounded-xl
              bg-gradient-to-tr
              from-indigo-500
              via-indigo-600
              to-purple-500
              text-white
              shadow-lg
              shadow-indigo-500/30
              mb-3
            "
          >

            <Brain className="w-6 h-6" />

          </div>


          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-inherit
              mb-1
            "
          >

            {isSignUp
              ? 'Create Account'
              : 'Adaptive Learning'}

          </h1>


          <p
            className={`
              text-xs
              ${
                isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }
            `}
          >

            {isSignUp
              ? 'Start your adaptive learning journey'
              : 'Sign in to your personalized workspace'}

          </p>

        </header>


        {/* ==================================================
            SOCIAL LOGIN
        ================================================== */}

        <div
          className="
            grid
            grid-cols-3
            gap-3
            mb-6
          "
        >

          {/* GOOGLE */}

          <button
            type="button"
            onClick={() =>
              handleOAuthLogin('google')
            }
            disabled={isLoading}
            className={`
              flex
              items-center
              justify-center
              p-3
              rounded-xl
              border
              text-xl
              transition-all
              cursor-pointer
              transform
              hover:-translate-y-0.5
              disabled:opacity-50
              ${
                isDark
                  ? 'bg-slate-900/60 border-white/15 text-slate-200 hover:bg-white/10 hover:border-[#ea4335] hover:text-[#ea4335]'
                  : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-[#ea4335] hover:text-[#ea4335]'
              }
            `}
            title="Sign in with Google"
            aria-label="Sign in with Google"
          >

            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 488 512"
            >

              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />

            </svg>

          </button>


          {/* LINKEDIN */}

          <button
            type="button"
            onClick={() =>
              handleOAuthLogin('linkedin')
            }
            disabled={isLoading}
            className={`
              flex
              items-center
              justify-center
              p-3
              rounded-xl
              border
              text-xl
              transition-all
              cursor-pointer
              transform
              hover:-translate-y-0.5
              disabled:opacity-50
              ${
                isDark
                  ? 'bg-slate-900/60 border-white/15 text-slate-200 hover:bg-white/10 hover:border-[#0a66c2] hover:text-[#0a66c2]'
                  : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-[#0a66c2] hover:text-[#0a66c2]'
              }
            `}
            title="Sign in with LinkedIn"
            aria-label="Sign in with LinkedIn"
          >

            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 448 512"
            >

              <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />

            </svg>

          </button>


          {/* GITHUB */}

          <button
            type="button"
            onClick={() =>
              handleOAuthLogin('github')
            }
            disabled={isLoading}
            className={`
              flex
              items-center
              justify-center
              p-3
              rounded-xl
              border
              text-xl
              transition-all
              cursor-pointer
              transform
              hover:-translate-y-0.5
              disabled:opacity-50
              ${
                isDark
                  ? 'bg-slate-900/60 border-white/15 text-slate-200 hover:bg-white/10 hover:border-slate-400 hover:text-white'
                  : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-800 hover:text-slate-900'
              }
            `}
            title="Sign in with GitHub"
            aria-label="Sign in with GitHub"
          >

            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 496 512"
            >

              <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />

            </svg>

          </button>

        </div>


        {/* ==================================================
            DIVIDER
        ================================================== */}

        <div
          className="
            flex
            items-center
            mb-6
            text-xs
            uppercase
            tracking-wider
            text-slate-400
          "
        >

          <div
            className={`
              flex-1
              h-px
              ${
                isDark
                  ? 'bg-white/15'
                  : 'bg-slate-300'
              }
            `}
          />

          <span className="px-3">
            or email credential
          </span>

          <div
            className={`
              flex-1
              h-px
              ${
                isDark
                  ? 'bg-white/15'
                  : 'bg-slate-300'
              }
            `}
          />

        </div>


        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {successMessage && (

          <div
            className="
              mb-4
              p-3
              rounded-xl
              bg-emerald-500/10
              border
              border-emerald-500/30
              text-emerald-400
              text-xs
              font-medium
            "
          >

            {successMessage}

          </div>

        )}


        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {errorMessage && (

          <div
            className="
              mb-4
              p-3
              rounded-xl
              bg-rose-500/10
              border
              border-rose-500/30
              text-rose-400
              text-xs
              font-medium
            "
          >

            {errorMessage}

          </div>

        )}


        {/* ==================================================
            AUTH FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {/* FULL NAME */}

          {isSignUp && (

            <div>

              <div
                className="
                  relative
                  flex
                  items-center
                "
              >

                <User
                  className="
                    absolute
                    left-3.5
                    w-4
                    h-4
                    text-slate-400
                    pointer-events-none
                  "
                />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  placeholder="Full name"
                  className={`
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    text-sm
                    border
                    outline-none
                    transition-all
                    ${
                      isDark
                        ? 'bg-slate-900/60 border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-400'
                        : 'bg-white/80 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                    }
                  `}
                  required
                />

              </div>

            </div>

          )}


          {/* EMAIL */}

          <div>

            <div
              className="
                relative
                flex
                items-center
              "
            >

              <Mail
                className="
                  absolute
                  left-3.5
                  w-4
                  h-4
                  text-slate-400
                  pointer-events-none
                "
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Name@domain.com"
                className={`
                  w-full
                  pl-10
                  pr-4
                  py-3
                  rounded-xl
                  text-sm
                  border
                  outline-none
                  transition-all
                  ${
                    isDark
                      ? 'bg-slate-900/60 border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-400'
                      : 'bg-white/80 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                  }
                `}
                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div>

            <div
              className="
                relative
                flex
                items-center
              "
            >

              <Lock
                className="
                  absolute
                  left-3.5
                  w-4
                  h-4
                  text-slate-400
                  pointer-events-none
                "
              />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                className={`
                  w-full
                  pl-10
                  pr-10
                  py-3
                  rounded-xl
                  text-sm
                  border
                  outline-none
                  transition-all
                  ${
                    isDark
                      ? 'bg-slate-900/60 border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-400'
                      : 'bg-white/80 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                  }
                `}
                required
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                  absolute
                  right-3
                  text-slate-400
                  hover:text-indigo-400
                  cursor-pointer
                  p-1
                "
                aria-label="
                  Toggle password visibility
                "
              >

                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}

              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}

          {isSignUp && (

            <div>

              <div
                className="
                  relative
                  flex
                  items-center
                "
              >

                <ShieldCheck
                  className="
                    absolute
                    left-3.5
                    w-4
                    h-4
                    text-slate-400
                    pointer-events-none
                  "
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm password"
                  className={`
                    w-full
                    pl-10
                    pr-4
                    py-3
                    rounded-xl
                    text-sm
                    border
                    outline-none
                    transition-all
                    ${
                      isDark
                        ? 'bg-slate-900/60 border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-400'
                        : 'bg-white/80 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 placeholder-slate-400'
                    }
                  `}
                  required
                />

              </div>

            </div>

          )}


          {/* =================================================
              ADMIN INVITATION
          ================================================= */}

          <div className="pt-0.5">

            {!showAdminCodeInput ? (

              <button
                type="button"
                onClick={() =>
                  setShowAdminCodeInput(
                    true
                  )
                }
                className="
                  text-[11px]
                  text-purple-400
                  hover:text-purple-300
                  font-medium
                  flex
                  items-center
                  gap-1
                  cursor-pointer
                "
              >

                <Key className="w-3 h-3" />

                Have an Admin Invitation Code?

              </button>

            ) : (

              <div
                className={`
                  p-2.5
                  rounded-xl
                  border
                  space-y-1
                  ${
                    isDark
                      ? 'bg-purple-950/20 border-purple-800/40'
                      : 'bg-purple-50/70 border-purple-200'
                  }
                `}
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <label
                    className="
                      text-[10px]
                      font-semibold
                      text-purple-400
                      flex
                      items-center
                      gap-1
                    "
                  >

                    <Key className="w-3 h-3" />

                    Admin Invitation Code

                  </label>


                  <button
                    type="button"
                    onClick={() => {

                      setShowAdminCodeInput(
                        false
                      );

                      setAdminInviteCode('');

                    }}
                    className="
                      text-[10px]
                      text-slate-400
                      hover:text-slate-200
                      cursor-pointer
                    "
                  >

                    Cancel

                  </button>

                </div>


                <input
                  type="text"
                  value={
                    adminInviteCode
                  }
                  onChange={(e) =>
                    setAdminInviteCode(
                      e.target.value
                    )
                  }
                  placeholder="e.g. ADM-INV-8821"
                  className={`
                    w-full
                    px-3
                    py-1.5
                    text-xs
                    font-mono
                    rounded-lg
                    border
                    outline-none
                    uppercase
                    ${
                      isDark
                        ? 'bg-slate-900/90 border-purple-700/50 text-purple-200 placeholder-slate-500'
                        : 'bg-white border-purple-300 text-purple-900 placeholder-slate-400'
                    }
                  `}
                />

              </div>

            )}

          </div>


          {/* =================================================
              OPTIONS
          ================================================= */}

          {!isSignUp ? (

            <div
              className="
                flex
                items-center
                justify-between
                text-xs
                text-slate-400
                pt-0.5
              "
            >

              <label
                className="
                  flex
                  items-center
                  gap-2
                  cursor-pointer
                  hover:text-slate-200
                "
              >

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  className="
                    rounded
                    text-indigo-600
                    focus:ring-indigo-500
                    accent-indigo-600
                    w-4
                    h-4
                  "
                />

                <span>
                  Remember device
                </span>

              </label>


              <button
                type="button"
                onClick={
                  handleForgotPassword
                }
                className="
                  text-indigo-400
                  hover:underline
                  font-medium
                  cursor-pointer
                "
              >

                Forgot?

              </button>

            </div>

          ) : (

            <div className="pt-0.5">

              <label
                className="
                  flex
                  items-start
                  gap-2
                  text-[11px]
                  cursor-pointer
                  text-slate-400
                "
              >

                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) =>
                    setAgreeTerms(
                      e.target.checked
                    )
                  }
                  className="
                    mt-0.5
                    rounded
                    text-indigo-600
                    focus:ring-indigo-500
                    accent-indigo-600
                  "
                  required
                />

                <span>

                  I agree to the{' '}

                  <a
                    href="/terms-and-conditions.html"
                    target="_blank"
                    rel="noreferrer"
                    className="
                      text-indigo-400
                      underline
                    "
                  >
                    Terms
                  </a>

                  {' '}and{' '}

                  <a
                    href="/privacy-policy.html"
                    target="_blank"
                    rel="noreferrer"
                    className="
                      text-indigo-400
                      underline
                    "
                  >
                    Privacy Policy
                  </a>.

                </span>

              </label>

            </div>

          )}


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full
              py-3.5
              px-4
              bg-[#4f46e5]
              hover:bg-[#4338ca]
              text-white
              font-semibold
              text-sm
              rounded-xl
              shadow-lg
              shadow-indigo-600/30
              flex
              items-center
              justify-center
              gap-2
              transition-all
              transform
              hover:-translate-y-0.5
              active:scale-95
              disabled:opacity-70
              cursor-pointer
              mt-2
            "
          >

            {isLoading ? (

              <>

                <div
                  className="
                    w-4
                    h-4
                    border-2
                    border-white
                    border-t-transparent
                    rounded-full
                    animate-spin
                  "
                />

                <span>
                  Authenticating with Firebase...
                </span>

              </>

            ) : (

              <span>

                {isSignUp
                  ? 'Create Account'
                  : 'Sign In'}

              </span>

            )}

          </button>

        </form>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer
          className="
            mt-8
            text-center
            text-xs
            text-slate-400
          "
        >

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
                className="
                  text-indigo-400
                  hover:underline
                  font-semibold
                  cursor-pointer
                "
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
                className="
                  text-indigo-400
                  hover:underline
                  font-semibold
                  cursor-pointer
                "
              >

                Sign in

              </button>

            </span>

          )}

        </footer>

      </main>

    </div>

  );

};

export default LoginPage;