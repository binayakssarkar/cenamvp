import React from 'react';
import { Settings as SettingsIcon, Shield, Server, Bell, Key, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      <div>
        <h2 className="text-4xl font-serif italic text-white tracking-tight">System Configuration</h2>
        <p className="text-slate-400 font-medium mt-1">Manage intelligence protocols, database nodes, and encryption keys.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 space-y-2">
          {[
            { label: 'General Protocol', icon: SettingsIcon, active: true },
            { label: 'Security & Auth', icon: Shield, active: false },
            { label: 'Database Nodes', icon: Server, active: false },
            { label: 'Notification Rules', icon: Bell, active: false },
            { label: 'API & Webhooks', icon: Key, active: false },
            { label: 'Regional Ingestion', icon: Globe, active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${item.active ? 'bg-primary text-white' : 'text-slate-500 hover:bg-[#111] hover:text-slate-300'}`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </aside>

        <section className="col-span-12 lg:col-span-9 space-y-8">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-8 space-y-8">
            <div className="border-b border-[#1a1a1a] pb-6">
              <h3 className="text-lg font-serif italic text-white mb-1">Intelligence Extraction</h3>
              <p className="text-xs text-slate-500">Enable automated multi-tier graph expansion from OSINT streams.</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Autonomous Deep Mapping</span>
                <div className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="border-b border-[#1a1a1a] pb-6">
               <h3 className="text-lg font-serif italic text-white mb-1">Confidence Thresholds</h3>
               <p className="text-xs text-slate-500">Minimum confidence required to flag a node for manual review.</p>
               <input type="range" className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer mt-8 accent-primary" />
               <div className="flex justify-between text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-widest">
                 <span>Heuristic Only</span>
                 <span>Validated (80%)</span>
                 <span>Definitive (95%+)</span>
               </div>
            </div>

            <div>
              <h3 className="text-lg font-serif italic text-white mb-1">Infrastructure Status</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Primary Cache</p>
                  <p className="text-white text-sm font-bold">Redis-S1 Node Active</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Graph Engine</p>
                  <p className="text-white text-sm font-bold">Neo4j V5.4 Enterprise</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
             <button className="bg-primary text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">
               Commit Changes
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}
