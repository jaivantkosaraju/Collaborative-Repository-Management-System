import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BASE_URL } from '../context/AuthContext';
import { Issue } from '../types/repository_types';

export default function IssueForm() {
  const { creator_id, repo_name, issue_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Open'
  });

  // Fetch issue data if editing
  useEffect(() => {
    if (issue_id) {
      fetchIssueData();
    }
  }, [issue_id]);

  const fetchIssueData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/issues/${creator_id}/${repo_name}/${issue_id}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch issue');
      
      const data = await response.json();
      console.log("issue",data)
      setFormData({
        title: data.data.issue_title,
        description: data.data.issue_description,
        status: data.data.status
      });
    } catch (error) {
      setError('Failed to load issue data');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = issue_id 
        ? `${BASE_URL}/issues/${creator_id}/${repo_name}/${issue_id}`
        : `${BASE_URL}/issues/${creator_id}/${repo_name}/create`;

      const response = await fetch(url, {
        method: issue_id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save issue');
      }

      navigate(`/${creator_id}/${repo_name}/issues`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(`/${creator_id}/${repo_name}/issues`)}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight ml-4">
            {issue_id ? 'Edit Issue' : 'Create New Issue'}
          </h1>
        </div>

        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                Issue Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all font-medium"
                placeholder="e.g., [Bug] Auth flow fails in production"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all min-h-[200px] font-medium resize-none"
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            {issue_id && (
              <div className="w-full sm:w-1/2">
                <label htmlFor="status" className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all font-semibold"
                >
                  <option value="Open">🟢 Open</option>
                  <option value="Closed">⚪ Closed</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => navigate(`/${creator_id}/${repo_name}/issues`)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-transparent dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  issue_id ? 'Saving Changes...' : 'Creating Issue...'
                ) : (
                  issue_id ? 'Save Changes' : 'Create Issue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}