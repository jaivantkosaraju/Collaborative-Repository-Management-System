import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, User, ChevronLeft, GitMerge, Send } from 'lucide-react';
import { BASE_URL } from '../context/AuthContext';
import { timeAgo } from '../lib/timeAlgo';

interface PullRequestReview {
  pr_id: number;
  reviewer_id: number;
  review_comments: string;
  review_date: string;
  User: {
    username: string;
    avatar_url: string;
  };
}

interface PullRequest {
  pr_id: number;
  creator_id: number;
  pr_title: string;
  pr_description: string;
  pr_status: 'Open' | 'Merged' | 'Closed';
  base_branch_id: number;
  target_branch_id: number;
  creation_date: string;
  User: {
    username: string;
  };
  baseBranch: {
    name: string;
  };
  targetBranch: {
    name: string;
  };
}

export default function PullRequestDetail() {
  const { creator_id, repo_name, pr_id } = useParams();
  const navigate = useNavigate();
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [reviews, setReviews] = useState<PullRequestReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    comment: ''
  });

  const fetchPullRequest = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pull-requests/${pr_id}/${creator_id}/${repo_name}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch pull request');
      }

      const data = await response.json();
      setPullRequest(data.pullRequest);
      setReviews(data.pull_Request_Reviews || []);
    } catch (err) {
      console.error('Failed to load pull request details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setSubmitting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/pull-requests/${pr_id}/${creator_id}/${repo_name}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            comment: newReview.comment
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      await fetchPullRequest(); 
      setNewReview({ comment: '' });
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'Merged' | 'Closed') => {
    try {
      const response = await fetch(
        `${BASE_URL}/pull-requests/status/${pr_id}/${creator_id}/${repo_name}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus.toLowerCase()} pull request`);
      }

      setPullRequest(prev => prev ? { ...prev, pr_status: newStatus } : null);
    } catch (err) {
      console.error(`Failed to update pull request status`, err);
    }
  };

  useEffect(() => {
    fetchPullRequest();
  }, [pr_id, creator_id, repo_name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  if (!pullRequest) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Pull Request Not Found</h2>
          <button
            onClick={() => navigate(`/${creator_id}/${repo_name}/pulls`)}
            className="mt-5 inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm rounded-xl transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            Back to Pull Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/${creator_id}/${repo_name}/pulls`)}
            className="group flex items-center text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-4 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 w-fit"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Pull Requests
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/60 pb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {pullRequest.pr_title}
              </h1>
              <div className="flex flex-wrap items-center mt-3 gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                <span className="text-slate-400 font-bold">#{pullRequest.pr_id}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1.5 text-slate-400" />
                  {pullRequest.User.username}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Opened {timeAgo(pullRequest.creation_date)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0 self-start">
              {pullRequest.pr_status === 'Open' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('Merged')}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95"
                  >
                    <GitMerge className="h-4 w-4 mr-2" />
                    Merge
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Closed')}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/10 transition-all active:scale-95"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase mb-3">Description</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium text-sm sm:text-base leading-relaxed">
                {pullRequest.pr_description || "No description provided for this pull request."}
              </p>
            </div>

            {/* Reviews Module */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center px-1">
                Discussion & Reviews
                <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-md font-bold">
                  {reviews.length}
                </span>
              </h2>
              
              {/* Review Inputs */}
              {pullRequest.pr_status === 'Open' && (
                <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ comment: e.target.value })}
                      placeholder="Add your review comment..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-medium resize-none"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50 active:scale-95"
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        {submitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Review Log */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={`${review.pr_id}-${review.reviewer_id}-${review.review_date}`} className="bg-white dark:bg-brand-card border border-slate-100 dark:border-slate-800/70 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={review.User?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.User?.username || '')}&background=4F46E5&color=fff`}
                          alt={review.User.username}
                          className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{review.User.username}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {timeAgo(review.review_date)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm pl-9 leading-relaxed">{review.review_comments}</p>
                  </div>
                ))}

                {reviews.length === 0 && pullRequest.pr_status !== 'Open' && (
                  <p className="text-center text-sm text-slate-400 dark:text-slate-500 font-semibold py-4">No reviews recorded for this pull request.</p>
                )}
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide pb-4 uppercase">PR Summary</h2>
              
              <div className="py-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase mb-1.5">Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                    pullRequest.pr_status === 'Open' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                      : pullRequest.pr_status === 'Merged'
                        ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}>
                    {pullRequest.pr_status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase mb-1.5">Base Branch</h3>
                  <code className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-950/50 font-semibold text-indigo-600 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-800/50 inline-block truncate max-w-full">
                    {pullRequest.baseBranch.name}
                  </code>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase mb-1.5">Compare Branch</h3>
                  <code className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-950/50 font-semibold text-indigo-600 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-800/50 inline-block truncate max-w-full">
                    {pullRequest.targetBranch.name}
                  </code>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase mb-1.5">Merge Logic</h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Merges <code className="text-indigo-500">{pullRequest.targetBranch.name}</code> into <code className="text-indigo-500">{pullRequest.baseBranch.name}</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}