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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} /> New Project
            </button>
            <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Folder size={24} />
                <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
              </div>
              <p className="text-gray-500 text-sm">Created {new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

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
