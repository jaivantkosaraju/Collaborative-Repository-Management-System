import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Lock, Globe, AlertTriangle, ChevronLeft, X } from 'lucide-react';
import { ContributerDetails } from '../types/repository_types';
import { BASE_URL } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  Ruby: '#701516',
  PHP: '#4F5D95',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB'
};

const LANGUAGES = Object.keys(LANGUAGE_COLORS);

export default function RepositorySettings() {
  const { creator_id, repo_name } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoDetails, setRepoDetails] = useState({
    repo_name: '',
    description: '',
    visibility: 'Public' as 'Public' | 'Private',
    license: 'MIT License',
    language: '',
    languageColor: '',
    tags: [] as string[],
    newTag: ''
  });

  const [showAddContributor, setShowAddContributor] = useState(false);
  const [newContributor, setNewContributor] = useState({ creator_id: '', role: 'Contributor' });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [contributors, setContributors] = useState<ContributerDetails[]>([]);
  const [change, setChange] = useState(false);

  const fetchRepoDetails = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/repo/get/${creator_id}/${repo_name}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (response.ok) {
        const parsedTags = typeof data.data.tags === 'string'
          ? JSON.parse(data.data.tags)
          : data.data.tags || [];

        setRepoDetails({
          repo_name: data.data.repo_name,
          description: data.data.description || '',
          visibility: data.data.visibility,
          license: data.data.license || 'MIT License',
          language: data.data.language || '',
          languageColor: data.data.languageColor || '',
          tags: parsedTags,
          newTag: ''
        });
      }
    } catch (error) {
      setError('Failed to load repository settings');
    }
  };

  const fetchContributors = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/contributer/all/${creator_id}/${repo_name}/`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.message === "Successfully retrieved contributors") {
        setContributors(data.data.contributors);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRepo = async () => {
    try {
      const tagsToSend = Array.isArray(repoDetails.tags) ? repoDetails.tags : [];

      const response = await fetch(
        `${BASE_URL}/repo/${creator_id}/${repo_name}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            new_repo_name: repoDetails.repo_name,
            description: repoDetails.description,
            visibility: repoDetails.visibility,
            license: repoDetails.license,
            language: repoDetails.language,
            languageColor: repoDetails.languageColor,
            tags: tagsToSend
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update repository');
      }

      const data = await response.json();
      if (data.message === "Repository updated successfully") {
        if (repoDetails.repo_name !== repo_name) {
          navigate(`/${creator_id}/${repoDetails.repo_name}/settings`);
        }
        setRepoDetails(prev => ({ ...prev, ...data.data }));
        toast.success("Updated settings");
        setChange(false);
      }
    } catch (error) {
      setError('Failed to update repository settings');
      toast.error("Failed to update repository settings");
    }
  };

  const handleAddContributor = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/contributer/${creator_id}/${repo_name}/add`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            username: newContributor.creator_id,
            role: newContributor.role
          })
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new Error(data.message || 'User not found');
          case 400:
            throw new Error(data.message || 'Invalid request');
          case 403:
            throw new Error(data.message || 'Not authorized to add contributors');
          case 409:
            throw new Error(data.message || 'User is already a contributor');
          default:
            throw new Error(data.message || 'Failed to add contributor');
        }
      }
  
      await fetchContributors();
      setShowAddContributor(false);
      setNewContributor({ creator_id: '', role: 'Contributor' });
      toast.success("Successfully added contributor");
  
    } catch (error: any) {
      console.error('Add contributor error:', error);
      toast.error(error.message || 'Failed to add contributor');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/contributer/${creator_id}/${repo_name}/${userId}/role`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ role: newRole })
        }
      );

      if (response.ok) {
        await fetchContributors();
      }
    } catch (error) {
      setError('Failed to update role');
    }
  };

  const handleRemoveContributor = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this contributor?')) return;

    try {
      const response = await fetch(
        `${BASE_URL}/contributer/${creator_id}/${repo_name}/${userId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        await fetchContributors();
        toast.success("Removed contributor");
      }
    } catch (error) {
      setError('Failed to remove contributor');
      toast.error("Failed to remove contributor");
    }
  };

  const handleDeleteRepository = async () => {
    if (deleteConfirmation !== repo_name) {
      toast.error("Name didn't match");
      setDeleteConfirmation("");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/repo/${creator_id}/${repo_name}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        toast.success("Deleted the repository");
        navigate('/');
      }
    } catch (error) {
      setError('Failed to delete repository');
      toast.error("Failed to delete repository");
    }
  };

  useEffect(() => {
    setLoading(true);
    try {
      fetchRepoDetails();
      fetchContributors();
    } catch (error) {
      console.log("error:", error);
    } finally {
      setLoading(false);
    }
  }, [creator_id, repo_name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400 font-bold text-sm animate-pulse">Loading configurations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-brand-card border border-rose-200 dark:border-rose-950 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">{error}</p>
          <button
            onClick={() => navigate(`/${creator_id}/${repo_name}/main`)}
            className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-xl font-bold text-sm transition-all"
          >
            Back to Repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-16 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header and Return Button */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(`/${creator_id}/${repo_name}/main`)}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm"
            title="Back to Repository"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Repository Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Managing {repo_name}</p>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Basic Settings Card */}
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Repository Name</label>
                <input
                  type="text"
                  value={repoDetails.repo_name}
                  onChange={(e) => { setRepoDetails(prev => ({ ...prev, repo_name: e.target.value })); setChange(true); }}
                  className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={repoDetails.description}
                  onChange={(e) => { setRepoDetails(prev => ({ ...prev, description: e.target.value })); setChange(true); }}
                  className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all font-medium resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Visibility Settings Card */}
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Repository Visibility</h2>
            </div>
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <button
                onClick={() => { setRepoDetails({ ...repoDetails, visibility: 'Public' }); setChange(true); }}
                className={`w-full flex items-start p-5 rounded-2xl border transition-all ${repoDetails.visibility === 'Public'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'
                  }`}
              >
                <div className={`p-2 rounded-xl mr-3.5 flex-shrink-0 ${repoDetails.visibility === 'Public' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center">
                    Public
                    {repoDetails.visibility === 'Public' && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Visible on the web. Anyone can clone this repo.</p>
                </div>
              </button>

              <button
                onClick={() => { setRepoDetails({ ...repoDetails, visibility: 'Private' }); setChange(true); }}
                className={`w-full flex items-start p-5 rounded-2xl border transition-all ${repoDetails.visibility === 'Private'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'
                  }`}
              >
                <div className={`p-2 rounded-xl mr-3.5 flex-shrink-0 ${repoDetails.visibility === 'Private' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center">
                    Private
                    {repoDetails.visibility === 'Private' && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full ml-2"></span>}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">You choose explicitly who can see and commit.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Additional Metadata Card */}
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Additional Properties</h2>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">License</label>
                  <select
                    value={repoDetails.license}
                    onChange={(e) => {
                      setRepoDetails(prev => ({ ...prev, license: e.target.value }));
                      setChange(true);
                    }}
                    className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-medium cursor-pointer transition-all"
                  >
                    <option value="MIT License">MIT License</option>
                    <option value="Apache License 2.0">Apache License 2.0</option>
                    <option value="GNU GPL v3">GNU GPL v3</option>
                    <option value="BSD 3-Clause">BSD 3-Clause</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Primary Language</label>
                  <div className="relative flex items-center">
                    <select
                      value={repoDetails.language}
                      onChange={(e) => {
                        const selectedLang = e.target.value;
                        setRepoDetails(prev => ({
                          ...prev,
                          language: selectedLang,
                          languageColor: LANGUAGE_COLORS[selectedLang] || '#000000'
                        }));
                        setChange(true);
                      }}
                      className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-medium cursor-pointer transition-all"
                    >
                      <option value="">Select primary language</option>
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    {repoDetails.language && (
                      <div
                        className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                        style={{ backgroundColor: repoDetails.languageColor }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {repoDetails.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-100/80 dark:border-indigo-900/40 flex items-center"
                    >
                      #{tag}
                      <button
                        onClick={() => {
                          setRepoDetails(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }));
                          setChange(true);
                        }}
                        className="ml-1.5 p-0.5 bg-indigo-200/50 hover:bg-rose-500/20 text-indigo-700 hover:text-rose-600 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-rose-900/40 rounded transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press enter"
                  value={repoDetails.newTag || ''}
                  onChange={(e) => setRepoDetails(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = e.currentTarget.value;
                      const newTags = val
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag && !repoDetails.tags.includes(tag));

                      if (newTags.length > 0) {
                        setRepoDetails(prev => ({
                          ...prev,
                          tags: [...prev.tags, ...newTags],
                          newTag: ''
                        }));
                        setChange(true);
                      }
                    }
                  }}
                  className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 placeholder-slate-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all font-medium"
                />
              </div>

              {change && (
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6">
                  <button
                    className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                    onClick={handleUpdateRepo}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contributors Section Card */}
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Access & Collaborators</h2>
              <button
                onClick={() => setShowAddContributor(true)}
                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Invite
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {contributors.map((contributor) => (
                <div
                  key={contributor.user_id}
                  className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <img
                      src={contributor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.username)}&background=4F46E5&color=fff`}
                      alt={contributor.username}
                      className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{contributor.username}</p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{contributor.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                    <select
                      value={contributor.role}
                      onChange={(e) => handleUpdateRole(contributor.user_id, e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
                    >
                      <option value="Contributor">Contributor</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveContributor(contributor.user_id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Remove collaborator"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {contributors.length === 0 && (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                  No active contributors found.
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-rose-50/50 dark:bg-red-950/10 border border-rose-200 dark:border-rose-950 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-rose-200/60 dark:border-rose-950/60">
              <h2 className="text-lg font-extrabold tracking-tight text-rose-700 dark:text-red-400">Danger Zone</h2>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-base font-extrabold text-rose-700 dark:text-red-400 mb-1">Delete this repository</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mb-6">
                Once deleted, your code, issue trackers, pull requests, and branch history are deleted forever. Please proceed with extreme caution.
              </p>
              <div className="max-w-md space-y-3">
                <input
                  type="text"
                  placeholder={`Type "${repo_name}" to authorize deletion`}
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="appearance-none block w-full px-4 py-2 border border-rose-200 dark:border-rose-900/80 placeholder-rose-300 dark:placeholder-red-900/50 text-rose-900 dark:text-red-100 bg-white dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 text-sm font-bold transition-all"
                />
                <button
                  onClick={handleDeleteRepository}
                  className="inline-flex items-center px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-rose-600/10 active:scale-[0.98] transition-all w-full justify-center sm:w-auto"
                >
                  Delete this repository
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Add Contributor Modal Overlay */}
        {showAddContributor && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Invite Contributor</h3>
                <button onClick={() => setShowAddContributor(false)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. johndoe"
                    value={newContributor.creator_id}
                    onChange={(e) => setNewContributor(prev => ({ ...prev, creator_id: e.target.value }))}
                    className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Role</label>
                  <select
                    value={newContributor.role}
                    onChange={(e) => setNewContributor(prev => ({ ...prev, role: e.target.value }))}
                    className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-medium cursor-pointer"
                  >
                    <option value="Contributor">Contributor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-8 pt-2">
                  <button
                    onClick={() => setShowAddContributor(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContributor}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}