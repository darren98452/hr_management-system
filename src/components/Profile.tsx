import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  FileText,
  Camera,
  MapPin,
  Phone,
  Briefcase
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Employee } from '../types';

export default function Profile() {
  const { profile, user } = useAuth();
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployeeData() {
      if (!user?.email) return;
      try {
        const q = query(collection(db, 'employees'), where('email', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setEmployeeData({ id: snap.docs[0].id, ...snap.docs[0].data() } as Employee);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployeeData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Clock className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">My Profile</h2>
        <p className="text-[13px] text-[#6B7280] mt-0.5">Manage your personal information and view your HR records.</p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="h-24 bg-[#2563EB]" />
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-[#2563EB] text-3xl font-bold border-4 border-white">
                    {profile?.email?.[0].toUpperCase()}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-lg shadow-md border border-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#111827]">{employeeData?.name || profile?.email?.split('@')[0]}</h3>
                <p className="text-sm font-medium text-[#6B7280] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {employeeData?.position || profile?.role?.toUpperCase()}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center text-[13px] text-[#4B5563]">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center text-[13px] text-[#4B5563]">
                  <Shield className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="capitalize">{profile?.role} Account</span>
                </div>
                {employeeData?.phone && (
                  <div className="flex items-center text-[13px] text-[#4B5563]">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{employeeData.phone}</span>
                  </div>
                )}
                {employeeData?.department && (
                  <div className="flex items-center text-[13px] text-[#4B5563]">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{employeeData.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-[#E5E7EB] shadow-sm">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#4B5563]">Joined PulseHR</span>
                <span className="text-[13px] font-semibold text-[#111827]">{employeeData?.startDate || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#4B5563]">Account Status</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-md">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Records */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button className="px-6 py-4 text-sm font-bold border-b-2 border-[#2563EB] text-[#2563EB]">Overview</button>
              <button className="px-6 py-4 text-sm font-bold text-gray-400 hover:text-gray-600">Security</button>
              <button className="px-6 py-4 text-sm font-bold text-gray-400 hover:text-gray-600">Preferences</button>
            </div>
            
            <div className="p-8 space-y-8">
              <section>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-medium text-[#111827]">{employeeData?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-sm font-medium text-[#111827]">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-[#111827]">{employeeData?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Position</p>
                    <p className="text-sm font-medium text-[#111827]">{employeeData?.position || '-'}</p>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Links</h4>
                <div className="grid grid-cols-3 gap-4">
                  <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100 group">
                    <Calendar className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-[11px] font-bold text-gray-600">Attendance</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <Clock className="w-6 h-6 text-orange-500 mb-2" />
                    <span className="text-[11px] font-bold text-gray-600">Leave Balance</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <FileText className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-[11px] font-bold text-gray-600">Payslips</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[24px] p-8 text-white relative overflow-hidden shadow-lg shadow-blue-100">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2">Need to update your details?</h4>
              <p className="text-blue-100 text-sm max-w-md mb-6 leading-relaxed">
                Some information like your role and department can only be changed by an administrator. Please contact HR if you find any discrepancies.
              </p>
              <button className="px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                Contact Support
              </button>
            </div>
            <Shield className="absolute -right-8 -bottom-8 w-48 h-48 text-blue-500/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
