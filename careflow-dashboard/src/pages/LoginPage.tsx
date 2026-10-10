import React, { useState } from 'react';
import { 
  Activity, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight,
  User,
  Building2
} from 'lucide-react';
import { DepartmentName } from '../types';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
}

const DEPARTMENTS: DepartmentName[] = [
  'General Medicine',
  'Emergency',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Intensive Care Unit (ICU)',
  'Neurology'
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState<DepartmentName>('General Medicine');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status and feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper validation functions
  const isValidEmailFormat = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  };

  const getPasswordCriteria = (pwd: string) => [
    { id: 'length', label: 'At least 8 characters', valid: pwd.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(pwd) },
    { id: 'number', label: 'One numerical digit (0-9)', valid: /[0-9]/.test(pwd) },
    { id: 'special', label: 'One special symbol (!@#$%^&*...)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  // Registration password evaluation criteria
  const regCriteria = getPasswordCriteria(regPassword);
  const validRegCriteriaCount = regCriteria.filter((c) => c.valid).length;
  const isRegPasswordValid = validRegCriteriaCount === regCriteria.length;

  const isLoginEmailValid = isValidEmailFormat(loginEmail);
  const isRegEmailValid = isValidEmailFormat(regEmail);
  const isPasswordsMatch = regPassword === regConfirmPassword && regPassword.length > 0;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = loginEmail.trim();

    if (!isLoginEmailValid) {
      setErrorMsg('Please enter a valid email address as your username.');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    // Check stored accounts or allow valid credential authentication
    try {
      const stored = localStorage.getItem('careflow_registered_users');
      const users: Array<{ email: string; passwordHash: string }> = stored ? JSON.parse(stored) : [];
      const match = users.find((u) => u.email.toLowerCase() === emailTrimmed.toLowerCase());

      if (match && match.passwordHash !== loginPassword) {
        setErrorMsg('Invalid password entered for this registered account.');
        return;
      }
    } catch {
      // Ignore parse error
    }

    if (rememberMe) {
      localStorage.setItem('careflow_user', JSON.stringify({ email: emailTrimmed, timestamp: Date.now() }));
    }
    onLoginSuccess(emailTrimmed);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = regEmail.trim();

    if (!regName.trim()) {
      setErrorMsg('Please enter your full staff name.');
      return;
    }

    if (!isRegEmailValid) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!isRegPasswordValid) {
      setErrorMsg('Password must satisfy all security criteria.');
      return;
    }

    if (!isPasswordsMatch) {
      setErrorMsg('Passwords do not match. Please re-enter confirm password.');
      return;
    }

    try {
      const stored = localStorage.getItem('careflow_registered_users');
      const users: Array<{ name: string; department: string; email: string; passwordHash: string }> = stored ? JSON.parse(stored) : [];
      
      const alreadyExists = users.some((u) => u.email.toLowerCase() === emailTrimmed.toLowerCase());
      if (alreadyExists) {
        setErrorMsg('An account is already registered with this email address.');
        return;
      }

      users.push({
        name: regName.trim(),
        department: regDept,
        email: emailTrimmed,
        passwordHash: regPassword
      });

      localStorage.setItem('careflow_registered_users', JSON.stringify(users));
      localStorage.setItem('careflow_user', JSON.stringify({ email: emailTrimmed, timestamp: Date.now() }));
      
      setSuccessMsg('Staff account successfully registered! Redirecting to operations console...');
      setTimeout(() => {
        onLoginSuccess(emailTrimmed);
      }, 700);
    } catch {
      localStorage.setItem('careflow_user', JSON.stringify({ email: emailTrimmed, timestamp: Date.now() }));
      onLoginSuccess(emailTrimmed);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-sky-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20 text-white mb-3">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CareFlow AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hospital Operations &amp; Intelligent Capacity Planning Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Mode Switch Tabs (Sign In / Register) */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
                mode === 'LOGIN'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Staff Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
                mode === 'REGISTER'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              New Staff Registration
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-start space-x-2">
              <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===================== MODE: SIGN IN ===================== */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* Email as Username */}
              <div>
                <label htmlFor="login-email" className="block text-slate-300 font-semibold mb-1.5">
                  Email Address (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs"
                    required
                  />
                </div>
                {loginEmail.length > 0 && !isLoginEmailValid && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    Please enter a valid email format.
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-pwd" className="block text-slate-300 font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-pwd"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Workstation Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={!isLoginEmailValid || !loginPassword.trim()}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-sky-600/20 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                <span>Authenticate &amp; Launch Console</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  New staff member? Register an account &rarr;
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE: NEW REGISTRATION ===================== */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="block text-slate-300 font-semibold mb-1.5">
                  Full Staff Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs"
                    required
                  />
                </div>
              </div>

              {/* Clinical Department */}
              <div>
                <label htmlFor="reg-dept" className="block text-slate-300 font-semibold mb-1.5">
                  Primary Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    id="reg-dept"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value as DepartmentName)}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email (Username) */}
              <div>
                <label htmlFor="reg-email" className="block text-slate-300 font-semibold mb-1.5">
                  Email Address (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs"
                    required
                  />
                </div>
                {regEmail.length > 0 && !isRegEmailValid && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    Please enter a valid email format.
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-pwd" className="block text-slate-300 font-semibold">
                    Create Password
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Criteria: {validRegCriteriaCount}/5
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-pwd"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                <div className="mt-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Password Security Criteria:
                  </span>
                  {regCriteria.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center space-x-2 transition ${
                        c.valid ? 'text-emerald-400 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {c.valid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-slate-600 inline-block shrink-0" />
                      )}
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm-pwd" className="block text-slate-300 font-semibold mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-confirm-pwd"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-xs"
                    required
                  />
                </div>
                {regConfirmPassword.length > 0 && !isPasswordsMatch && (
                  <p className="text-[11px] text-rose-400 mt-1">
                    Passwords do not match.
                  </p>
                )}
                {isPasswordsMatch && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3 inline" />
                    <span>Passwords match perfectly.</span>
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={!isRegEmailValid || !isRegPasswordValid || !isPasswordsMatch || !regName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                <span>Complete Registration &amp; Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  Already registered? Back to Sign In &rarr;
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Compliance Footer */}
        <div className="text-center mt-6 text-[11px] text-slate-500 space-y-1">
          <p>CareFlow Enterprise Authentication &bull; AES-256 Session Encrypted</p>
          <p>Authorized Clinical Operations &amp; Administration Access Only</p>
        </div>
      </div>
    </div>
  );
};
