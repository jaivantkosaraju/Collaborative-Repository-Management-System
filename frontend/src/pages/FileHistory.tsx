import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitCommit, Clock, ChevronLeft, File as FileIcon, ExternalLink } from 'lucide-react';
import { timeAgo } from '../lib/timeAlgo';
import { BASE_URL } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface FileCommit {
  commit_id: number;
  commit_message: string;
  commit_timestamp: string;
  username: string;
  avatar?: string;
}

interface RouteParams {
  creator_id?: string;
  repo_name?: string;
  branch_name?: string;
  file_name?: string;
  [key: string]: string | undefined;
}

export default function FileHistory() {
  const { creator_id, repo_name, branch_name, file_name } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [commits, setCommits] = useState<FileCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFileHistory();
  }, [creator_id, repo_name, branch_name, file_name]);

  const fetchFileHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!creator_id || !repo_name || !branch_name || !file_name) {
        throw new Error('Missing required parameters');
      }

      const response = await fetch(
        `${BASE_URL}/file/history/${creator_id}/${repo_name}/${branch_name}/${file_name}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to fetch file history');
      }

      const result = await response.json();
      
      if (!Array.isArray(result?.data)) {
        throw new Error('Invalid response format');
      }

      setCommits(result.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      console.error('Error fetching file history:', error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewCommit = (commitId: number) => {
    navigate(`/${creator_id}/${repo_name}/${branch_name}/${file_name}/${commitId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-brand-card border border-rose-200 dark:border-rose-950 p-8 rounded-3xl max-w-md w-full text-center shadow-lg">
          <h2 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mb-2">Revision Error</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-xl font-bold text-sm transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">File Revisions</h1>
            <div className="flex items-center mt-0.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <FileIcon className="h-3.5 w-3.5 mr-1 opacity-70" />
              <span className="font-mono">{file_name}</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 uppercase text-[10px] tracking-wider">{branch_name}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center shadow-sm">
            <div className="text-slate-400 dark:text-slate-500 font-bold text-sm animate-pulse">Loading file lineage...</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                History ({commits?.length ?? 0} {commits?.length === 1 ? 'commit' : 'commits'})
              </h2>
            </div>
            
            {commits && commits.length > 0 ? (
              <div className="p-2 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
                {commits.map((commit) => (
                  <div
                    key={commit.commit_id}
                    className="flex items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-2xl transition-all duration-200 cursor-pointer group"
                    onClick={() => handleViewCommit(commit.commit_id)}
                  >
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                      <GitCommit className="h-4 w-4" />
                    </div>

                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug break-all line-clamp-2">
                          {commit.commit_message}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <div className="flex items-center font-bold text-slate-600 dark:text-slate-300">
                          <img
                            src={commit.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(commit.username)}&background=4F46E5&color=fff`}
                            alt={`${commit.username}'s avatar`}
                            className="h-4 w-4 rounded-full mr-1.5"
                          />
                          <span>@{commit.username}</span>
                        </div>
                        
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                        
                        <div className="flex items-center" title={new Date(commit.commit_timestamp).toLocaleString()}>
                          <Clock className="h-3.5 w-3.5 mr-1 opacity-75" />
                          <span>{timeAgo(commit.commit_timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                <GitCommit className="h-12 w-12 opacity-25 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No revision history</p>
                <p className="text-xs font-medium mt-0.5">This resource does not contain registered mutations.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}