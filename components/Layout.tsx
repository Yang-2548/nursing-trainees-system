
import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  UserMinus, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const menuItems = [
    { id: 'dashboard', name: '数据分析', shortName: '概览', icon: LayoutDashboard },
    { id: 'incoming', name: '来院管理', shortName: '来院', icon: UserPlus },
    { id: 'outgoing', name: '外出管理', shortName: '外出', icon: UserMinus },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row">
      {/* PC Side Sidebar - Hidden on Mobile */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Stethoscope size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">进修生管理</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 mb-1">系统版本</p>
            <p className="text-xs font-bold text-slate-500 font-mono tracking-widest">v2.5.0-MOBILE</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="md:hidden bg-blue-600 p-1.5 rounded-lg text-white">
              <Stethoscope size={18} />
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-800">
              {menuItems.find(m => m.id === activeTab)?.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs md:text-sm font-bold text-slate-700">管理员</span>
              <span className="text-[10px] md:text-xs text-emerald-500 font-medium">在线</span>
            </div>
            <img 
              src="https://picsum.photos/seed/med/40/40" 
              alt="Avatar" 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200 shadow-sm" 
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation - Visible only on Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.shortName}
                </span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
