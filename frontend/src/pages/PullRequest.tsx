import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitPullRequest, Clock, User, ChevronLeft, Plus } from 'lucide-react';
import { BASE_URL } from '../context/AuthContext';
import { timeAgo } from '../lib/timeAlgo';

interface Branch {
  branch_id: number;
  name: string;
}

interface PullRequest {
  pr_id: number;
  pr_title: string;
  pr_description: string;
  creator_id: string;
  pr_status: 'Open' | 'Merged' | 'Closed';
  creation_date: string;
  base_branch_id: string;
  target_branch_id: string;
  User: { username: string };
  baseBranch: { name: string };
  targetBranch: { name: string };
}

export default function PullRequest() {
  const { creator_id, repo_name } = useParams();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    pr_title: '',
    pr_description: '',
    base_branch_id: '',
    target_branch_id: ''
  });

  const fetchBranches = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/branch/list/${creator_id}/${repo_name}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (response.ok) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  useEffect(() => {
    fetchPullRequests();
    fetchBranches();
  }, [creator_id, repo_name]);

  const fetchPullRequests = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pull-requests/list/${creator_id}/${repo_name}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (response.ok) {
        setPullRequests(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch pull requests');
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${BASE_URL}/pull-requests/create/${creator_id}/${repo_name}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchPullRequests();
        setShowCreateForm(false);
        setFormData({
          pr_title: '',
          pr_description: '',
          base_branch_id: '',
          target_branch_id: ''
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create pull request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/${creator_id}/${repo_name}/main`)}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <GitPullRequest className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Pull Requests
              </h1>
            </div>
          </div>
          
          {creator_id !== 'main' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 rounded-xl transition-all active:scale-95 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Pull Request
            </button>
          )}
        </div>

        {/* Create PR Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Open a New Pull Request
            </h2>
            <form onSubmit={handleCreatePR} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.pr_title}
                  onChange={(e) => setFormData({ ...formData, pr_title: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-medium transition-all"
                  placeholder="e.g., refactor: update home button UI"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="base_branch" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                    Base Branch (target)
                  </label>
                  <select
                    id="base_branch"
                    value={formData.base_branch_id}
                    onChange={(e) => setFormData({ ...formData, base_branch_id: e.target.value })}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-semibold transition-all"
                    required
                  >
                    <option value="">Select base branch</option>
                    {branches.map((branch) => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="target_branch" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                    Compare Branch (source)
                  </label>
                  <select
                    id="target_branch"
                    value={formData.target_branch_id}
                    onChange={(e) => setFormData({ ...formData, target_branch_id: e.target.value })}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-semibold transition-all"
                    required
                  >
                    <option value="">Select compare branch</option>
                    {branches.map((branch) => (
                      <option
                        key={branch.branch_id}
                        value={branch.branch_id}
                        disabled={branch.branch_id === Number(formData.base_branch_id)}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.pr_description}
                  onChange={(e) => setFormData({ ...formData, pr_description: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-medium transition-all resize-none"
                  placeholder="Explain changes and what problem they solve..."
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-transparent dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? 'Creating PR...' : 'Create PR'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pull Requests List */}
        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {pullRequests.map((pr) => (
              <div
                key={pr.pr_id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/${creator_id}/${repo_name}/pull/${pr.pr_id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {pr.pr_title}
                      </h3>
                      <span className="text-xs text-slate-400 font-semibold">#{pr.pr_id}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{pr.pr_description || "No description provided."}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/50">
                        <User size={13} className="mr-1.5 text-slate-400" />
                        {pr.User?.username}
                      </span>
                      <span className="flex items-center bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/50">
                        <Clock size={13} className="mr-1.5 text-slate-400" />
                        {timeAgo(pr.creation_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 self-start sm:self-auto">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border tracking-wide ${
                      pr.pr_status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                        : pr.pr_status === 'Merged'
                          ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {pr.pr_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {pullRequests.length === 0 && (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                <GitPullRequest size={44} className="mx-auto mb-3 opacity-30" />
                <p className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200">No pull requests yet</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">Submit a pull request between branches to propose and collaborate on changes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}