import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { auth, CREDENTIALS } from '../../services/auth';
import { User } from '../../types/hr';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@officehh.ae');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = auth.login(email, password);
      setLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 300);
  };

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure System Sign-In"
      subtitle="Enter authorized HR credentials to access personnel records and payroll"
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center pb-3 text-center">
        <p className="font-bold text-sm text-slate-900">
          Office of H.H. Sheikh Zayed Bin Hazza Bin Zayed Al Nahyan
        </p>
        <p className="font-arabic text-xs text-[#846429] dark:text-[#D4AF37]" dir="rtl">
          مكتب سمو الشيخ زايد بن هزاع بن زايد آل نهيان
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@officehh.ae"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA9547] text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAF7F2] dark:bg-[#24201C] border border-[#E7DEC8] dark:border-[#383129] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA9547] text-stone-900 dark:text-white font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#BA9547] hover:bg-[#A17D34] active:scale-[0.99] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          <KeyRound className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
        </button>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-[#E7DEC8] dark:border-[#2E2822]">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#BA9547]" />
            Authorized Demo Accounts (1-Click Fill)
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(CREDENTIALS).slice(0, 4).map(([credEmail, val]) => (
              <button
                key={credEmail}
                type="button"
                onClick={() => handleSelectDemo(credEmail, val.password)}
                className={`p-2 rounded-xl text-left border transition ${
                  email === credEmail
                    ? 'border-[#BA9547] bg-[#FBF8F0] dark:bg-[#2A2318] text-[#846429] dark:text-[#E2C687] font-bold'
                    : 'border-[#E7DEC8] dark:border-[#383129] hover:bg-[#FAF7F2] dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                <p className="font-semibold">{val.user.role}</p>
                <p className="text-[10px] text-stone-400 truncate">{credEmail}</p>
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

