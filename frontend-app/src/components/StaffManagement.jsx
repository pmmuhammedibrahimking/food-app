import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconFilter,
  IconCheckCircle,
  IconClock,
  IconTrash,
  IconX,
  IconCrown,
  IconChefHat,
  IconSparkles,
  IconBed
} from './Icons';
import { ConfirmModal } from './ConfirmModal';

export const StaffManagement = () => {
  const {
    staffMembers = [],
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    currentUser,
    loginAdmin,
    addToast
  } = useHotel();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Receptionist',
    department: 'Front Desk',
    shift: 'Morning (07:00 - 15:00)',
    status: 'Active',
    salary: '$48,000 / yr'
  });

  const rolesList = ['Admin', 'Manager', 'Receptionist', 'Kitchen Staff', 'Housekeeping', 'Maintenance'];
  const shiftsList = [
    'Morning (07:00 - 15:00)',
    'Morning (08:00 - 16:00)',
    'Evening (14:00 - 22:00)',
    'Evening (15:00 - 23:00)',
    'Night (22:00 - 06:00)'
  ];

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.phone && staff.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'All' || staff.role === roleFilter;
    const matchesShift = shiftFilter === 'All' || staff.shift.includes(shiftFilter);
    return matchesSearch && matchesRole && matchesShift;
  });

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '+1 (555) 000-0000',
      role: 'Receptionist',
      department: 'Front Desk',
      shift: 'Morning (07:00 - 15:00)',
      status: 'Active',
      salary: '$48,000 / yr'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role || 'Receptionist',
      department: staff.department || 'Operations',
      shift: staff.shift || 'Morning (08:00 - 16:00)',
      status: staff.status || 'Active',
      salary: staff.salary || '$45,000 / yr'
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Name and email are required.', 'error');
      return;
    }

    if (editingStaff) {
      updateStaffMember(editingStaff.id, formData);
      addToast(`Staff profile for ${formData.name} updated!`, 'success');
    } else {
      addStaffMember(formData);
      addToast(`New staff member ${formData.name} added to roster!`, 'success');
    }
    setIsAddModalOpen(false);
  };

  const handleImpersonateStaff = (staff) => {
    if (loginAdmin) {
      const usernameMap = {
        Manager: 'manager',
        Admin: 'manager',
        Receptionist: 'receptionist',
        'Kitchen Staff': 'chef',
        Housekeeping: 'housekeeping'
      };
      const userKey = usernameMap[staff.role] || 'manager';
      loginAdmin(userKey, 'adminpassword123');
      addToast(`Switched active view to ${staff.name} (${staff.role})`, 'info');
    }
  };

  // Metrics
  const totalStaffCount = staffMembers.length;
  const activeCount = staffMembers.filter((s) => s.status === 'Active').length;
  const housekeepingCount = staffMembers.filter((s) => s.role === 'Housekeeping').length;
  const kitchenCount = staffMembers.filter((s) => s.role === 'Kitchen Staff').length;
  const frontDeskCount = staffMembers.filter((s) => s.role === 'Receptionist' || s.role === 'Manager').length;

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fade-in">
      {/* Top Banner / Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <IconUsers size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-100 flex items-center gap-2">
              Staff & Employee Management
              <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full font-semibold">
                HR Console
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Manage multi-role staff roster, departments, shift schedules, and operational permissions
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all self-start md:self-auto"
        >
          <IconPlus size={16} /> Add New Staff Member
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Staff</span>
          <div className="text-2xl font-extrabold text-slate-100 mt-2">{totalStaffCount}</div>
          <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {activeCount} Active on Duty
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Front Desk & Mgmt</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">{frontDeskCount}</div>
          <span className="text-[11px] text-slate-500 mt-1">Reception & Operations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Kitchen & Chefs</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-2">{kitchenCount}</div>
          <span className="text-[11px] text-slate-500 mt-1">KDS & Room Service</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Housekeeping</span>
          <div className="text-2xl font-extrabold text-blue-400 mt-2">{housekeepingCount}</div>
          <span className="text-[11px] text-slate-500 mt-1">Sanitation & Rooms</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-full md:w-80">
          <IconSearch size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none text-xs text-slate-100 placeholder-slate-500 w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-300">
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Role and Shift Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 w-full sm:w-auto">
            <IconFilter size={14} className="text-amber-400" />
            <span className="text-slate-500 text-[11px]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-100">All Roles</option>
              {rolesList.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-100">{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 w-full sm:w-auto">
            <IconClock size={14} className="text-amber-400" />
            <span className="text-slate-500 text-[11px]">Shift:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-100">All Shifts</option>
              <option value="Morning" className="bg-slate-900 text-slate-100">Morning Shift</option>
              <option value="Evening" className="bg-slate-900 text-slate-100">Evening Shift</option>
              <option value="Night" className="bg-slate-900 text-slate-100">Night Shift</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table / Cards View */}
      {filteredStaff.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <IconUsers size={36} className="mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Staff Members Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or role filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Role & Department</th>
                  <th className="py-3.5 px-4">Shift Schedule</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStaff.map((staff) => {
                  const roleBadgeClass =
                    staff.role === 'Manager' || staff.role === 'Admin'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : staff.role === 'Kitchen Staff'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : staff.role === 'Housekeeping'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : staff.role === 'Receptionist'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-purple-500/15 text-purple-400 border-purple-500/30';

                  return (
                    <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              {staff.name}
                              {currentUser?.name === staff.name && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: {staff.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeClass}`}>
                            {staff.role}
                          </span>
                          <div className="text-[11px] text-slate-400">{staff.department}</div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <IconClock size={13} className="text-slate-500" />
                          <span>{staff.shift}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{staff.salary}</div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300">{staff.email}</div>
                        <div className="text-[10px] text-slate-500">{staff.phone}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-max ${
                            staff.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                          {staff.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleImpersonateStaff(staff)}
                            title={`Switch view to ${staff.name}'s role`}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <IconCrown size={12} />
                            <span className="hidden sm:inline">Login As</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(staff)}
                            title="Edit Staff Info"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setStaffToDelete(staff)}
                            title="Remove Staff"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
              <h2 className="text-base font-bold font-serif text-slate-100 flex items-center gap-2">
                <IconUsers size={18} className="text-amber-400" />
                {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maria Garcia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. maria@aureliahotel.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-slate-100">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Front Desk / Culinary / Housekeeping"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Shift Schedule</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    {shiftsList.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-slate-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Salary / Compensation</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="$50,000 / yr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Duty Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Active" className="bg-slate-900 text-slate-100">Active (On Duty)</option>
                    <option value="On Leave" className="bg-slate-900 text-slate-100">On Leave</option>
                    <option value="Inactive" className="bg-slate-900 text-slate-100">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10 transition-colors"
                >
                  {editingStaff ? 'Save Changes' : 'Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <ConfirmModal
          isOpen={!!staffToDelete}
          title="Remove Staff Member"
          message={`Are you sure you want to remove ${staffToDelete.name} (${staffToDelete.role}) from the staff registry?`}
          confirmLabel="Remove"
          onConfirm={() => {
            deleteStaffMember(staffToDelete.id);
            setStaffToDelete(null);
          }}
          onClose={() => setStaffToDelete(null)}
        />
      )}
    </div>
  );
};
