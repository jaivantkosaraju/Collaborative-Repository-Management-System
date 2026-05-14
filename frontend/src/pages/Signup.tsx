import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
export default function Signup() {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    full_name:'',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (!!user) {
        //  console.log("user",user);
      navigate('/');
    }
    //reload once the user gets updated
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await signup(formData.username,formData.full_name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300 bg-slate-50 dark:bg-brand-dark py-12">
      <div className="max-w-md w-full">
        {/* Decorative elements in the background */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-md w-full space-y-8 bg-white dark:bg-brand-card/60 border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-xl backdrop-blur-md">
          <div>
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Join our DevNest developer community
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={15} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="appearance-none block w-full pl-9 px-3 py-2.5 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={15} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      className="appearance-none block w-full pl-9 px-3 py-2.5 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all"
                      placeholder="Jane Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="appearance-none block w-full pl-10 px-3.5 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 px-3.5 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 px-3.5 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center transition-all">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/20 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <UserPlus className="h-4 w-4 text-indigo-200 group-hover:text-white transition-colors" />
                </span>
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>
          
          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
