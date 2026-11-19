import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../lib/theme';

export function ThemeToggle() {
  const { mode, setMode, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'Device', icon: Monitor },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-dark-600/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Moon className="h-5 w-5 text-secondary-400" />
        ) : (
          <Sun className="h-5 w-5 text-primary-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-dark-600 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-400 p-2 z-50 animate-scale-in origin-top-right">
          <p className="px-3 py-1.5 text-xs font-medium text-dark-200 dark:text-dark-300 uppercase tracking-wider">
            Appearance
          </p>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setMode(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                mode === opt.value
                  ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  : 'text-dark-600 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-500'
              }`}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
              {mode === opt.value && <Check className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
