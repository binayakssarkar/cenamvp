import React, { useState, useEffect } from 'react';
import { Database, FileText, Calendar, ChevronRight, Search, Filter } from 'lucide-react';

export default function Chains() {
  const [chains, setChains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chains')
      .then(res => res.json())
      .then(data => {
        setChains(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif italic text-white tracking-tight">Supply Chain Inventory</h2>
          <p className="text-slate-400 font-medium mt-1">Audit log of all ingested BOMs and relational maps.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search chains..." 
              className="bg-[#0d0d0d] border border-[#1a1a1a] text-white text-xs px-10 py-2.5 rounded-lg outline-none focus:border-primary/50 transition-all w-64"
            />
          </div>
          <button className="bg-[#0d0d0d] border border-[#1a1a1a] text-slate-400 p-2.5 rounded-lg hover:text-white">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dataset Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ingestion Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Count</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">Decrypting stream...</td></tr>
            ) : chains.map((chain) => (
              <tr key={chain.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Database size={16} />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-tight">{chain.file_name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} />
                    {new Date(chain.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-5 font-mono text-xs text-slate-300">
                  {chain.record_count} ENTITIES
                </td>
                <td className="px-6 py-5">
                  <span className="text-[9px] font-bold px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded uppercase tracking-widest">
                    {chain.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-500 group-hover:text-primary transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
