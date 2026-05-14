import React,{useState,useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, GitCommit, Clock ,X} from 'lucide-react';
import { BASE_URL } from '../context/AuthContext';
import { timeAgo } from '../lib/timeAlgo';

interface BranchList {
  User:{username:string},
  branch_id:number,
  name: string;
  lastCommit: {commit_message:string,commit_timestamp:string,User:{username:string}};
}

export default function BranchList() {
  const { creator_id, repo_name } = useParams();
  const [branchList, setBranchList] = useState<BranchList[]|null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllBranches();
  }, []);

  const fetchAllBranches= async()=>{
    const response = await fetch(`${BASE_URL}/branch/list/${creator_id}/${repo_name}`,{
      credentials:'include'
    });
    const data= await response.json();
    setBranchList(data.data);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/branch/create/${creator_id}/${repo_name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newBranchName,
          base_branch: baseBranch
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchAllBranches();
        setShowCreateModal(false);
        setNewBranchName('');
        setBaseBranch('main');
      } else {
        setError(data.message || 'Failed to create branch');
      }
    } catch (err) {
      setError('Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-xl mr-3 flex-shrink-0">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Active Branches</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Select a branch to view code history.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
            >
              Create New Branch
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {branchList && branchList.length > 0 ? (
              branchList.map((branch) => (
                <div
                  key={branch.branch_id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
                    <div className="flex items-center min-w-0 flex-1">
                      <GitBranch className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <button
                        onClick={() => navigate(`/${creator_id}/${repo_name}/${branch.name}`)}
                        className="ml-2.5 font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-base text-left truncate transition-colors"
                      >
                        {branch.name}
                      </button>
                      {branch.name === 'main' && (
                        <span className="ml-2 px-2 py-0.5 text-[9px] font-extrabold tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50 rounded-md flex items-center">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {branch.name !== 'main' && (
                        <button
                          onClick={() => navigate(`/${creator_id}/${repo_name}/pull`)}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:border-indigo-900/60 dark:hover:bg-indigo-950/20 rounded-xl transition-all active:scale-95"
                        >
                          Create PR
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                    <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60 max-w-fit">
                      <GitCommit className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="truncate">{branch.lastCommit?.commit_message||"Initial commit"}</span>
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 opacity-60" />
                      <span>
                        Updated {timeAgo(branch?.lastCommit?.commit_timestamp||'2025-04-12T15:08:23.769Z') } by <span className="text-slate-600 dark:text-slate-300">{branch.lastCommit?.User.username||"root"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                <GitBranch className="mx-auto h-10 w-10 opacity-30 mb-3" />
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No branches loaded</p>
                <p className="text-xs font-medium mt-0.5">Wait for server loading or create a new branch.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Branch Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">New Branch</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-medium placeholder-slate-400"
                  placeholder="e.g. feature/login"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Source Base Branch
                </label>
                <select
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-medium cursor-pointer"
                >
                  {branchList?.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-lg flex items-center">
                  <span>⚠️ {error}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? 'Spawning...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
