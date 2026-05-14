import React, { useEffect, useState } from 'react';
import { Pencil, Save, X, Lock, Github, MapPin, Mail, Globe, Calendar ,GitFork} from 'lucide-react';
import { BASE_URL, useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { User } from '../types/auth';
import { timeAgo } from '../lib/timeAlgo';
import toast from 'react-hot-toast';
// import { Repository,ContributerDetails } from '../types/repository_types';
// import Repository from './Repository';
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

interface ContributerDetails {
  repo_id: number;
  user_id: number;
  role: 'Admin' | 'Write' | 'Read';
  Repository: Repository;
}
interface RepoItems extends ContributerDetails {
  Repository: Repository

}

export default function Profile() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [authorized, setAuthorized] = useState<Boolean>(false);
  const { user } = useAuth();
  const [repos, setRepos] = useState<RepoItems[] | null>(null)




  useEffect(() => {
    fetchUser();
    fetchRepos();

  }, [id])


  const [userDetails, setUserDetails] = useState<User | null>(null);
  useEffect(() => {
    if (id == user?.user_id) {
      setAuthorized(true);
    }

  }, [userDetails, id]);

  const fetchUser = async () => {
    const res = await fetch(`${BASE_URL}/user/${id}`, {
      credentials: 'include'
    })
    const data = await res.json();
    console.log("user data", data);
    setUserDetails({ ...data.data });

  };

  const fetchRepos = async () => {
    const res = await fetch(`${BASE_URL}/repo/specific/${id}`, {

      credentials: 'include'
    });
    const data = await res.json();
    console.log("repo details", data)
    setRepos(data.data)

  }

  const [editedDetails, setEditedDetails] = useState({ ...userDetails });

  // Repository data from your desired profile



  const handleEditToggle = () => {
    if (isEditing) {
      setUserDetails(editedDetails as User);
    } else {
      setEditedDetails({ ...userDetails });
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDetails({ ...userDetails });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedDetails({
      ...editedDetails,
      [name]: value,
    });
  };

  const handleEdit = async () => {
    try {
      console.log("hit edit");
      console.log(editedDetails);
      const res = await fetch(`${BASE_URL}/user/update/${userDetails?.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editedDetails),
      })
      const data = await res.json();
      console.log("updated data", data);
      setUserDetails(editedDetails as User);

      toast.success("Updated Profile")
      

    } catch (error) {
      console.log(error);
      toast.error("Failed to Update Profile")
    }
    finally {

      setIsEditing(false)
    }



  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
              <div className="relative">
                <div className="h-28 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600"></div>
                
                <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                  <div className="relative group">
                    <img
                      src={(authorized && !isEditing ? userDetails?.avatar : editedDetails.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.full_name || 'User')}&background=4F46E5&color=fff`}
                      alt="Profile"
                      className="h-28 w-28 rounded-full border-4 border-white dark:border-slate-900 shadow-lg object-cover"
                    />
                    {(authorized && !isEditing) && (
                      <button
                        onClick={handleEditToggle}
                        className="absolute -right-2 bottom-1 p-2 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white rounded-full shadow-md transition-all scale-90 hover:scale-100"
                        title="Edit profile"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="pt-20 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={editedDetails.full_name}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editedDetails.username}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={editedDetails.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editedDetails.email}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editedDetails?.location}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={editedDetails?.website}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        name="avatar"
                        value={editedDetails?.avatar}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div className="flex space-x-3 pt-3">
                      <button
                        onClick={() => { handleEditToggle(); handleEdit(); }}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                      >
                        <Save size={15} className="mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                      >
                        <X size={15} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-20 p-6 text-center">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{userDetails?.full_name}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">@{userDetails?.username}</p>
                  
                  {userDetails?.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      {userDetails?.bio}
                    </p>
                  )}
                  
                  <div className="mt-6 space-y-3 text-left text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                    {userDetails?.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-3 text-slate-400" />
                        <span>{userDetails?.location}</span>
                      </div>
                    )}
                    {userDetails?.email && (
                      <div className="flex items-center truncate">
                        <Mail size={16} className="mr-3 text-slate-400 flex-shrink-0" />
                        <span>{userDetails?.email}</span>
                      </div>
                    )}
                    {userDetails?.website && (
                      <div className="flex items-center truncate">
                        <Globe size={16} className="mr-3 text-slate-400 flex-shrink-0" />
                        <a href={userDetails?.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                          {userDetails?.website.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
                      <Calendar size={16} className="mr-3 text-slate-400" />
                      <span>Joined {timeAgo(userDetails?.registration_date as string)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Private Repositories */}
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                  <Lock size={18} className="mr-2.5 text-indigo-600 dark:text-indigo-400" />
                  Private Repositories
                </h2>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200/20 dark:border-slate-800/50">
                  {repos?.filter(repo => repo.Repository.visibility === 'Private').length || 0} repos
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {repos?.filter(repo => repo.Repository.visibility === 'Private').map((repo) => (
                  <div key={repo.Repository.repo_id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                          <a href={`/${repo.Repository.creator_id}/${repo.Repository.repo_name}/main`}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center truncate w-fit">
                            {repo.Repository.repo_name}
                            <span className="ml-2.5 px-2 py-0.5 text-[10px] font-extrabold tracking-wide rounded-md bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 flex items-center">
                              <Lock size={10} className="mr-1" />
                              PRIVATE
                            </span>
                          </a>
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium line-clamp-2">
                          {repo.Repository.description || "No description provided."}
                        </p>
                        
                        <div className="mt-4 flex items-center flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          {repo.Repository.language && (
                            <span className="flex items-center">
                              <span
                                style={{ backgroundColor: repo.Repository.languageColor || '#6366F1' }}
                                className="w-2.5 h-2.5 rounded-full inline-block mr-2 ring-2 ring-white dark:ring-slate-900">
                              </span>
                              {repo.Repository.language}
                            </span>
                          )}
                          <span>Updated {timeAgo(repo.Repository.creation_date)}</span>
                          {repo.Repository.license && <span>License: {repo.Repository.license}</span>}
                        </div>

                        {repo.Repository.tags && repo.Repository.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {repo.Repository.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-0.5 text-[11px] rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-100/80 dark:border-indigo-900/50 font-bold"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs font-bold text-slate-400 dark:text-slate-500 self-start flex-shrink-0 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                        <span className="flex items-center text-amber-500 dark:text-amber-400">
                          ⭐ <span className="ml-1">{repo.Repository.stars || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {repos?.filter(repo => repo.Repository.visibility === 'Private').length === 0 && (
                  <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                    No private repositories found.
                  </div>
                )}
              </div>
            </div>

            {/* Public Repositories */}
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                  <Github size={18} className="mr-2.5 text-indigo-600 dark:text-indigo-400" />
                  Public Repositories
                </h2>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200/20 dark:border-slate-800/50">
                  {repos?.filter(repo => repo.Repository.visibility === 'Public').length || 0} repos
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {repos?.filter(repo => repo.Repository.visibility === 'Public').map((repo) => (
                  <div key={repo.Repository.repo_id}
                    className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                        <a href={`/${repo.Repository.creator_id}/${repo.Repository.repo_name}/main`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {repo.Repository.repo_name}
                        </a>
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 flex items-center flex-shrink-0">
                        PUBLIC
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium line-clamp-2 flex-grow">
                      {repo.Repository.description || "No description provided."}
                    </p>
                    
                    <div className="mt-5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-semibold">
                      {repo.Repository.language ? (
                        <div className="flex items-center">
                          <span
                            style={{ backgroundColor: repo.Repository.languageColor || '#6366F1' }}
                            className="w-2.5 h-2.5 rounded-full inline-block mr-1.5 ring-2 ring-white dark:ring-slate-900">
                          </span>
                          {repo.Repository.language}
                        </div>
                      ) : <div></div>}
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-amber-500">⭐ {repo.Repository.stars || 0}</span>
                        <span className="flex items-center">
                          <GitFork size={13} className="mr-1 text-slate-400" />
                          {repo.Repository.forks || 0}
                        </span>
                      </div>
                    </div>

                    {repo.Repository.tags && repo.Repository.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {repo.Repository.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 text-[10px] rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-100/60 dark:border-indigo-900/40 font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {repos?.filter(repo => repo.Repository.visibility === 'Public').length === 0 && (
                  <div className="col-span-2 text-center text-slate-400 dark:text-slate-500 font-semibold py-10 text-sm">
                    No public repositories found.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}