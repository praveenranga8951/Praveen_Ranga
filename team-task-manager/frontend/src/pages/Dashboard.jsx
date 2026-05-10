import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi, authApi, dashboardApi, taskApi } from '../api';
import { Plus, Folder, Calendar, AlertCircle, CheckCircle2, Clock, Users, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [globalStats, setGlobalStats] = useState({ due_soon_tasks: 0, overdue_tasks: 0 });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectStats, setSelectedProjectStats] = useState(null);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);
  const [selectedProjectTasks, setSelectedProjectTasks] = useState([]);
  
  const [newProjectName, setNewProjectName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, projectsRes, globalStatsRes] = await Promise.all([
        authApi.me(),
        projectApi.getProjects(),
        dashboardApi.getGlobalStats()
      ]);
      setUser(userRes.data);
      const projectsData = projectsRes.data;
      setProjects(projectsData);
      setGlobalStats(globalStatsRes.data);

      if (projectsData.length > 0) {
        handleSelectProject(projectsData[0]);
      }
    } catch (err) {
      navigate('/login');
    }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    try {
      const [statsRes, membersRes, tasksRes] = await Promise.all([
        dashboardApi.getStats(project.id),
        projectApi.getMembers(project.id),
        taskApi.getProjectTasks(project.id)
      ]);
      setSelectedProjectStats(statsRes.data);
      setSelectedProjectMembers(membersRes.data);
      // Sort tasks by latest first
      setSelectedProjectTasks(tasksRes.data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Failed to fetch project details", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectApi.createProject({ name: newProjectName });
      setNewProjectName('');
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1A1D21] text-gray-200 font-sans p-6 selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center bg-[#22252A] rounded-2xl p-2 px-4 shadow-lg border border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['Projects', 'Admin Projects', 'Assigned', 'Todo', 'In Progress', 'Completed', 'Overdue'].map((tab, i) => (
              <button 
                key={tab} 
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${i === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <span className="text-sm font-medium text-gray-400 hidden md:block">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner cursor-pointer">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors">Logout</button>
          </div>
        </div>

        {/* Global Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Due Soon */}
          <div className="bg-[#22252A] rounded-3xl p-6 shadow-lg border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Next 7 Days</p>
            <h2 className="text-2xl font-bold text-white mb-6">Due Soon</h2>
            <div className="flex items-end justify-between">
              {globalStats.due_soon_tasks === 0 ? (
                <p className="text-sm text-gray-400">Nothing due in the next 7 days.</p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-indigo-400">{globalStats.due_soon_tasks}</span>
                  <span className="text-sm text-gray-400">tasks</span>
                </div>
              )}
              <Calendar className="text-indigo-400/50" size={32} />
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-[#22252A] rounded-3xl p-6 shadow-lg border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Needs Attention</p>
            <h2 className="text-2xl font-bold text-white mb-6">Overdue Tasks</h2>
            <div className="flex items-end justify-between">
              {globalStats.overdue_tasks === 0 ? (
                <p className="text-sm text-gray-400">No overdue tasks. Nice work.</p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-rose-400">{globalStats.overdue_tasks}</span>
                  <span className="text-sm text-gray-400">tasks</span>
                </div>
              )}
              <AlertCircle className="text-rose-400/50" size={32} />
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Portfolio */}
          <div className="lg:col-span-3 bg-[#22252A] rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col h-[600px]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Portfolio</p>
            <h2 className="text-xl font-bold text-white mb-6">Projects</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar">
              {projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedProject?.id === project.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={16} className={selectedProject?.id === project.id ? 'text-indigo-400' : 'text-gray-500'} />
                    <span className={`font-medium truncate ${selectedProject?.id === project.id ? 'text-white' : 'text-gray-400'}`}>{project.name}</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 italic p-2">No projects found.</p>
              )}
            </div>

            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 w-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Create Project
            </button>
          </div>

          {/* Column 2: Selected Project */}
          <div className="lg:col-span-6 bg-[#22252A] rounded-3xl p-6 shadow-lg border border-white/5 h-[600px] flex flex-col relative overflow-hidden">
            {!selectedProject ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Select a project to view details</div>
            ) : (
              <>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Selected Project</p>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">{selectedProject.name}</h2>
                    <p className="text-sm text-gray-400 mt-2 max-w-md">{selectedProject.description || 'No description provided for this project.'}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/projects/${selectedProject.id}`)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                    title="Open Full Project View"
                  >
                    <ExternalLink size={18} />
                  </button>
                </div>

                {selectedProjectStats && (
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                      {selectedProjectMembers.length} teammates
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                      {selectedProjectStats.total_tasks} tasks
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                      {selectedProjectStats.tasks_by_status["To Do"] || 0} todo
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                      {selectedProjectStats.tasks_by_status["In Progress"] || 0} in progress
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                      {selectedProjectStats.tasks_by_status["Done"] || 0} done
                    </span>
                  </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-col">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Tasks</p>
                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                      {selectedProjectTasks.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No tasks created yet.</p>
                      ) : (
                        selectedProjectTasks.map(task => (
                          <div key={task.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                             <div className="flex justify-between items-start mb-2">
                               <h3 className="font-semibold text-gray-200">{task.title}</h3>
                               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full 
                                  ${task.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400' : 
                                    task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 
                                    'bg-amber-500/20 text-amber-400'}`}
                                >
                                  {task.status}
                               </span>
                             </div>
                             {task.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>}
                             <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </>
            )}
          </div>

          {/* Column 3: Collaboration */}
          <div className="lg:col-span-3 bg-[#22252A] rounded-3xl p-6 shadow-lg border border-white/5 h-[600px] flex flex-col">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Collaboration</p>
            <h2 className="text-xl font-bold text-white mb-4">Team & Tasks</h2>
            
            {!selectedProject ? (
              <p className="text-sm text-gray-500 italic mt-4">Select a project to view its team.</p>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  You are viewing the team for <span className="text-gray-200 font-medium">{selectedProject.name}</span>. Admins can add members, create tasks, and update any task.
                </p>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Team Members</p>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                  {selectedProjectMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                           {member.name.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-medium text-gray-200">{member.name}</span>
                           <span className="text-[10px] text-gray-500 truncate w-24">{member.email}</span>
                         </div>
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{member.role}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

        {/* Create Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#22252A] p-6 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full p-3 bg-black/20 border border-white/10 rounded-xl mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
