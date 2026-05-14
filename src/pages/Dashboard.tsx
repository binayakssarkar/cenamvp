import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, ShieldCheck, Rss } from 'lucide-react';

interface DashboardProps {
 onDrillDown: (node: any) => void;
  onMetricClick: (metric: string) => void;
  onIntelClick: (article: any) => void;
  onViewAllIntel: () => void;
  highlightedNodes?: string[];
}

export default function Dashboard({ onDrillDown, onMetricClick, onIntelClick, onViewAllIntel, highlightedNodes = [] }: DashboardProps) {
  const [intelFeed, setIntelFeed] = useState<any[]>([]);const [nodes, setNodes] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null); const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard-metrics')
  .then(res => res.json())
  .then(data => setMetrics(data));

  fetch('/api/intel-feed')
    .then(res => res.json())
    .then(data => setIntelFeed(data.articles || []));

  fetch('/api/health')
    .then(res => res.json())
    .then(data => setHealth(data));

  fetch('/api/suppliers')
    .then(res => res.json())
    .then(data => {
      const dynamicNodes = data.map((supplier: any, idx: number) => ({
       riskScore: Number(supplier.risk_index || 0),
        id: supplier.vendor_identity,
        
        name: supplier.geo_loc?.toUpperCase() || 'UNKNOWN',


        // temporary fake positions
        pos: [
          'top-[35%] left-[78%]',
          'top-[38%] left-[80%]',
          'top-[25%] left-[48%]',
          'top-[45%] left-[68%]',
        ][idx % 4],

        color:
          Number(supplier.risk_index) > 7
            ? 'bg-red-500'
            : 'bg-amber-500',

        risk:
          Number(supplier.risk_index) > 7
            ? 'CRITICAL'
            : 'MONITORED',
      }));

      setNodes(dynamicNodes);
    });
}, []);

  

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505] selection:bg-[#6366f1]/30">
      {/* Risk Posture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => onMetricClick('risk')}
          className="bg-[#0d0d0d] border border-[#1a1a1a] p-5 rounded-xl cursor-pointer hover:border-red-500/30 transition-all group active:scale-[0.98]"
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold group-hover:text-red-400 transition-colors">Aggregate Risk Score</p>
          <h2 className="text-5xl font-serif text-white mt-2">{metrics?.aggregateRisk || 0}<span className="text-lg text-slate-600"> / 100</span></h2>
         <div className="w-full h-1 bg-[#1a1a1a] mt-4 rounded-full overflow-hidden">
  <div
    className="bg-red-500 h-full"
    style={{
      width: `${metrics?.aggregateRisk || 0}%`
    }}
  />
</div>
          <p className="text-xs text-red-400 mt-3 font-medium">+4.2% since previous scan</p>
        </div>

        <div 
          onClick={() => onMetricClick('sanctions')}
          className="bg-[#0d0d0d] border border-[#1a1a1a] p-5 rounded-xl cursor-pointer hover:border-amber-500/30 transition-all group active:scale-[0.98]"
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold group-hover:text-amber-400 transition-colors">Critical Sanction Hits</p>
          <h2 className="text-5xl font-serif text-white mt-2">{metrics?.sanctions || 0}</h2>
          <p className="text-xs text-amber-500 mt-6 italic font-medium">4 entities flagged via OFAC</p>
        </div>

        <div 
          onClick={() => onMetricClick('monitoring')}
          className="bg-[#0d0d0d] border border-[#1a1a1a] p-5 rounded-xl cursor-pointer hover:border-indigo-500/30 transition-all group active:scale-[0.98]"
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold group-hover:text-indigo-400 transition-colors">Active Monitoring</p>
          <h2 className="text-5xl font-serif text-white mt-2">
  {metrics?.monitoring || 0}
</h2>
          <p className="text-xs text-slate-400 mt-6 font-medium">AIS stream monitoring active</p>
        </div>

        <div 
          onClick={() => onMetricClick('integrity')}
          className="bg-[#0d0d0d] border border-[#1a1a1a] p-5 rounded-xl flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-all active:scale-[0.98]"
        >
           <div>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">System Integrity</p>
             <div className="mt-2 space-y-1">
               <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-slate-400">Neo4j Aura:</span>
                 <span className={health?.neo4j === 'Connected' ? 'text-green-400' : 'text-red-400'}>{health?.neo4j || 'Checking...'}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-slate-400">Supabase:</span>
                 <span className="text-green-400">Active</span>
               </div>
             </div>
           </div>
           <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Node: {health?.regions?.[0] || 'Unknown'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Global Risk Heatmap */}
        <div className="lg:col-span-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl relative overflow-hidden flex flex-col group">
          <div className="absolute top-5 left-5 z-10">
            <h3 className="text-sm font-serif italic text-white flex items-center gap-2">
              Multi-Tier Supplier Graph
              {highlightedNodes.length > 0 && (
                <span className="text-[9px] font-mono bg-indigo-500 text-white px-2 py-0.5 rounded not-italic tracking-widest animate-pulse uppercase">
                  Highlight Active
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500">Source: CSV Upload #88219</p>
          </div>
          
          <div className="flex-1 relative bg-[#0e0e10] overflow-hidden">
            <img 
              className="w-full h-full object-cover opacity-40 grayscale brightness-50 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAgarhIRNEccoqIbYl3Nrn37hJkfqQ0KdhzaElMr0foMeLjnjRSOLrxbf0x5uYzHWS-op7wpdvORqd0J4HgvvwYNyKDQ4DP7MFfzrnf7OI3lLTVJlBFyJ-zr_L5aGdK1xVyC8Kq1EeqxExLvP11A2OCjGKEloQJv1E1dEgQZQnEWSB8smYikU-qFZwq23BeKmrJ3fWt8h_aog-RkkUHhf3TRueMh91rm-NhcqZrT_NQQ8VETNJ3_pYFI_nmV4Ll-15qLl_Kht--u8" 
              alt="World Map" 
            />
            {nodes.length === 0 && (
  <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm italic">
    Upload a BOM CSV to begin graph analysis.
  </div>
)}
            {/* Dynamic Map Nodes */}
            
            {nodes.map((node) => {
              const isHighlighted = highlightedNodes.includes(node.id);
              return (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0 }} 
                  animate={{ 
                    opacity: 1,
                    scale: isHighlighted ? 1.25 : 1,
                  }}
                  whileHover={{ scale: 1.1 }}
                  className={`absolute ${node.pos} cursor-pointer z-20 transition-all duration-500`}
                 onClick={() => onDrillDown(node)}
                >
                  <span className={`breathing-dot absolute -top-2 -left-2 w-4 h-4 ${node.color} rounded-full ${isHighlighted ? 'opacity-100 scale-150 animate-ping' : 'opacity-50'}`}></span>
                  <div className={`bg-[#0d0d0d] p-2 border ${isHighlighted ? 'border-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-slate-800'} text-[9px] font-mono whitespace-nowrap shadow-2xl rounded-sm hover:border-white transition-all`}>
                    <span className={`${node.color.replace('bg-', 'text-')} font-bold uppercase`}>NODE: {node.name}</span><br/>
                    <span className="text-slate-400 italic font-medium">{node.risk}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="absolute bottom-5 right-5 text-[10px] text-slate-600 font-bold tracking-tight">
            Tier-4 depth visualization rendered via Neo4j Aura
          </div>
        </div>

        {/* Live Intelligence Feed */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl flex flex-col p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-6">Intelligence Feed</p>
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {intelFeed.length > 0 ? intelFeed.slice(0, 5).map((article, idx) => (
              <div 
                key={idx} 
                onClick={() => onIntelClick(article)}
                className={`border-l-2 pl-3 py-1 cursor-pointer hover:bg-white/5 transition-all group ${article.risk === 'CRITICAL' ? 'border-red-500' : 'border-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">{article.time || '09:42 AM'} - {article.source}</p>
                  {article.risk === 'CRITICAL' && <AlertTriangle size={10} className="text-red-500" />}
                </div>
                <p className="text-xs text-slate-200 leading-snug font-medium mt-1 group-hover:text-white transition-colors">{article.title}</p>
              </div>
            )) : (
              <div className="text-center text-slate-600 py-10 italic text-[10px]">No active signals detected...</div>
            )}
          </div>
          <div className="mt-6">
            <button 
              onClick={onViewAllIntel}
              className="w-full py-2 bg-[#1a1a1a] border border-[#333] text-[10px] text-white uppercase tracking-widest rounded-lg hover:bg-[#222] hover:border-[#6366f1]/50 transition-all font-bold"
            >
              View All Intelligence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
