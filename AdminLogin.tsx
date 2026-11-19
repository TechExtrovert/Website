import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASS = 'ZaraChills@Admin2024';

interface Props {
  onAuth: () => void;
}

export function AdminLogin({ onAuth }: Props) {
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent" />
      <div className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-sm shadow-2xl ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">Admin Dashboard</h1>
          <p className="text-stone-400 text-sm mt-1">ZaraChills Organic Blend</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter admin password"
              className={`w-full bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} text-white placeholder-stone-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">Incorrect password. Please try again.</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg hover:shadow-primary-500/25"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
