
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
    { id: 'dashboard', name: '数据概览与分析', icon: LayoutDashboard },
    { id: 'incoming', name: '来院进修管理', icon: UserPlus },
    { id: 'outgoing', name: '外出进修管理', icon: UserMinus },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
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
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">系统版本</p>
            <p className="text-sm font-medium text-slate-700 font-mono">v2.1.0-Smart</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            {menuItems.find(m => m.id === activeTab)?.name}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-700">系统管理员</span>
              <span className="text-xs text-emerald-500 font-medium">在线</span>
            </div>
            <img 
              src="https://picsum.photos/seed/med/40/40" 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border border-slate-200" 
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
