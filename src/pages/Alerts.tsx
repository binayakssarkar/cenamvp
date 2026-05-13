import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Clock, ShieldAlert, ChevronRight } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'ELEVATED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif italic text-white tracking-tight">Active Indicators</h2>
          <p className="text-slate-400 font-medium mt-1">Real-time risk flags and policy violation alerts.</p>
        </div>
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-[#1a1a1a] px-4 py-2 rounded-lg hover:text-white transition-all">
          Clear Resolved
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-slate-500 italic">Accessing restricted signals...</div>
        ) : alerts.map((alert) => (
          <div key={alert.id} className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all cursor-pointer group">
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getSeverityStyles(alert.severity)}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${getSeverityStyles(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{alert.id}</span>
                </div>
                <h3 className="text-white font-bold text-lg">{alert.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <ShieldAlert size={12} />
                    {alert.type}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {alert.time}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STATUS</p>
                <p className={`text-xs font-bold ${alert.status === 'UNRESOLVED' ? 'text-red-500' : 'text-slate-400'}`}>{alert.status}</p>
              </div>
              <ChevronRight className="text-slate-600 group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
