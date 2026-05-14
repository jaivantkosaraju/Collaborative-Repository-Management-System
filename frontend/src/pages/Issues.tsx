import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, AlertCircle, CheckCircle, Clock, User, Edit, Search, Trash2 } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { BASE_URL, useAuth } from '../context/AuthContext';
import { User as User_template } from '../types/auth';
import { Issue } from '../types/repository_types';
import { timeAgo } from '../lib/timeAlgo';
import toast from 'react-hot-toast';

interface Issueitems extends Issue {
  assignee: User_template;
  creator: User_template
}



export default function Issues() {
  const { creator_id, repo_name } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issueitems[]>([]);
  const [filter, setFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIssues, setFilteredIssues] = useState<Issueitems[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issueitems | null>(null);
  const [contributors, setContributors] = useState<User_template[]>([]);
  const { user } = useAuth();
  const fetchContributors = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/contributer/all/${creator_id}/${repo_name}/`,
        { credentials: 'include' }
      );
      const data = await response.json();
      console.log("contributers deatils", data.data);
      if (data.message === "Successfully retrieved contributors") {
        setContributors(data.data.contributors);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };
  const canEditIssue = (issue: Issueitems) => {
    return (
      user?.user_id === issue.creator_id || // Creator
      user?.user_id === issue.assignee_id 
    );
  };
  
  

  useEffect(() => {
    fetchContributors();
  }, [creator_id, repo_name]);

  const handleAssign = async (userId: string | null) => {
    if (!selectedIssue) return;

    try {
      console.log("userid", userId)
      const response = await fetch(
        `${BASE_URL}/issues/${creator_id}/${repo_name}/${selectedIssue.issue_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ assignee_id: userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to assign issue');
      }

      // Refresh issues list
      await fetchIssues();
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning issue:', error);
    }
  };
  useEffect(() => {
    fetchIssues();
  }, [creator_id, repo_name, filter]);


  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/issues/${creator_id}/${repo_name}`,
        { method: 'GET', credentials: 'include' }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to fetch issues ,${data.error}`);
      }
      console.log("issue data", data.data);
      setIssues(data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add create issue function
  const handleCreateIssue = () => {
    navigate(`/${creator_id}/${repo_name}/issues/new`);
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      const response = await fetch(
        `${BASE_URL}/issues/${creator_id}/${repo_name}/${issueId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (response.ok) {
        toast.success("Issue deleted successfully");
        fetchIssues();
      } else {
        throw new Error("Failed to delete issue");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete issue");
    }
  };

  const handleClearResolved = async () => {
    if (!window.confirm("Are you sure you want to permanently remove all resolved (closed) issues?")) return;
    try {
      const response = await fetch(
        `${BASE_URL}/issues/${creator_id}/${repo_name}/clear-resolved`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (response.ok) {
        toast.success("Resolved issues cleared successfully");
        fetchIssues();
      } else {
        throw new Error("Failed to clear resolved issues");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to clear resolved issues");
    }
  };

  // Add search functionality
  useEffect(() => {
    const filteredIssues = issues.filter(issue =>
      (issue.issue_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issue_description.toLowerCase().includes(searchQuery.toLowerCase())) && (filter == 'All' || issue.status == filter)
    )

    setFilteredIssues(filteredIssues);
  }, [searchQuery, issues, filter]);





  // Add this component inside your Issues component, before the return statement
  const AssigneeModal = () => {
    if (!showAssignModal) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
          {user?.user_id == selectedIssue?.creator_id ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Assign Issue</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    handleAssign(null);
                    setShowAssignModal(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-950/30 rounded-xl flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50 transition-all"
                >
                  <User className="h-5 w-5 mr-3 text-slate-400" />
                  <span>Unassigned</span>
                </button>
                {contributors?.map((contributor) => (
                  <button
                    key={contributor.user_id}
                    onClick={() => handleAssign(contributor.user_id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-950/30 rounded-xl flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50 transition-all"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        contributor.full_name || contributor.username
                      )}&background=4F46E5&color=fff`}
                      alt={contributor.username}
                      className="h-6 w-6 rounded-full mr-3 shadow-sm"
                    />
                    <span>{contributor.username}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-start gap-4">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Only the creator of the issue can assign this issue to a contributor.
                </p>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition-all"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/${creator_id}/${repo_name}/main`)}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Issues</h1>
          </div>
          <button
            onClick={handleCreateIssue}
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 rounded-xl transition-all active:scale-95 flex-shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            <span>New Issue</span>
          </button>
        </div>

        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden mb-6 transition-colors duration-300">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
                  {(['All', 'Open', 'Closed'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilter(opt)}
                      className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        filter === opt 
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                
                {issues.some(issue => issue.status === 'Closed') && (
                  <button
                    onClick={handleClearResolved}
                    className="inline-flex items-center px-4 py-2 text-xs font-extrabold text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white border border-red-200 dark:border-red-900/30 hover:bg-red-600 dark:hover:bg-red-600/80 rounded-xl bg-red-50/30 dark:bg-red-950/10 shadow-sm transition-all active:scale-95"
                    title="Permanently remove all closed issues"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Clear Resolved
                  </button>
                )}
              </div>
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-950/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader type="table" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {issues.length === 0 ? (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No issues found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">There are no issues matching your current filter.</p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.issue_id}
                    className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
                  >
                    <div className="flex items-start">
                      <div className="mr-4 mt-0.5">
                        {issue.status === 'Open' ? (
                          <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
                            {issue.issue_title}
                          </h3>
                          <div className="flex items-center space-x-2 flex-shrink-0 self-start sm:self-auto">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIssue(issue);
                                setShowAssignModal(true);
                              }}
                              className="inline-flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                            >
                              {issue?.assignee_id ? (
                                <>
                                  <img
                                    src={issue.assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(issue.assignee?.full_name || issue.assignee?.username || 'User')}&background=4F46E5&color=fff`}
                                    alt={issue.assignee.username}
                                    className="h-4 w-4 rounded-full"
                                  />
                                  <span>{issue.assignee.username}</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                  <span>Unassigned</span>
                                </>
                              )}
                            </button>
                            {canEditIssue(issue) && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/${creator_id}/${repo_name}/issues/${issue.issue_id}/edit`);
                                  }}
                                  className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 border border-slate-100 dark:border-slate-800 rounded-lg transition-all"
                                  title="Edit issue"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteIssue(issue.issue_id);
                                  }}
                                  className="p-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 border border-slate-100 dark:border-slate-800 rounded-lg transition-all"
                                  title="Delete issue"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                          {issue.issue_description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          {issue?.labels?.map((label, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-[11px] rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50"
                            >
                              {label}
                            </span>
                          ))}
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-slate-400 dark:text-slate-500" />
                            <span>Opened {timeAgo(issue.creation_date)} by <span className="text-slate-600 dark:text-slate-300">{issue.creator.username}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {showAssignModal && <AssigneeModal />}
    </div>
  );
}