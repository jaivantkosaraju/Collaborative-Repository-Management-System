import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Github, Lock, GitCommit, Clock, Search } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { BASE_URL } from '../context/AuthContext';
import { timeAgo } from '../lib/timeAlgo';
import { Contributor_stat } from '../types/repository_types';

export default function RepoContributors() {
  const { creator_id, repo_name } = useParams();
  const navigate = useNavigate();
  const [contributors, setContributors] = useState<Contributor_stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoIsPrivate, setRepoIsPrivate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/contributer/all/${creator_id}/${repo_name}/`, {
        credentials: 'include'
      });
 
      if (!response.ok) {
        throw new Error('Failed to fetch contributors');
      }

      const data = await response.json();

      if (data.message === "Successfully retrieved contributors") {
        setContributors(data.data.contributors.map((contributor: Contributor_stat) => ({
          ...contributor,
          avatar: contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.username)}&background=4F46E5&color=fff`,
          firstContribution: contributor.firstContribution ?
            timeAgo(contributor.firstContribution) : 'No contributions yet',
          last_contribution: contributor.last_contribution ?
            timeAgo(contributor.last_contribution) : 'No contributions yet'
        })));
        setRepoIsPrivate(data.data.isPrivate);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [creator_id, repo_name]);

  const filteredContributors = contributors.filter(contributor =>
    contributor.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/${creator_id}/${repo_name}/main`)}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mr-3">{repo_name}</h1>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wide rounded-md border flex items-center ${
                repoIsPrivate 
                  ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
              }`}>
                {repoIsPrivate ? (
                  <>
                    <Lock size={10} className="mr-1" />
                    PRIVATE
                  </>
                ) : (
                  <>
                    <Github size={10} className="mr-1" />
                    PUBLIC
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
              <Users size={18} className="mr-2.5 text-indigo-600 dark:text-indigo-400" />
              Contributors
            </h2>
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200/20 dark:border-slate-800/50">
              {contributors.length} people
            </span>
          </div>

          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/10">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Find a contributor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="appearance-none block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800/80 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all font-medium"
              />
              <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Search size={16} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 bg-white dark:bg-brand-card">
              <SkeletonLoader type="card" count={3} />
            </div>
          ) : filteredContributors.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredContributors.map((contributor) => (
                <div key={contributor.user_id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
                  <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
                    <div className="flex items-center min-w-0">
                      <img
                        src={contributor.avatar}
                        alt={contributor.username}
                        className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-sm flex-shrink-0 mr-4"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/profile/${contributor.user_id}`)}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate"
                          >
                            {contributor.username}
                          </button>
                          {contributor.role && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded tracking-wide uppercase">
                              {contributor.role}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          First contributed {contributor.firstContribution}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 self-start sm:self-center ml-14 sm:ml-0">
                      <div className="flex items-center text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1.5">
                        <GitCommit size={15} className="mr-1.5 text-emerald-500" />
                        <span>{contributor.contributions}</span>
                        <span className="text-slate-400 font-bold ml-1 text-xs uppercase tracking-wide">commits</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center">
                        <Clock size={12} className="mr-1 text-slate-400" />
                        <span>Active {contributor.last_contribution}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <Users size={44} className="mx-auto mb-3 opacity-30" />
              <p className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200">No contributors found</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Try adjusting your search term.</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden mt-8 transition-colors duration-300">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Contribution Summary</h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {contributors.reduce((sum, contributor) => sum + contributor.contributions, 0)}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Total Commits</div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{contributors.length}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Contributors</div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {contributors.length > 0
                    ? Math.round(contributors.reduce((sum, contributor) => sum + contributor.contributions, 0) / contributors.length)
                    : 0}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Avg. Commits</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}