import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [mapping, setMapping] = useState({ supplier: 'vendor_identity', part: 'sku_id', country: 'geo_loc' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('bom', file);
    formData.append('mapping', JSON.stringify(mapping));

    try {
      const res = await fetch('/api/upload-bom', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch (err) {
      setStatus('error');
    }
  };

  const handleDownloadSample = () => {
    window.location.href = '/api/test-bom';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif italic text-white tracking-tight">Bill of Materials Intelligence</h2>
          <p className="text-slate-400 font-medium mt-1">Upload and map BOM files to identify multi-tier supplier vulnerabilities.</p>
        </div>
        <button 
          onClick={handleDownloadSample}
          className="text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all"
        >
          Download Testing Template
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-96 bg-[#0d0d0d] border border-[#1a1a1a] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all border-dashed rounded-xl"
          >
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv,.xlsx" />
            <div className="w-16 h-16 border-2 border-[#1a1a1a] rounded-full flex items-center justify-center mb-6 group-hover:border-primary transition-colors">
              <UploadIcon className="text-slate-500 group-hover:text-primary" size={32} />
            </div>
            <h3 className="text-lg font-serif italic text-white mb-2">
              {file ? file.name : 'Drop Intelligence Data'}
            </h3>
            <p className="text-slate-500 text-sm text-center max-w-sm mb-8">
              Support for CSV and XLSX. Multi-tier parsing enabled.
            </p>
            {file ? (
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={status === 'uploading'}
                  className="bg-primary text-white px-8 py-3 font-bold uppercase tracking-widest disabled:opacity-50 rounded-lg"
                >
                  {status === 'uploading' ? 'Ingesting...' : 'Confirm Ingestion'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                  className="bg-[#1a1a1a] p-3 border border-[#333] rounded-lg text-slate-400 hover:text-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ) : (
              <button className="bg-[#1a1a1a] border border-[#333] text-white px-8 py-3 font-bold uppercase tracking-widest rounded-lg hover:bg-[#222]">
                BROWSE LOCAL FILES
              </button>
            )}

            {status === 'success' && (
              <div className="absolute inset-0 bg-[#050505]/95 flex flex-col items-center justify-center animate-in fade-in rounded-xl">
                <CheckCircle className="text-primary mb-4" size={48} />
                <h4 className="text-xl font-serif italic text-white">Ingestion Complete</h4>
                <p className="text-sm text-slate-500 mt-2">Entities mapped to multi-tier graph</p>
                <button onClick={() => setFile(null)} className="mt-8 text-primary underline font-bold uppercase text-[10px] tracking-widest">Upload another</button>
              </div>
            )}
          </div>

          {/* Mapping Table */}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1a1a1a] bg-[#0d0d0d] flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attribute Mapping Configuration</h3>
              <span className="text-[10px] text-primary italic font-bold">Required: 3/3 Fields Mapped</span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: 'Supplier Name', key: 'supplier', options: ['vendor_identity', 'supplier_name'] },
                  { label: 'Part Number', key: 'part', options: ['sku_id', 'part_no'] },
                  { label: 'Origin Country', key: 'country', options: ['geo_loc', 'country_iso'] }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <select 
                      className="w-full bg-[#1a1a1a] border border-[#333] text-sm text-white px-4 py-2.5 rounded-lg focus:ring-1 focus:ring-primary outline-none transition-all"
                      value={(mapping as any)[item.key]}
                      onChange={(e) => setMapping(prev => ({ ...prev, [item.key]: e.target.value }))}
                    >
                      {item.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-8 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Intelligence Protocols</h4>
              <ul className="space-y-6 text-xs leading-relaxed text-slate-400">
                <li className="flex gap-4">
                  <CheckCircle size={16} className="text-primary shrink-0" />
                  <span>Ensure <strong>Country of Origin</strong> uses ISO codes for optimal mapping.</span>
                </li>
                <li className="flex gap-4">
                   <AlertCircle size={16} className="text-amber-500 shrink-0" />
                   <span>Mapping errors will be flagged for manual resolution in the Audit Log.</span>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
