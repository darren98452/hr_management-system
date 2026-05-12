import { ReactNode, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  LogOut, 
  LayoutDashboard, 
  Clock,
  Search,
  Bell,
  X,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { aiSearch } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { profile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ text: string, sources: any[] } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    try {
      const resp = await aiSearch(searchQuery);
      setResults(resp);
    } catch (err) {
      console.error(err);
      setResults({ text: "Sorry, I couldn't process that search. Please try again.", sources: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: CalendarCheck },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans antialiased text-[#111827]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white border-r border-[#E5E7EB] flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
          <span className="font-bold text-lg tracking-tight">PulseHR</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-[14px] font-medium",
                activeTab === item.id 
                  ? "bg-[#EFF6FF] text-[#2563EB]" 
                  : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4",
                activeTab === item.id ? "text-[#2563EB]" : "text-[#6B7280]"
              )} />
              <span>{item.label}</span>
            </button>
          ))}
          
          {profile?.role === 'admin' && (
            <div className="pt-4 px-2">
              <button
                onClick={() => setActiveTab('employees')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#111827] text-white rounded-xl text-[13px] font-bold hover:bg-[#1F2937] transition-all shadow-lg active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Quick Onboard</span>
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-[#F3F4F6]">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-[#4B5563] hover:bg-[#FEE2E2] hover:text-[#DC2626] rounded-xl transition-all duration-200 text-[14px] font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-bottom border-[#E5E7EB] flex items-center justify-between px-8 shrink-0 relative z-40">
          <div className="relative w-96" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask AI Search (recent HR info, labor laws...)" 
                className="w-full bg-[#F3F4F6] border-none py-2.5 pl-10 pr-4 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
              )}
            </form>

            <AnimatePresence>
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-50 p-2"
                >
                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Pulse Search</span>
                    </div>

                    {isSearching ? (
                      <div className="py-8 flex flex-col items-center justify-center space-y-3">
                        <div className="flex space-x-1">
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Consulting real-time records...</span>
                      </div>
                    ) : results ? (
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                          {results.text}
                        </p>
                        
                        {results.sources.length > 0 && (
                          <div className="pt-4 border-t border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Sources Found</span>
                            <div className="flex flex-wrap gap-2">
                              {results.sources.map((s: any, idx: number) => (
                                <a 
                                  key={idx} 
                                  href={s.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-[11px] font-semibold text-gray-600 transition-colors border border-gray-100"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="max-w-[150px] truncate">{s.title || 'View Source'}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-gray-400">
                        Press Enter to search
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-[#E5E7EB]">
                    <span className="text-[10px] text-gray-400 font-medium">Results grounded by Google Search</span>
                    <button 
                      onClick={() => setShowResults(false)}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <div className="text-sm font-semibold">{profile?.email?.split('@')[0]}</div>
                <div className="text-[11px] font-medium text-gray-500 capitalize">{profile?.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-50">
                {profile?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
