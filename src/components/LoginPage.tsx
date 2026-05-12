import { useAuth } from '../hooks/useAuth';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans antialiased text-[#111827]">
      <div className="w-full max-w-sm bg-white rounded-[24px] p-10 border border-[#E5E7EB] flex flex-col items-center text-center shadow-sm">
        <div className="w-12 h-12 bg-[#2563EB] rounded-2xl flex items-center justify-center mb-8 text-white">
          <ShieldCheck className="w-6 h-6" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">PulseHR</h1>
        <p className="text-[#6B7280] text-[13px] mb-10">Advanced Workforce Management</p>
        
        <div className="w-full space-y-4">
          <div className="p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] text-left">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Secure Entry</h3>
            <p className="text-[13px] text-[#4B5563] leading-relaxed">Please sign in with your corporate account to access the personnel dashboard.</p>
          </div>

          <button
            onClick={login}
            className="w-full flex items-center justify-center space-x-3 bg-[#2563EB] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all group shadow-sm"
          >
            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="mt-10 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          System Core v1.4.2
        </p>
      </div>
      
      <div className="mt-8 flex space-x-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <button className="hover:text-blue-600 transition-colors">Security</button>
        <button className="hover:text-blue-600 transition-colors">Legal</button>
        <button className="hover:text-blue-600 transition-colors">Support</button>
      </div>
    </div>
  );
}
