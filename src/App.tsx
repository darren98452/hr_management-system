import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import DepartmentList from './components/DepartmentList';
import Attendance from './components/Attendance';
import LeaveRequests from './components/LeaveRequests';
import Profile from './components/Profile';
import LoginPage from './components/LoginPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmployeeAdd, setShowEmployeeAdd] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F5F5F5] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing System...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowEmployeeAdd(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return (
        <Dashboard 
          onNavigate={handleTabChange} 
          onAction={(action) => {
            if (action === 'add-employee') {
              setActiveTab('employees');
              setShowEmployeeAdd(true);
            }
          }} 
        />
      );
      case 'employees': return <EmployeeList defaultShowAdd={showEmployeeAdd} />;
      case 'departments': return <DepartmentList />;
      case 'attendance': return <Attendance />;
      case 'leaves': return <LeaveRequests />;
      case 'profile': return <Profile />;
      default: return <Dashboard onNavigate={handleTabChange} onAction={() => {}} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
