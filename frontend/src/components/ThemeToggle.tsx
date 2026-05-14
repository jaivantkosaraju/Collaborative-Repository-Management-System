import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAuth();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl border bg-white border-slate-200 hover:bg-slate-100 dark:bg-slate-800/60 dark:border-slate-700/60 dark:hover:bg-slate-800/90 shadow-sm transition-all duration-300 active:scale-95 group overflow-hidden"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-[15deg]">
        {theme === 'dark' ? (
          <Sun size={18} className="text-amber-400 fill-amber-400/10" />
        ) : (
          <Moon size={18} className="text-indigo-600 fill-indigo-600/10" />
        )}
      </div>
    </button>
  );
}
