import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, GitFork, Plus, GitBranch, Settings, Folder, File, Clock, Download, Shield, Info, ExternalLink, GitPullRequest, Users, AlertCircle } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { BASE_URL, useAuth } from '../context/AuthContext';
import { Commit, Repository as repoType } from '../types/repository_types';
import { timeAgo } from '../lib/timeAlgo';
import AddFileModal from '../components/AddFileModal';
import { marked } from 'marked';

interface FileItem {
  file_name: string;
  file_id: number;
  type?: 'file' | 'folder';
  commit_message: string;
  commit_timestamp: string;
  commit_creator_id: number;
  username: string;
}

interface CommitItems extends Commit {
  User: {
    username: string
  }
}

export default function Repository() {
  const { creator_id, repo_name, branch_name } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [repo, setRepo] = useState<repoType | null>()
  const [currentPath, setCurrentPath] = useState('');
  const [starStatus, setStarStatus] = useState(false);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const { user, getCurrentContributer, contributer } = useAuth();
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    await fetchAllFiles();
    await fetchRepo();
    setLoading(false);
  }


  const handleAddFile = async (file: globalThis.File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BASE_URL}/file/save/${creator_id}/${repo_name}/${branch_name}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Upload success:', result);
        await fetchAllFiles();
        setIsModalOpen(false);
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
    setIsModalOpen(false);
  };
  const fetchAllFiles = async () => {
    try {

      //fetch contributer
      await getCurrentContributer(creator_id as string, repo_name as string);

      const response = await fetch(`${BASE_URL}/file/all/${creator_id}/${repo_name}/${branch_name}/`, {
        credentials: 'include'
      });
      const data = await response.json();
     
      setFileItems(data.data);
      
      console.log("files data", data);
    } catch (error) {
      console.log(error);
    }
  }
  const fetchReadmeContent = async () => {
    console.log("readme start")
    const readmeFile = fileItems?.find(file => file.file_name.toLowerCase() === 'readme.md');
    if (readmeFile) {
      console.log("redme file",readmeFile);
      try {
        const response = await fetch(
          `${BASE_URL}/file/get/${creator_id}/${repo_name}/${branch_name}/${readmeFile.file_name}`,
          { credentials: 'include' }
        );
        const data = await response.json();
        if (response.ok) {
          setReadmeContent(data.content);
          console.log("readme content",data);
        }
      } catch (error) {
        console.error('Failed to fetch README content:', error);
      }
    }
  };


  const fetchRepo = async () => {
    try {
      const response = await fetch(`${BASE_URL}/repo/get/${creator_id}/${repo_name}/`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRepo(data.data);



    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fileItems?.some(file => file.file_name.toLowerCase() === 'readme.md')) {
     fetchReadmeContent();
   }
    
  }, [fileItems])
  

  const handleStar = () => {
    setStarStatus(!starStatus);
  };

  const handlePathChange = (path: string) => {
    setCurrentPath(path);
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  const handlePullRequests = () => {
    navigate(`/${creator_id}/${repo_name}/pull`);
  };

  const handleIssues = () => {
    navigate(`/${creator_id}/${repo_name}/issues`);
  };

  const handleContributors = () => {
    navigate(`/${creator_id}/${repo_name}/contributors`);
  };
  const handleHistory = () => {
    navigate(`/${creator_id}/${repo_name}/${branch_name}/history`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <SkeletonLoader type="card" count={1} />
        ) : (
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm p-6 sm:p-8 mb-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center mb-2 flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {repo?.repo_name}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border
                    ${repo?.visibility === 'Private' 
                      ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'}`}
                  >
                    {repo?.visibility}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{repo?.description || "No description provided."}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleStar}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
                    starStatus 
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Star size={16} className={starStatus ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                  <span>{starStatus ? (repo?.stars ?? 0) + 1 : repo?.stars ?? 0}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-sm font-medium">
              <div className="flex items-center text-slate-500 dark:text-slate-400">
                <button 
                  onClick={() => navigate(`/${creator_id}/${repo_name}/branches`)}
                  className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <GitBranch size={16} className="mr-2" />
                  <span>Branches</span>
                </button>
              </div>

              <div className="flex items-center text-slate-500 dark:text-slate-400">
                <Clock size={16} className="mr-2" />
                <span>Created {timeAgo(repo?.creation_date as string)}</span>
              </div>

              <div className="flex items-center text-slate-500 dark:text-slate-400">
                <Shield size={16} className="mr-2" />
                <span>{repo?.license || 'MIT'} License</span>
              </div>
            </div>
          </div>
        )}

        {/* Replace the buttons section with this updated version */}
        <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 mb-6 transition-colors duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left side buttons group */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleIssues}
                className="flex items-center space-x-1 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:border-emerald-900/50 rounded-xl font-semibold text-xs sm:text-sm transition-all"
              >
                <AlertCircle size={15} className="mr-1" />
                <span>Issues</span>
              </button>

              <button
                onClick={handleContributors}
                className="flex items-center space-x-1 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-900/50 rounded-xl font-semibold text-xs sm:text-sm transition-all"
              >
                <Users size={15} className="mr-1" />
                <span>Contributors</span>
              </button>

              <button 
                onClick={handleHistory}
                className="flex items-center space-x-1 px-3.5 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:border-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all"
              >
                <Clock size={15} className="mr-1" />
                <span>History</span>
              </button>
            </div>

            {/* Right side buttons group - Moved Add File here */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm shadow-indigo-500/10 font-semibold text-xs sm:text-sm rounded-xl transition-all active:scale-95"
              >
                <Plus size={15} className="mr-1" />
                <span>Add File</span>
              </button>

              {contributer?.role === 'Admin' && (
                <>
                  {branch_name !== 'main' && (
                    <button
                      onClick={handlePullRequests}
                      className="flex items-center space-x-1 px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:border-purple-900/50 rounded-xl font-semibold text-xs sm:text-sm transition-all"
                    >
                      <GitPullRequest size={15} className="mr-1" />
                      <span>Pull Requests</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/${creator_id}/${repo_name}/settings`)}
                    className="flex items-center space-x-1 px-3.5 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:border-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all"
                  >
                    <Settings size={15} className="mr-1" />
                    <span>Settings</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* File list */}
        {loading ? (
          <SkeletonLoader type="table" />
        ) : (
          <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fileItems?.map((file, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(`/${creator_id}/${repo_name}/${currentBranch}/${currentPath ? `${currentPath}/` : ''}${file.file_name}`);
                  }}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center">
                    <File size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors mr-3" />
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {file.file_name}
                    </span>
                  </div>

                  <div className="hidden md:flex items-center text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span className="mr-6 max-w-xs truncate">{file.commit_message}</span>
                    <span className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg flex-shrink-0">
                      <Clock size={12} className="mr-1.5 text-slate-400" />
                      {timeAgo(file.commit_timestamp)} by <span className="ml-1 text-slate-600 dark:text-slate-300">{file.username}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {fileItems?.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-500">
                <Info size={44} className="mb-3 opacity-40" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No files found</h3>
                <p className="text-sm text-center max-w-sm text-slate-500 dark:text-slate-400">This repository is empty or no files match your current filter.</p>
              </div>
            )}
          </div>
        )}

        {/* README preview (if exists) */}
        {fileItems?.some(file => file.file_name.toLowerCase() === 'readme.md') && (
          <div className="mt-8 bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="border-b border-slate-100 dark:border-slate-800/60 p-4 px-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">README.md</h2>
              <button
                onClick={() => navigate(`/${creator_id}/${repo_name}/${currentBranch}/${fileItems?.find(file => file.file_name.toLowerCase() === 'readme.md')?.file_name}`)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl transition-colors"
              >
                <ExternalLink size={13} className="mr-1.5" />
                <span>View full</span>
              </button>
            </div>
            <div className="p-6 sm:p-8 prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-slate-300">
              {readmeContent ? (
                <div dangerouslySetInnerHTML={{ __html: marked(readmeContent) }} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <AddFileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onFileSelected={handleAddFile}
        />
      )}
    </div>
  );
}