import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectApi, taskApi, dashboardApi } from '../api';
import { LayoutDashboard, ListTodo, Users, ArrowLeft, Plus } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // New Task state
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to_id: '' });
  // New Member state
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [pRes, tRes, sRes, mRes] = await Promise.all([
        projectApi.getProject(id),
        taskApi.getProjectTasks(id),
        dashboardApi.getStats(id),
        projectApi.getMembers(id)
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setStats(sRes.data);
      setMembers(mRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskApi.createTask({ ...newTask, project_id: parseInt(id), assigned_to_id: newTask.assigned_to_id ? parseInt(newTask.assigned_to_id) : null });
      setNewTask({ title: '', description: '', assigned_to_id: '' });
      setShowTaskModal(false);
      fetchProjectData();
    } catch (err) {
      alert('Only admins can create tasks');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectApi.addMember(id, { email: newMemberEmail, role: 'Member' });
      setNewMemberEmail('');
      setShowMemberModal(false);
      fetchProjectData();
    } catch (err) {
      alert('Only admins can add members or user not found');
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      fetchProjectData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (!project) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50">
               <Users size={18} /> Manage Members
             </button>
             <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
               <Plus size={18} /> Add Task
             </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-6 mb-8 border-b">
          <button
            onClick={() => setActiveTab('board')}
            className={`pb-4 px-2 flex items-center gap-2 ${activeTab === 'board' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <ListTodo size={20} /> Task Board
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-2 flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
        </div>

        {activeTab === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['To Do', 'In Progress', 'Done'].map(status => (
              <div key={status} className="bg-gray-200/50 p-4 rounded-lg min-h-[500px]">
                <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                  {status}
                  <span className="bg-gray-300 px-2 py-0.5 rounded text-xs">
                    {tasks.filter(t => t.status === status).length}
                  </span>
                </h3>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
                      <h4 className="font-semibold mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Assigned to: {members.find(m => m.id === task.assigned_to_id)?.name || 'Unassigned'}</span>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className="border rounded p-1"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Tasks" value={stats.total_tasks} />
            <StatCard title="Overdue" value={stats.overdue_tasks} color="text-red-600" />
            <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold mb-4">Tasks by Status</h3>
                <div className="space-y-2">
                    {Object.entries(stats.tasks_by_status).map(([s, count]) => (
                        <div key={s} className="flex justify-between items-center">
                            <span>{s}</span>
                            <div className="w-48 bg-gray-200 rounded-full h-2.5 mx-4">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(count/stats.total_tasks)*100}%` }}></div>
                            </div>
                            <span>{count}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    className="w-full p-2 border rounded"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select
                    className="w-full p-2 border rounded"
                    value={newTask.assigned_to_id}
                    onChange={(e) => setNewTask({...newTask, assigned_to_id: e.target.value})}
                >
                    <option value="">Select Member</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Project Members</h2>
            <div className="mb-6 max-h-40 overflow-y-auto">
                {members.map(m => (
                    <div key={m.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                            <p className="font-medium">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{m.role}</span>
                    </div>
                ))}
            </div>
            <h3 className="font-semibold mb-2">Add Member</h3>
            <form onSubmit={handleAddMember}>
              <input
                type="email"
                placeholder="User Email"
                className="w-full p-2 border rounded mb-4"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-gray-600">Close</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color = "text-gray-800" }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-500 text-sm mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

export default ProjectDetails;
