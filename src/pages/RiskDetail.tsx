import { motion } from 'motion/react';
import { Factory, Workflow, Package, Cpu, MapPin, Clock, AlertTriangle, ShieldCheck, ChevronRight, Download } from 'lucide-react';

interface RiskDetailProps {
  nodeId: string;
}

export default function RiskDetail({ nodeId }: RiskDetailProps) {
  const handleExport = async () => {
    const res = await fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: `Strategic Risk Analysis: Xinghua Electronics`, 
        nodeInfo: {
          name: 'Xinghua Electronics Co.',
          region: 'Shenzhen, PRC',
          classification: 'Tier-4 Semiconductor Supplier'
        },
        data: [
          ['Xinghua Electronics (CN)', 'Tier-4 / Primary Node', '8.4'],
          ['Global Semi (TW)', 'Tier-3 / Logistics Path', '1.2'],
          ['Apex Modules (DE)', 'Tier-2 / Sub-System', '2.5'],
          ['Titan Pro-X (US)', 'Final Assembly Port', '0.8']
        ]
      })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GlobeSec_Report_${nodeId}.pdf`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1a1a1a] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest">TIER-4 SUPPLIER</span>
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">• NODE ID: {nodeId}</span>
          </div>
          <h1 className="text-4xl font-serif italic text-white tracking-tight">Xinghua Electronics Co.</h1>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span className="text-xs font-medium">Shenzhen, People's Republic of China</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span className="text-xs font-medium">Last Audit: 4h 12m ago</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 p-6 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl min-w-[280px]">
          <div className="relative w-16 h-16 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-4 border-[#1a1a1a]"></div>
             <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-pulse"></div>
             <span className="text-xl font-serif font-bold text-red-500">84</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-red-500 mb-1 uppercase tracking-widest">CRITICAL RISK</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Severity Analysis: High</span>
          </div>
        </div>
      </div>

      {/* Exposure Path */}
      <section className="bg-[#0d0d0d] p-8 border border-[#1a1a1a] rounded-xl">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-sm font-serif italic text-white">Exposure Path Visualization</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">4 DEGREES OF SEPARATION</span>
        </div>
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          {[
            { label: 'XINGHUA (T4)', icon: Factory, color: 'text-red-500' },
            { label: 'GLOBAL SEMI (T3)', icon: Workflow, color: 'text-slate-500' },
            { label: 'APEX MODULES (T2)', icon: Package, color: 'text-slate-500' },
            { label: 'TITAN PRO-X (END)', icon: Cpu, color: 'text-primary' },
          ].map((step, idx, arr) => (
            <div key={idx} className="flex-1 flex items-center group">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 ${step.color === 'text-red-500' ? 'bg-red-500/10 border-red-500/50 scale-110' : 'bg-[#1a1a1a] border-[#333]'}`}>
                  <step.icon size={22} className={step.color} />
                </div>
                <span className={`text-[10px] font-bold text-center uppercase tracking-widest ${step.color}`}>{step.label}</span>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-px bg-[#1a1a1a] mx-4 relative">
                  <ChevronRight size={14} className="absolute -top-[7px] left-1/2 -translate-x-1/2 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0d0d0d]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Intelligence Summary</h3>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">CONFIDENCE: 92%</span>
            </div>
            <div className="p-6 space-y-4">
              {[
                { title: 'Affiliation with sanctioned entity', desc: 'Direct equity ownership (34.2%) traced to the Huaxin Defense Group, currently listed on the US Entity List.', type: 'urgent' },
                { title: 'Recent export control policy change', desc: 'Affected by new H1-2024 restrictions on advanced lithography components. Export permit 884-C is pending.', type: 'info' }
              ].map((item, idx) => (
                <div key={idx} className={`flex gap-4 p-5 rounded-lg border border-transparent transition-all ${item.type === 'urgent' ? 'bg-red-500/5 border-red-500/10' : 'bg-[#1a1a1a] border-[#333]/30'}`}>
                  {item.type === 'urgent' ? <AlertTriangle className="text-red-500 shrink-0" size={18} /> : <ShieldCheck className="text-primary shrink-0" size={18} />}
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-xl">
            <h3 className="text-xs font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">Tactical Response</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] text-white text-[10px] font-bold uppercase tracking-widest py-3 px-4 flex justify-between items-center transition-all rounded-lg">
                <span>Diversify Supplier</span>
                <ChevronRight size={14} />
              </button>
              <button 
                onClick={handleExport}
                className="w-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-3 px-4 flex justify-between items-center transition-all rounded-lg hover:opacity-90"
              >
                <span>Export Audit PDF</span>
                <Download size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
