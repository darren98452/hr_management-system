import { useEffect, useState } from 'react';
import { getEmployees, markAttendance } from '../services/api';
import { Employee, AttendanceStatus } from '../types';
import { CheckCircle, Clock, XCircle, Search, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function Attendance() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getEmployees();
      setEmployees(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleMark = async (employeeId: string, status: AttendanceStatus) => {
    await markAttendance({
      employeeId,
      status,
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toISOString()
    });
    // Visual feedback instead of alert
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Attendance</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-[20px] border border-[#E5E7EB] animate-pulse h-[140px]" />
          ))
        ) : filteredEmployees.map(emp => (
          <div key={emp.id} className="bento-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] font-bold text-sm">
                {emp.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[14px] font-bold text-[#111827] truncate">{emp.name}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{emp.email}</p>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#F3F4F6] text-[#4B5563] uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>Pending</span>
              </span>
              
              {isAdmin && (
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleMark(emp.id, AttendanceStatus.PRESENT)}
                    className="p-1.5 text-[#059669] hover:bg-[#D1FAE5] rounded-lg transition-colors"
                    title="Present"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMark(emp.id, AttendanceStatus.LATE)}
                    className="p-1.5 text-[#D97706] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                    title="Late"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMark(emp.id, AttendanceStatus.ABSENT)}
                    className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                    title="Absent"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
