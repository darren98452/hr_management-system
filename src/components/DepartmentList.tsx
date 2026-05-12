import React, { useEffect, useState } from 'react';
import { getDepartments, getEmployees, addDepartment } from '../services/api';
import { Department, Employee } from '../types';
import { Plus, Users, LayoutGrid, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function DepartmentList() {
  const { profile } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '', headId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [deptData, empData] = await Promise.all([getDepartments(), getEmployees()]);
    setDepartments(deptData || []);
    setEmployees(empData || []);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDepartment(newDept);
    setShowAddModal(false);
    fetchData();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Departments</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Structure and organization units.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Unit</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departments.map(dept => {
          const deptEmployees = employees.filter(e => e.departmentId === dept.id);
          const head = employees.find(e => e.id === dept.headId);

          return (
            <div key={dept.id} className="bento-card">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center border border-[#E5E7EB] text-[#4B5563]">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Strength</p>
                  <p className="text-xl font-black">{deptEmployees.length}</p>
                </div>
              </div>

              <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-tight truncate border-l-2 border-[#2563EB] pl-3">{dept.name}</h3>
              <p className="mt-4 text-[12px] text-[#6B7280] leading-relaxed line-clamp-3 h-[54px]">
                {dept.description || 'No description provided for this department.'}
              </p>

              <div className="mt-auto pt-6 border-t border-[#F3F4F6] flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Head of Unit</p>
                  <p className="text-[12px] font-semibold text-[#111827]">{head?.name || 'Vacant'}</p>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 border border-gray-100">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold tracking-tight text-[#111827]">New Department</h3>
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
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Unit Name</label>
                  <input
                    required
                    type="text"
                    value={newDept.name}
                    onChange={e => setNewDept({...newDept, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Creative Engineering"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea
                    value={newDept.description}
                    onChange={e => setNewDept({...newDept, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="Briefly describe the unit..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Department Head</label>
                  <select
                    value={newDept.headId}
                    onChange={e => setNewDept({...newDept, headId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select individual...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                Establish Unit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
