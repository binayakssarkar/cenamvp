import { Search, Bell, UserCircle } from 'lucide-react';

interface TopBarProps {
  onUploadClick: () => void;
  onIngestionClick: () => void;
}

export default function TopBar({ onUploadClick, onIngestionClick }: TopBarProps) {
  return (
    <header className="h-16 border-b border-[#1a1a1a] flex items-center justify-between px-8 bg-[#050505]">
      <div className="flex gap-4">
        <span className="text-[11px] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333] text-green-400 font-bold tracking-tight">LIVE FEED ACTIVE</span>
        <button 
          onClick={onIngestionClick}
          className="text-[11px] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333] text-slate-400 hover:border-[#6366f1]/50 hover:text-white transition-all cursor-pointer font-bold tracking-tight"
        >
          INGESTION: 1.2 GB / DAY
        </button>
      </div>

      <div className="flex gap-6 items-center">
        <div className="text-right">
          <p className="text-xs text-white">Admin User</p>
          <p className="text-[10px] text-slate-500">Global Security Clearance</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7]"></div>
        
        <button 
          onClick={onUploadClick}
          className="bg-[#1a1a1a] border border-[#333] text-[10px] text-white uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#222] transition-colors"
        >
          Upload BOM
        </button>
      </div>
    </header>
  );
}
