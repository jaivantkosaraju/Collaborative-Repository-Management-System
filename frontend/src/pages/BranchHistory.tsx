import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitCommit, Clock, ChevronLeft } from 'lucide-react';
import { timeAgo } from '../lib/timeAlgo';
import { BASE_URL } from '../context/AuthContext';
import { Commit } from '../types/repository_types';

interface CommitItem extends Commit {
  User: {
    username: string;
  };
}

export default function BranchHistory() {
  const { creator_id, repo_name, branch_name } = useParams();
  const [commits, setCommits] = useState<CommitItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommits();
  }, []);

  const fetchCommits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/commit/all/${creator_id}/${repo_name}/${branch_name}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setCommits(data.data);
    } catch (err) {
      console.error('Error fetching commits:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400 font-bold text-sm animate-pulse">Retrieving revision history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back button / Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Commit History</h1>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center">
              <span>branch:</span>
              <span className="ml-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded-md font-mono uppercase text-[10px] tracking-wider">{branch_name}</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recent commits</h2>
          </div>

          <div className="p-2 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {commits && commits.length > 0 ? (
              commits.map((commit) => (
                <div
                  key={commit.commit_id}
                  className="flex items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-2xl transition-all duration-200"
                >
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                    <GitCommit className="h-4 w-4" />
                  </div>
                  
                  <div className="ml-4 min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug truncate">
                      {commit.commit_message}
                    </h3>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <span className="font-bold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer">
                        @{commit.User.username}
                      </span>
                      
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full hidden sm:inline"></span>
                      
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-slate-400/70" />
                        <span>{timeAgo(commit.commit_timestamp)}</span>
                      </div>

                      {commit.commit_hash && (
                        <>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full hidden sm:inline"></span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-1.5 py-0.5 rounded tracking-tight opacity-80">
                            {commit.commit_hash.substring(0, 7)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 px-6 text-center text-slate-400 dark:text-slate-500">
                <GitCommit className="h-12 w-12 opacity-25 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No commits found</p>
                <p className="text-xs font-medium mt-0.5">This branch has zero history recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
