import { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, 
  Clock, 
  CalendarCheck, 
  Building2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard({ onNavigate, onAction }: { onNavigate: (tab: string) => void, onAction: (action: string) => void }) {
  const [stats, setStats] = useState({
    employees: 0,
    presentToday: 0,
    leaveRequests: 0,
    departments: 0
  });

  const [activeEmployees, setActiveEmployees] = useState<{name: string, pfp: string}[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const empSnap = await getDocs(collection(db, 'employees'));
      const deptSnap = await getDocs(collection(db, 'departments'));
      const leaveSnap = await getDocs(query(collection(db, 'leave_requests'), where('status', '==', 'pending')));
      const today = new Date().toISOString().split('T')[0];
      const attSnap = await getDocs(query(collection(db, 'attendance'), where('date', '==', today)));

      // Fetch actual names for active members
      const activeIds = attSnap.docs.map(d => d.data().employeeId);
      const employeesMap = new Map();
      empSnap.docs.forEach(d => employeesMap.set(d.id, d.data().name));
      
      const activeList = activeIds.slice(0, 5).map(id => ({
        name: employeesMap.get(id) || 'Unknown Member',
        pfp: (employeesMap.get(id) || 'U').charAt(0)
      }));

      setActiveEmployees(activeList);

      setStats({
        employees: empSnap.size,
        departments: deptSnap.size,
        leaveRequests: leaveSnap.size,
        presentToday: attSnap.size
      });
    }
    fetchStats();
  }, []);

  const data = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 60 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 90 },
    { name: 'Fri', value: 70 },
  ];

  const attendanceRate = stats.employees > 0 ? (stats.presentToday / stats.employees * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-4 h-full animate-in fade-in duration-500">
      {/* Workforce Overview - spans 2x2 */}
      <div className="bento-card col-span-2 row-span-2">
        <div className="card-title">Workforce Overview</div>
        <div className="flex gap-10 mb-6">
          <div>
            <div className="stat-value">{stats.employees}</div>
            <div className="stat-trend">+12% vs last month</div>
          </div>
          <div>
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-trend">Attendance Rate</div>
          </div>
        </div>
        
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#F5F7FA' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#2563EB' : '#DBEAFE'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      {/* Total Departments */}
      <div className="bento-card">
        <div className="card-title">Total Departments</div>
        <div className="stat-value">{stats.departments}</div>
        <div className="mt-auto flex flex-wrap gap-1">
          <span className="px-2.5 py-1 bg-[#F3F4F6] rounded-lg text-[10px] font-bold text-gray-600 uppercase">Engineering</span>
          <span className="px-2.5 py-1 bg-[#F3F4F6] rounded-lg text-[10px] font-bold text-gray-600 uppercase">Product</span>
        </div>
      </div>

      {/* Pending Leaves */}
      <div className="bento-card">
        <div className="card-title">Pending Leaves</div>
        <div className="stat-value">{stats.leaveRequests}</div>
        <div className="mt-auto flex items-center text-[#F59E0B] text-[11px] font-bold uppercase tracking-wider">
          <TrendingUp className="w-3 h-3 mr-1" />
          Requires action
        </div>
      </div>

      {/* Active Now - spans 1x2 */}
      <div className="bento-card row-span-2">
        <div className="card-title">Active Now</div>
        <div className="flex-1 space-y-4">
          {activeEmployees.length > 0 ? activeEmployees.map((emp, i) => (
            <div key={i} className="flex items-center space-x-3 pb-3 border-b border-[#F3F4F6] last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white">
                {emp.pfp}
              </div>
              <div className="overflow-hidden">
                <div className="text-[13px] font-semibold truncate">{emp.name}</div>
                <div className="text-[11px] text-[#6B7280] truncate">Active Today</div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40 py-10">
              <UserCheck className="w-8 h-8" />
              <p className="text-[11px] font-bold uppercase tracking-widest leading-tight">No active<br/>members today</p>
            </div>
          )}
        </div>
        {activeEmployees.length > 0 && (
          <button 
            onClick={() => onNavigate('attendance')}
            className="mt-auto text-center py-2 text-[12px] text-[#2563EB] font-bold uppercase tracking-widest hover:underline"
          >
            View all active
          </button>
        )}
      </div>

      {/* Quick Actions - spans 2x1 */}
      <div className="bento-card col-span-2">
        <div className="card-title">Quick Actions</div>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => onAction('add-employee')}
            className="bg-[#2563EB] text-white py-3 rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Add Employee
          </button>
          <button 
            onClick={() => onNavigate('departments')}
            className="bg-[#F3F4F6] text-[#111827] py-3 rounded-xl text-[12px] font-bold hover:bg-gray-200 transition-colors"
          >
            Create Unit
          </button>
          <button 
            onClick={() => onNavigate('attendance')}
            className="bg-[#F3F4F6] text-[#111827] py-3 rounded-xl text-[12px] font-bold hover:bg-gray-200 transition-colors"
          >
            Mark Daily
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bento-card">
        <div className="card-title">System Health</div>
        <div className="space-y-3 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[14px] font-medium">DB Connection</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[14px] font-medium">Auth Service</span>
          </div>
          <button 
            onClick={() => onNavigate('leaves')}
            className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-colors"
          >
            Review Requests
          </button>
        </div>
      </div>
    </div>
  );
}
