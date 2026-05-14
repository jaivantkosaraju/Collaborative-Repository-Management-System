import React,{useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ThemeToggle from './ThemeToggle';
export default function Header() {
  const { user, logout,getCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser();
  }, [navigate])
  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-brand-dark/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-slate-900 dark:text-slate-50 font-extrabold text-xl tracking-tight">
                Dev<span className="text-indigo-600 dark:text-indigo-400">Nest</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {!!user && (
              <div className="relative">
                <button 
                  onClick={() => navigate(`/profile/${user?.user_id}`)}
                  className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || '')}&background=4F46E5&color=fff`}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full shadow-sm"
                  />
                </button>
              </div>
            )}

            {!!user ? (
              <button 
                onClick={() => logout()} 
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
