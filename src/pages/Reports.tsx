import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, HardDrive, Filter, Search } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif italic text-white tracking-tight">Intelligence Archives</h2>
          <p className="text-slate-400 font-medium mt-1">Generated strategic reports and historical risk assessments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500 italic">Syncing with secure vault...</div>
        ) : reports.map((report) => (
          <div key={report.id} className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-xl group hover:border-primary/30 transition-all flex flex-col justify-between h-56">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <FileText size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">{report.id}</span>
              </div>
              <h3 className="text-white font-bold leading-tight group-hover:text-primary transition-colors">{report.name}</h3>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <Calendar size={12} />
                  {report.date}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <HardDrive size={12} />
                  {report.size}
                </div>
              </div>
            </div>
            <button className="w-full bg-[#1a1a1a] border border-[#333] py-2.5 rounded-lg text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#222] transition-all">
              <Download size={14} />
              Download Report
            </button>
          </div>
        ))}

        {/* Empty placeholder card to show it's a list */}
        <div className="bg-transparent border-2 border-dashed border-[#1a1a1a] p-6 rounded-xl flex flex-col items-center justify-center min-h-[224px] text-slate-600">
           <FileText size={32} className="mb-4 opacity-50" />
           <p className="text-xs font-bold uppercase tracking-widest">New report requested</p>
        </div>
      </div>
    </div>
  );
}
