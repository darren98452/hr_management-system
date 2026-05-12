import React, { useEffect, useState } from 'react';
import { getLeaveRequests, getEmployees, updateLeaveStatus } from '../services/api';
import { LeaveRequest, Employee, LeaveStatus } from '../types';
import { 
  Check, 
  X, 
  Clock, 
  Calendar,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function LeaveRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'sick',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [reqData, empData] = await Promise.all([getLeaveRequests(), getEmployees()]);
    setRequests(reqData || []);
    setEmployees(empData || []);
  }

  const handleStatusUpdate = async (id: string, status: LeaveStatus) => {
    await updateLeaveStatus(id, status);
    fetchData();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we'd have a createLeaveRequest service
    // For now we'll just simulate or use api.ts if it exists
    setShowApplyModal(false);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Leave Requests</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Review and manage employee time-off applications.</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setShowApplyModal(true)}
            className="flex items-center space-x-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        )}
      </header>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleApply} className="p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold tracking-tight text-[#111827]">Request Time Off</h3>
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Leave Type</label>
                  <select
                    required
                    value={newLeave.type}
                    onChange={e => setNewLeave({...newLeave, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                    <input
                      required
                      type="date"
                      value={newLeave.startDate}
                      onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">End Date</label>
                    <input
                      required
                      type="date"
                      value={newLeave.endDate}
                      onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Reason</label>
                  <textarea
                    required
                    value={newLeave.reason}
                    onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="Briefly explain your absence..."
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => {
          const emp = employees.find(e => e.id === req.employeeId);
          
          return (
            <div key={req.id} className="bento-card flex-row items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#4B5563] border border-[#E5E7EB]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-[14px] font-bold text-[#111827]">{emp?.name || 'Unknown'}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      req.status === LeaveStatus.PENDING ? "bg-amber-50 text-amber-600" :
                      req.status === LeaveStatus.APPROVED ? "bg-green-50 text-green-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {req.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-3 text-[11px] text-[#6B7280]">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 opacity-60" />
                      {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d')}
                    </div>
                    <div className="flex items-center uppercase font-bold tracking-widest text-[9px]">
                      {req.type}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block flex-1 max-w-sm mx-6">
                <p className="text-[12px] text-[#4B5563] truncate italic">"{req.reason}"</p>
              </div>

              {isAdmin && req.status === LeaveStatus.PENDING ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleStatusUpdate(req.id, LeaveStatus.APPROVED)}
                    className="p-2 text-[#059669] hover:bg-[#D1FAE5] rounded-xl transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(req.id, LeaveStatus.REJECTED)}
                    className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-20" /> 
              )}
            </div>
          );
        })}

        {requests.length === 0 && (
          <div className="p-12 text-center bg-white rounded-[20px] border border-dashed border-[#E5E7EB]">
            <h3 className="text-[14px] font-bold text-[#6B7280]">No requests found</h3>
            <p className="text-[12px] text-gray-400 mt-1">All caught up! No pending applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
