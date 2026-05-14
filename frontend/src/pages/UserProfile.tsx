// Replace content in UserProfile.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, MapPin, Link as LinkIcon, Calendar, GitFork, Star, Users, Book } from 'lucide-react';

export default function UserProfile() {
  const { username } = useParams();
  
  // Mock user data - replace with API call
  const mockUser = {
    username: username,
    full_name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: 'Full-stack developer passionate about open source',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    joined: 'January 2023',
  };
  
  const mockRepositories = [
    {
      name: 'react-starter',
      description: 'A modern React starter template',
      stars: 128,
      forks: 45,
      language: 'TypeScript',
      languageColor: '#2b7489',
    },
    {
      name: 'node-api',
      description: 'RESTful API boilerplate',
      stars: 89,
      forks: 23,
      language: 'JavaScript',
      languageColor: '#f1e05a',
    },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img 
                    src={mockUser.avatar} 
                    alt={`${mockUser.full_name}'s avatar`}
                    className="w-28 h-28 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-md object-cover mb-4"
                  />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{mockUser.full_name}</h1>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-0.5">@{mockUser.username}</p>
              </div>
              
              <div className="text-left space-y-4 border-t border-slate-100 dark:border-slate-800/60 pt-5 mt-5">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  {mockUser.bio}
                </p>
                
                <div className="space-y-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-3 text-slate-400" />
                    <span>{mockUser.location}</span>
                  </div>
                  
                  <div className="flex items-center truncate">
                    <LinkIcon size={16} className="mr-3 text-slate-400 flex-shrink-0" />
                    <a href={mockUser.website} className="text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                      {mockUser.website.replace(/(^\w+:|^)\/\//, '')}
                    </a>
                  </div>
                  
                  <div className="flex items-center truncate">
                    <Mail size={16} className="mr-3 text-slate-400 flex-shrink-0" />
                    <span>{mockUser.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-3 text-slate-400" />
                    <span>Joined {mockUser.joined}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">12</div>
                    <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Repos</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">148</div>
                    <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Fans</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">67</div>
                    <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Gov</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                  <Book size={18} className="mr-2.5 text-indigo-600 dark:text-indigo-400" />
                  Repositories
                </h2>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {mockRepositories.map((repo, index) => (
                  <div key={index} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                          <Link 
                            to={`/${username}/${repo.name}`}
                            className="hover:underline"
                          >
                            {repo.name}
                          </Link>
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
                          {repo.description}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-400">
                          <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/50">
                            <span 
                              className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" 
                              style={{ backgroundColor: repo.languageColor }}
                            ></span>
                            <span>{repo.language}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-bold text-slate-400 self-start">
                        <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 px-2.5 py-1 rounded-lg">
                          <Star size={13} className="mr-1 text-amber-500 fill-amber-500" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                          <GitFork size={13} className="mr-1" />
                          <span>{repo.forks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-brand-card border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                  <Users size={18} className="mr-2.5 text-indigo-600 dark:text-indigo-400" />
                  Activity
                </h2>
              </div>
              
              <div className="p-12">
                <div className="flex flex-col items-center justify-center text-center text-slate-400">
                  <Users size={36} className="mb-3 opacity-30" />
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No recent activity</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">This user hasn't contributed anything publicly yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
