import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import RiskDetail from './pages/RiskDetail';
import Upload from './pages/Upload';
import Chains from './pages/Chains';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<{ type: 'ingestion' | 'intel', data?: any } | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
    setSelectedNodeId(null);
    setSidePanel(null);
    setHighlightedNodes([]);
  };

  const handleDrillDown = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveScreen('detail');
    setSidePanel(null);
  };

  const handleIntelClick = (article: any) => {
    setSidePanel({ type: 'intel', data: article });
  };

  const handleHighlightNodes = (nodes: string[]) => {
    setHighlightedNodes(nodes);
    setActiveScreen('dashboard');
    setSidePanel(null);
    // Auto-clear highlight after 5 seconds
    setTimeout(() => setHighlightedNodes([]), 5000);
  };

  const handleMetricClick = (metric: string) => {
    switch (metric) {
      case 'risk': setActiveScreen('detail'); break;
      case 'sanctions': setActiveScreen('alerts'); break;
      case 'monitoring': setActiveScreen('chains'); break;
      case 'integrity': setActiveScreen('settings'); break;
    }
  };

  return (
    <div className="flex bg-background text-on-surface h-screen overflow-hidden font-sans">
      <Sidebar 
        activeScreen={activeScreen === 'detail' ? 'dashboard' : activeScreen} 
        onNavigate={handleNavigate} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          onUploadClick={() => handleNavigate('upload')} 
          onIngestionClick={() => setSidePanel({ type: 'ingestion' })}
        />
        
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {activeScreen === 'dashboard' && (
            <Dashboard 
              onDrillDown={handleDrillDown} 
              onMetricClick={handleMetricClick}
              onIntelClick={handleIntelClick}
              onViewAllIntel={() => setActiveScreen('alerts')}
              highlightedNodes={highlightedNodes}
            />
          )}
          {activeScreen === 'detail' && <RiskDetail nodeId={selectedNodeId || '8824-XHE'} />}
          {activeScreen === 'upload' && <Upload />}
          {activeScreen === 'chains' && <Chains />}
          {activeScreen === 'alerts' && <Alerts />}
          {activeScreen === 'reports' && <Reports />}
          {activeScreen === 'settings' && <Settings />}

          {/* Side Panel Overlay */}
          {sidePanel && (
            <div className="absolute inset-y-0 right-0 w-96 bg-[#0d0d0d] border-l border-[#1a1a1a] shadow-2xl z-50 p-8 transform transition-transform animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#6366f1]">
                  {sidePanel.type === 'ingestion' ? 'Ingestion Breakdown' : 'Intelligence Detail'}
                </h3>
                <button 
                  onClick={() => setSidePanel(null)}
                  className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-bold"
                >
                  Close [ESC]
                </button>
              </div>

              {sidePanel.type === 'ingestion' && (
                <div className="space-y-6">
                  <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Volume per Source</p>
                    <div className="space-y-4">
                      {[
                        { label: 'CSV Uploads', val: '420 MB', color: 'bg-indigo-500' },
                        { label: 'OpenSanctions', val: '180 MB', color: 'bg-blue-500' },
                        { label: 'SCOMET Updates', val: '95 MB', color: 'bg-amber-500' },
                        { label: 'NewsAPI / OSINT', val: '310 MB', color: 'bg-purple-500' },
                        { label: 'AISstream', val: '225 MB', color: 'bg-emerald-500' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-400 font-medium">{s.label}</span>
                            <span className="text-white font-mono">{s.val}</span>
                          </div>
                          <div className="h-1 bg-[#080808] rounded-full overflow-hidden">
                            <div className={`${s.color} h-full`} style={{ width: '60%' }}></div>
                          </div>
                      </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Last Sync</p>
                       <p className="text-xs text-white font-bold">2.4m ago</p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">New Nodes</p>
                       <p className="text-xs text-indigo-400 font-bold">+1,422</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-1">Status: Operational</p>
                    <p className="text-xs text-slate-400">All data pipelines are flowing at nominal rates.</p>
                  </div>
                </div>
              )}

              {sidePanel.type === 'intel' && (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg border ${sidePanel.data.risk === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${sidePanel.data.risk === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {sidePanel.data.risk}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{sidePanel.data.id}</span>
                    </div>
                    <h2 className="text-xl font-serif italic text-white leading-tight">{sidePanel.data.title}</h2>
                    <p className="text-xs text-slate-500 mt-2">{sidePanel.data.time} ago • {sidePanel.data.source}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Impact Analysis</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sidePanel.data.impact}
                      </p>
                    </div>

                    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Technical Details</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        {sidePanel.data.details}
                      </p>
                    </div>

                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Actionable Recommendation</p>
                      <p className="text-xs text-slate-300 font-medium">
                        {sidePanel.data.recommendation}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleHighlightNodes(sidePanel.data.affectedNodes || [])}
                    className="w-full bg-[#6366f1] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all mt-4 flex items-center justify-center gap-2"
                  >
                    Drill Down to Graph
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
        
        <footer className="h-12 border-t border-[#1a1a1a] bg-[#080808] flex items-center px-8 justify-between text-[10px] text-slate-500">
          <div className="flex gap-8">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 
              Supabase Connected
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 
              India-S1 Node Active
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
              Neo4j Aura Ready
            </span>
          </div>
          <div className="uppercase tracking-tighter font-bold">
            Watermarked PDF Engine: <span className="text-slate-300">Operational</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
