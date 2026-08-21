import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconSparkles, IconCheckCircle, IconClock, IconPlus, IconUsers, IconX, IconTrash } from './Icons';
import { ConfirmModal } from './ConfirmModal';

export const Housekeeping = () => {
  const { housekeeping = [], updateHousekeepingStatus, updateRoomStatus, addToast, setHousekeeping, deleteHousekeepingTask } = useHotel();
  const [filterStatus, setFilterStatus] = useState('All');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [newTaskForm, setNewTaskForm] = useState({
    roomNumber: '101',
    type: 'Daily Refresh',
    assignee: 'Maria Garcia',
    priority: 'Normal'
  });

  const staffList = [
    { name: 'Maria Garcia', role: 'Head Cleaner', activeTasks: housekeeping.filter(h => h.assignee === 'Maria Garcia' && h.status !== 'Completed').length },
    { name: 'Carlos Ruiz', role: 'Senior Inspector', activeTasks: housekeeping.filter(h => h.assignee === 'Carlos Ruiz' && h.status !== 'Completed').length },
    { name: 'John Doe', role: 'Turnaround Staff', activeTasks: housekeeping.filter(h => h.assignee === 'John Doe' && h.status !== 'Completed').length },
    { name: 'Elena Vance', role: 'VIP Steward', activeTasks: housekeeping.filter(h => h.assignee === 'Elena Vance' && h.status !== 'Completed').length }
  ];

  const filteredTasks = housekeeping.filter((hk) => {
    return filterStatus === 'All' || hk.status === filterStatus;
  });

  const handleAssignStaff = (taskId, staffName) => {
    setHousekeeping((prev) =>
      prev.map((hk) => (hk.id === taskId ? { ...hk, assignee: staffName } : hk))
    );
    addToast(`Task ${taskId} assigned to ${staffName}!`, 'info');
  };

  const handleUpdateStatus = (taskId, roomNumber, newStatus) => {
    updateHousekeepingStatus(taskId, newStatus);

    // Automation: When marked Completed, set room back to Available!
    if (newStatus === 'Completed') {
      updateRoomStatus(roomNumber, 'Available');
      addToast(`Room ${roomNumber} cleaned & automatically set to Available for new guests!`, 'success');
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const newTask = {
      id: `HK-${Date.now()}`,
      roomNumber: newTaskForm.roomNumber,
      type: newTaskForm.type,
      assignee: newTaskForm.assignee,
      priority: newTaskForm.priority,
      status: 'Cleaning'
    };

    setHousekeeping((prev) => [newTask, ...prev]);
    updateRoomStatus(newTaskForm.roomNumber, 'Cleaning');
    addToast(`Cleaning task created for Room ${newTaskForm.roomNumber}!`, 'success');
    setIsAddTaskModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Filter & Automation Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <IconSparkles size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold font-serif tracking-wide text-slate-100">
                Housekeeping & Sanitation Automation
              </h1>
              <p className="text-xs text-slate-400">
                Automated post-checkout cleaning dispatch, staff workload allocation, and room status sync
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start md:self-auto"
          >
            <IconPlus size={16} /> Dispatch Cleaning Task
          </button>
        </div>

        {/* Staff Workload Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {staffList.map((st) => (
            <div key={st.name} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">{st.name}</div>
                <div className="text-[10px] text-slate-400">{st.role}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.activeTasks > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                {st.activeTasks} Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Housekeeping Tasks Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Automated Dispatch Queue</h2>
            <p className="text-xs text-slate-400">Showing {filteredTasks.length} sanitation tasks</p>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', 'Cleaning', 'Pending', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No Housekeeping Tasks Found"
            message="No active housekeeping or sanitation tasks match your selected filter."
            actionText="Reset Filter"
            onAction={() => setFilterStatus('All')}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[750px] text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Automation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredTasks.map((hk) => (
                  <tr key={hk.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{hk.id}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-100 text-sm">Room {hk.roomNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{hk.type}</td>
                    <td className="py-3.5 px-4">
                      {/* Staff Assignee Selector Dropdown */}
                      <select
                        value={hk.assignee || 'Maria Garcia'}
                        onChange={(e) => handleAssignStaff(hk.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-amber-300 px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-500/50 font-semibold"
                      >
                        {staffList.map((st) => (
                          <option key={st.name} value={st.name} className="bg-slate-900 text-slate-200">
                            {st.name} ({st.role})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          hk.priority === 'Urgent' || hk.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        ● {hk.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          hk.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : hk.status === 'Cleaning'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {hk.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hk.status !== 'Cleaning' && hk.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(hk.id, hk.roomNumber, 'Cleaning')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            Start Cleaning
                          </button>
                        )}

                        {hk.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(hk.id, hk.roomNumber, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                          >
                            <IconCheckCircle size={13} /> Mark Clean & Ready
                          </button>
                        )}

                        <button
                          onClick={() => setTaskToDelete(hk)}
                          title="Delete Housekeeping Task"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}  </div>

      {/* Manual Task Dispatch Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-slate-100">Dispatch Cleaning Task</h2>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.roomNumber}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, roomNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g. 101"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Service Type</label>
                <select
                  value={newTaskForm.type}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Departure Turnaround Clean">Departure Turnaround Clean</option>
                  <option value="Daily Refresh">Daily Refresh</option>
                  <option value="VIP Welcome Prep">VIP Welcome Prep</option>
                  <option value="Sanitation & Deep Clean">Sanitation & Deep Clean</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Staff</label>
                  <select
                    value={newTaskForm.assignee}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  >
                    {staffList.map((st) => (
                      <option key={st.name} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Deletion Confirm Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Housekeeping Task"
        message={`Are you sure you want to remove cleaning task ${taskToDelete?.id} for Room #${taskToDelete?.roomNumber}?`}
        confirmText="Delete Task"
        type="danger"
        onConfirm={() => {
          if (taskToDelete) {
            deleteHousekeepingTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
};
