import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { History, Download, Edit, ChevronLeft, Clipboard, Check, Save } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { BASE_URL } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function FileView() {
  const { creator_id, repo_name, branch_name, file_name ,commit_id} = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState('');
  const [, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFileContent();
  }, [file_name, branch_name]);

  const fetchFileContent = async () => {
    const url = (commit_id)?`${BASE_URL}/file/get/${creator_id}/${repo_name}/${branch_name}/${file_name}/${commit_id}`:`${BASE_URL}/file/get/${creator_id}/${repo_name}/${branch_name}/${file_name}`;
    setLoading(true);
    try {
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      setFileContent(data.content || '');
      setOriginalContent(data.content || '');
    } catch (e) {
      toast.error("Could not load file content");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = file_name || 'file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${BASE_URL}/file/update/${creator_id}/${repo_name}/${branch_name}/${file_name}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: fileContent,
          commit_message: commitMessage || `Updated ${file_name}`
        })
      });

      const result = await response.json();
      if (response.ok) {
        setOriginalContent(fileContent);
        setIsEditing(false);
        setCommitMessage('');
        toast.success("Saved changes successfully");
      } else {
        toast.error("Failed to save: " + result.error);
      }
    } catch (e) {
      toast.error("Save operation failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="py-12">
            <SkeletonLoader type="code" />
          </div>
        ) : (
          <>
            {/* Back Navigation & Title */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => navigate(`/${creator_id}/${repo_name}/${branch_name}`)}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm flex items-center justify-center"
                title="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight break-all flex items-center gap-2">
                  <span>{file_name}</span>
                  {commit_id && (
                    <span className="px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-wider bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md">
                      REV {commit_id.toString().substring(0, 6)}
                    </span>
                  )}
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Viewing on branch <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{branch_name}</span></p>
              </div>
            </div>

            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden mb-8 transition-colors duration-300">
              
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/20 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate(`/${creator_id}/${repo_name}/${branch_name}/${file_name}/history`)}
                    className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <History size={14} className="mr-1.5 text-slate-400" />
                    History
                  </button>

                  <button 
                    onClick={handleDownload} 
                    className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <Download size={14} className="mr-1.5 text-slate-400" />
                    Download
                  </button>

                  <button 
                    onClick={handleCopyCode} 
                    className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? <Check size={14} className="mr-1.5 text-emerald-500" /> : <Clipboard size={14} className="mr-1.5 text-slate-400" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="inline-flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                    >
                      <Edit size={14} className="mr-1.5" />
                      Edit Source
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Edit / View Panel Container */}
              <div className="relative">
                {isEditing ? (
                  <div className="p-5 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/20">
                    <textarea
                      className="w-full h-[400px] p-4 font-mono text-xs leading-relaxed bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner resize-y"
                      value={fileContent}
                      spellCheck={false}
                      onChange={(e) => setFileContent(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-4">
                      <div className="w-full flex-1 max-w-lg">
                        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Revision Commit Note</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-medium transition-all"
                          placeholder={`Update ${file_name}...`}
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleSaveChanges} 
                        className="inline-flex items-center px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/10 transition-all active:scale-95 shrink-0"
                      >
                        <Save size={14} className="mr-1.5" />
                        Push Revision
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                      <table className="w-full border-collapse">
                        <tbody>
                          {fileContent.split('\n').map((line, index) => (
                            <tr key={index} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 font-mono text-xs leading-relaxed transition-colors">
                              <td className="py-0.5 px-4 text-slate-400 select-none text-right border-r border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 w-12 whitespace-nowrap shrink-0">
                                {index + 1}
                              </td>
                              <td className="py-0.5 px-5 font-mono whitespace-pre-wrap break-all text-slate-800 dark:text-slate-200 min-w-0">
                                {line || ' '}
                              </td>
                            </tr>
                          ))}
                          {fileContent.length === 0 && (
                            <tr>
                              <td colSpan={2} className="py-16 px-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                                <p className="text-xs italic">Empty file content or binary resource.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
