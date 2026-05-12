import React, { useEffect, useState } from 'react';
import { getEmployees, getDepartments, addEmployee, updateEmployee, deleteEmployee } from '../services/api';
import { Employee, Department, EmployeeStatus, UserRole } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  User, 
  X, 
  Edit2, 
  Save,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

export default function EmployeeList() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EmployeeStatus>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    departmentId: '',
    role: '',
    status: EmployeeStatus.ACTIVE,
    joiningDate: new Date().toISOString(),
    phoneNumber: ''
  });

  useEffect(() => {
    fetchData();
    
    const handleGlobalClick = () => setActiveMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  async function fetchData() {
    setLoading(true);
    const [empData, deptData] = await Promise.all([getEmployees(), getDepartments()]);
    setEmployees(empData || []);
    setDepartments(deptData || []);
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEmployee(newEmp as Omit<Employee, 'id'>);
    setShowAddModal(false);
    fetchData();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, editForm);
    setIsEditing(false);
    setSelectedEmployee({ ...selectedEmployee, ...editForm } as Employee);
    fetchData();
  };

  const startEditing = () => {
    if (!selectedEmployee) return;
    setEditForm(selectedEmployee);
    setIsEditing(true);
  };

  const handleDelete = async (emp: Employee) => {
    if (window.confirm(`Are you sure you want to remove ${emp.name}? This action cannot be undone.`)) {
      await deleteEmployee(emp.id);
      fetchData();
      setActiveMenu(null);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                         emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesDept = deptFilter === 'all' || emp.departmentId === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const isAdmin = profile?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Employees</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Manage your team members and their roles.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pl-11 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#4B5563] appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value={EmployeeStatus.ACTIVE}>Active</option>
            <option value={EmployeeStatus.INACTIVE}>Inactive</option>
            <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
          </select>
        </div>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="pl-11 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#4B5563] appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-[20px] border border-[#E5E7EB] animate-pulse h-[180px]" />
          ))
        ) : filteredEmployees.map(emp => (
          <div 
            key={emp.id} 
            className="bento-card cursor-pointer"
            onClick={() => {
              setSelectedEmployee(emp);
              setIsEditing(false);
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] font-bold text-sm">
                {emp.name.charAt(0)}
              </div>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                emp.status === EmployeeStatus.ACTIVE ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600"
              )}>
                {emp.status}
              </span>
            </div>
            
            <div>
              <h3 className="text-[15px] font-bold text-[#111827] truncate">{emp.name}</h3>
              <p className="text-[12px] font-medium text-[#6B7280] truncate">{emp.role}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-2">
              <div className="flex items-center text-[12px] text-[#4B5563]">
                <Building2 className="w-3.5 h-3.5 mr-2 text-gray-400" />
                {departments.find(d => d.id === emp.departmentId)?.name || 'Unassigned'}
              </div>
              <div className="flex items-center text-[12px] text-[#4B5563]">
                <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                <span className="truncate">{emp.email}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEmployee(emp);
                  setIsEditing(false);
                }}
                className="text-[11px] font-bold text-[#2563EB] uppercase tracking-widest hover:underline"
              >
                Profile
              </button>
              
              <div className="relative">
                <button 
                  className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === emp.id ? null : emp.id);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenu === emp.id && (
                  <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(emp);
                        setIsEditing(false);
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-[#4B5563] hover:bg-gray-50 text-[12px] font-bold transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>View Details</span>
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(emp);
                        }}
                        className="w-full border-t border-gray-100 flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 text-[12px] font-bold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Member</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-8">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute right-6 top-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
                <div className="w-24 h-24 rounded-[32px] bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-4xl font-bold border-4 border-white shadow-xl">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-[#111827]">{selectedEmployee.name}</h3>
                      <p className="text-[#6B7280] font-medium text-lg mt-1">{selectedEmployee.role}</p>
                    </div>
                    {isAdmin && !isEditing && (
                      <button 
                        onClick={startEditing}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#F3F4F6] text-[#4B5563] rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#F9FAFB] rounded-[24px] border border-[#E5E7EB]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                      <input
                        required
                        type="text"
                        value={editForm.role}
                        onChange={e => setEditForm({...editForm, role: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                      <select
                        required
                        value={editForm.departmentId}
                        onChange={e => setEditForm({...editForm, departmentId: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber || ''}
                        onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                      <select
                        required
                        value={editForm.status}
                        onChange={e => setEditForm({...editForm, status: e.target.value as EmployeeStatus})}
                        className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="flex space-x-3 pt-6">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2.5 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#F3F4F6] pt-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#F3F4F6] rounded-lg text-[#6B7280]">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Department</p>
                        <p className="text-sm font-semibold text-[#111827]">
                          {departments.find(d => d.id === selectedEmployee.departmentId)?.name || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#F3F4F6] rounded-lg text-[#6B7280]">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email Contact</p>
                        <p className="text-sm font-semibold text-[#111827]">{selectedEmployee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#F3F4F6] rounded-lg text-[#6B7280]">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Mobile Number</p>
                        <p className="text-sm font-semibold text-[#111827]">{selectedEmployee.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#F3F4F6] rounded-lg text-[#6B7280]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Joined Date</p>
                        <p className="text-sm font-semibold text-[#111827]">
                          {format(new Date(selectedEmployee.joiningDate), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-[#F3F4F6] rounded-lg text-[#6B7280]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Employment Status</p>
                        <span className={cn(
                          "inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          selectedEmployee.status === EmployeeStatus.ACTIVE ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {selectedEmployee.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold tracking-tight text-[#111827]">Onboard Member</h3>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={newEmp.name}
                    onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email address</label>
                  <input
                    required
                    type="email"
                    value={newEmp.email}
                    onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                    <select
                      required
                      value={newEmp.departmentId}
                      onChange={e => setNewEmp({...newEmp, departmentId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                    <input
                      required
                      type="text"
                      value={newEmp.role}
                      onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Senior Designer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                  <input
                    type="text"
                    value={newEmp.phoneNumber}
                    onChange={e => setNewEmp({...newEmp, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                Complete Onboarding
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

