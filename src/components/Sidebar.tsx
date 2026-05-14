import { LayoutDashboard, Share2, Bell, FileText, Settings, UserCircle, Shield } from 'lucide-react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chains', label: 'My Chains', icon: Share2 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-outline-variant bg-[#080808] flex flex-col h-screen shrink-0">
      <div className="p-6">
        <div className="text-2xl font-serif italic text-white tracking-tight">GlobeSec</div>
        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Intelligence Platform</div>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-4">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 group rounded-lg
                ${isActive 
                  ? 'text-white bg-[#1a1a1a] font-medium' 
                  : 'text-slate-400 hover:text-white transition-colors'}`}
            >
              <div className={`w-2 h-2 rounded-full self-center ${isActive ? 'bg-primary' : 'bg-transparent border border-slate-600'}`}></div>
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant p-6 opacity-60 text-[11px] text-slate-500 space-y-1">
        <p>Supabase Auth: Indian-S1</p>
        <p>Neo4j Status: Connected</p>
      </div>
    </aside>
  );
}
