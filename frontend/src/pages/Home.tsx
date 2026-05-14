import { useNavigate } from 'react-router-dom';
import { Plus, Star, Lock, Github, Search, Globe, Briefcase } from 'lucide-react';
import { BASE_URL, useAuth } from '../context/AuthContext';
import React, { useEffect, useState } from 'react';
import { timeAgo } from '../lib/timeAlgo';
import CreateRepositoryModal from '../components/CreateRepositoryModal';

interface Repository {
  repo_id: number;
  creator_id: number;
  repo_name: string;
  description: string;
  visibility: 'Public' | 'Private';
  creation_date: string;
  license: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  tags: string[];
  User: {
    username: string;
  };
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [personalRepos, setPersonalRepos] = useState<Repository[] | null>(null);
  const [filteredrepos, setFilteredrepos] = useState<Repository[] | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explore'>('dashboard');
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRepos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/repo/all`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRepos(data.data || []);
    } catch (err) {
      console.error("Failed to fetch explore repos", err);
    }
  };

  const fetchPersonalRepos = async () => {
    if (!user?.user_id) return;
    try {
      const response = await fetch(`${BASE_URL}/repo/specific/${user.user_id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      const items = data.data || [];
      // Map contributor items to exact repository objects
      const extracted = items.map((item: any) => item.Repository).filter(Boolean);
      setPersonalRepos(extracted);
    } catch (err) {
      console.error("Failed to fetch user repos", err);
    }
  };

  useEffect(() => {
    fetchRepos();
    if (user?.user_id) {
      fetchPersonalRepos();
    }
  }, [isModalOpen, user?.user_id]);

  useEffect(() => {
    let currentList = activeTab === 'dashboard' ? personalRepos : repos;
    if (!currentList) {
      setFilteredrepos(null);
      return;
    }

    // If in Explore mode, curate the selection to Top 6 featured repositories, excluding own
    if (activeTab === 'explore') {
      currentList = [...currentList]
        .filter(repo => repo.creator_id !== user?.user_id)
        .sort((a, b) => {
          if ((b.stars || 0) !== (a.stars || 0)) {
            return (b.stars || 0) - (a.stars || 0);
          }
          return new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime();
        })
        .slice(0, 6);
    }
    
    const filtered = currentList.filter(repo => 
      repo?.repo_name?.toLowerCase().includes(search.toLowerCase()) ||
      repo?.description?.toLowerCase().includes(search.toLowerCase()) ||
      repo?.language?.toLowerCase().includes(search.toLowerCase()) ||
      repo?.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
    
    setFilteredrepos(filtered);
  }, [repos, personalRepos, search, activeTab, user?.user_id]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8 border-b border-slate-200/80 dark:border-slate-800/60 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'dashboard' ? 'Your Dashboard' : 'Explore Repositories'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {activeTab === 'dashboard' 
                ? 'Manage, collaborate, and view your active repositories.' 
                : 'Discover interesting open-source projects from the community.'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder={`Search ${activeTab === 'dashboard' ? 'your' : 'all'} repositories...`}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-brand-card text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm shadow-sm transition-all"
              />
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-[0.98] flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create New
            </button>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex space-x-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-10">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSearch(''); }}
            className={`pb-4 px-6 font-bold text-sm transition-all duration-300 relative flex items-center ${
              activeTab === 'dashboard' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase size={16} className="mr-2" />
            Your Repositories
            {activeTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-fade-in" />
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('explore'); setSearch(''); }}
            className={`pb-4 px-6 font-bold text-sm transition-all duration-300 relative flex items-center ${
              activeTab === 'explore' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Globe size={16} className="mr-2" />
            Explore Community
            {activeTab === 'explore' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {/* Repositories Grid */}
        {filteredrepos && filteredrepos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredrepos.map((repo) => (
              <div
                key={repo.repo_id}
                className="group flex flex-col bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center overflow-hidden text-ellipsis">
                      <button 
                        onClick={() => navigate(`/${repo.creator_id}/${repo.repo_name}/main`)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate font-semibold"
                      >
                        {repo.repo_name}
                      </button>
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg flex-shrink-0 border
                      ${repo.visibility === 'Private' 
                        ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'}`}
                    >
                      {repo.visibility === 'Private' 
                        ? <><Lock size={11} className="mr-1" />Private</>
                        : <><Github size={11} className="mr-1" />Public</>
                      }
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium min-h-[2.5rem]">
                    {repo.description || "No description available for this repository."}
                  </p>
                  
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    {repo.language && (
                      <span className="flex items-center">
                        <span 
                          style={{ backgroundColor: repo.languageColor || '#6366F1' }} 
                          className="w-2.5 h-2.5 rounded-full inline-block mr-1.5 ring-2 ring-white dark:ring-slate-900">
                        </span>
                        {repo.language}
                      </span>
                    )}
                    <span>Created {timeAgo(repo.creation_date)}</span>
                    {repo.license && <span className="truncate">License: {repo.license}</span>}
                  </div>

                  {repo.tags && repo.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {repo.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-0.5 text-[11px] font-bold rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex-shrink-0">
                  <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400/10" />
                    {repo.stars || 0} stars
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-100 dark:border-slate-800">
              {activeTab === 'dashboard' ? <Briefcase size={32} /> : <Globe size={32} />}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {activeTab === 'dashboard' ? 'No repositories found' : 'No community repositories'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium max-w-md mx-auto">
              {activeTab === 'dashboard' 
                ? "Get started by creating a new repository to keep track of your code and projects!"
                : "Looks like there are no active public projects matching this query."}
            </p>
            {activeTab === 'dashboard' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create a new repository
              </button>
            )}
          </div>
        )}

        <CreateRepositoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
}
