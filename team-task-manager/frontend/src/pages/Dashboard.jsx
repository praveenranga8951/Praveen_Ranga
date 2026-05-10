import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi, authApi } from '../api';
import { Plus, Folder } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, projectsRes] = await Promise.all([
        authApi.me(),
        projectApi.getProjects()
      ]);
      setUser(userRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      navigate('/login');
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
    <div className="min-h-screen bg-slate-50 p-8 font-sans selection:bg-blue-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight mb-1">Your Workspace</h1>
            <p className="text-slate-500 font-medium">Manage your projects and collaborate with your team.</p>
          </div>
          <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 leading-tight">{user?.name}</span>
                <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 text-left font-medium transition-colors">Sign out</button>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} strokeWidth={3} /> New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Folder size={56} className="text-slate-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No projects yet</h2>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">Get started by creating your first project to organize tasks, collaborate with your team, and track your progress.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <Plus size={22} strokeWidth={2.5} /> Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-blue-50 transition-colors text-slate-400 group-hover:text-blue-600">
                    <Folder size={26} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{project.name}</h2>
                </div>
                <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full p-2 border rounded mb-4"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
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
