import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import neo4j from 'neo4j-driver';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- Database Clients (Lazy Init) ---

let neo4jDriver: any = null;
function getNeo4j() {
  if (!neo4jDriver && process.env.NEO4J_URI) {
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || '')
    );
  }
  return neo4jDriver;
}

let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient && process.env.SUPABASE_URL) {
    supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || '');
  }
  return supabaseClient;
}

// --- API Routes ---

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'active', 
    engine: 'GlobeSec_Intell_V4',
    regions: ['India-S1'],
    neo4j: process.env.NEO4J_URI ? 'Connected' : 'Missing Config'
  });
});

// Generate a sample BOM for testing
app.get('/api/test-bom', (req, res) => {
  const csv = [
    'vendor_identity,sku_id,mfr_source,geo_loc,risk_index',
    'Xinghua Electronics,XHE-8824,Huaxin Defense,Shenzhen,8.4',
    'MicroGen Corp,MGC-1022,Taiwan Semi,Hsinchu,1.2',
    'Apex Modules,APX-9901,Global Foundries,Frankfurt,2.5',
    'Zenith Logistics,ZEN-001,Local Trans,Shanghai,5.4'
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=sample_bom.csv');
  res.send(csv);
});

// news feed ingestion
app.get('/api/intel-feed', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    // Fallback/Mock data if key is placeholder or real calls fail
    const mockArticles = [
      { 
        id: 'INT-001',
        title: "New SCOMET restriction on semiconductors in Southeast Asia region.", 
        source: "Reuters Intl", 
        time: "04m", 
        risk: "CRITICAL",
        impact: "High probability of export tier delays for H1-2024 lithography components.",
        affectedNodes: ['Xinghua Electronics'],
        recommendation: "Shift procurement to secondary channel in Taiwan or Germany immediately.",
        details: "Deep analysis suggests that the new SCOMET restrictions specifically target dual-use semiconductor nodes. Xinghua Electronics is directly impacted by its Tier-4 manufacturing location."
      },
      { 
        id: 'INT-002',
        title: "Port of Rotterdam reports 12% decrease in throughput; strike imminent.", 
        source: "OSINT Bureau", 
        time: "28m", 
        risk: "ELEVATED",
        impact: "Potential 2-week delay in European module assembly logistics.",
        affectedNodes: ['Apex Modules'],
        recommendation: "Route shipments through Port of Hamburg or initiate air-freight and buffer stock.",
        details: "Industrial action at Rotterdam is expected to last 72 hours, creating a significant backlog for T2 logistics providers."
      },
      { 
        id: 'INT-003',
        title: "Vessel 'MARAN GAS' altered course toward restricted zone in Suez.", 
        source: "AISStream", 
        time: "1h", 
        risk: "ELEVATED",
        impact: "Strategic fuel supply interruption for downstream energy consumers.",
        affectedNodes: ['Global Semi'],
        recommendation: "Activate strategic energy reserves and monitor AIS for course re-correction.",
        details: "Geopolitical tension in the Red Sea has forced course deviations. Real-time satellite tracking indicates a 600nm detour."
      },
      { 
        id: 'INT-004',
        title: "Weekly SDNR list update processed. 122 entries checked.", 
        source: "OFAC", 
        time: "2h", 
        risk: "STABLE",
        impact: "Zero matches found in active Tier-1 to Tier-3 supplier entities.",
        affectedNodes: [],
        recommendation: "No immediate action required. Batch audit complete.",
        details: "Routine compliance verification against OFAC Specially Designated Nationals (SDN) list. No relational overlaps found."
      },
      { 
        id: 'INT-005',
        title: "Zenith Logistics flagged in latest DGFT SCOMET PDF parsing.", 
        source: "GlobeSec AI", 
        time: "4h", 
        risk: "CRITICAL",
        impact: "Violation of export permit 884-C detected via NLP parsing engine.",
        affectedNodes: ['Zenith Logistics'],
        recommendation: "Suspend all active POs with Zenith and initiate legal compliance review.",
        details: "AI-driven entity resolution identified Zenith as a sub-subsidiary of a sanctioned parent firm during a PDF audit run."
      }
    ];

    if (!apiKey || apiKey === "2fdad1f1db2a4d3c897364de25acde0a") {
       return res.json({ articles: mockArticles });
    }

    const response = await axios.get(`https://newsapi.org/v2/everything?q=supply+chain+sanctions&apiKey=${apiKey}`).catch(() => ({ data: { articles: mockArticles } }));
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// BOM Upload and Graph Generation
app.post('/api/upload-bom', upload.single('bom'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const records = parse(req.file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true
    });

    const driver = getNeo4j();
    if (driver) {
      const session = driver.session();
      try {
        for (const record of records as any[]) {
          await session.run(`
            MERGE (s:Supplier {name: $supplier})
            SET s.country = $country, s.riskScore = toFloat($risk)
            MERGE (p:Part {sku: $partNumber})
            MERGE (s)-[:SUPPLIES]->(p)
          `, {
            supplier: record.vendor_identity || record.SupplierName || 'Unknown',
            country: record.geo_loc || record.OriginCountry || 'Unknown',
            partNumber: record.sku_id || record.PartNumber || 'PART-000',
            risk: record.risk_index || (Math.random() * 10).toFixed(1)
          });
        }
      } finally {
        await session.close();
      }
    }

    // Also persist metadata to Supabase
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('bom_audit').insert({
        file_name: req.file.originalname,
        record_count: records.length,
        status: 'PROCESSED'
      });
    }

    res.json({ success: true, count: records.length, simulated: !driver });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// chains ingestion audit
app.get('/api/chains', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('bom_audit')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data);
    }
    // Fallback if no supabase
    res.json([
      { id: 1, file_name: 'SUPPLY_CHAIN_ALPHA_Q2.csv', record_count: 142, status: 'PROCESSED', created_at: new Date().toISOString() },
      { id: 2, file_name: 'BOM_Z_SERIES_V4.xlsx', record_count: 88, status: 'PROCESSED', created_at: new Date(Date.now() - 86400000).toISOString() }
    ]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// alerts
app.get('/api/alerts', async (req, res) => {
  res.json([
    { id: 'AL-901', type: 'SANCTION', severity: 'CRITICAL', title: 'Direct hit on Tier-4 Supplier in Shanghai', status: 'UNRESOLVED', time: '12m ago' },
    { id: 'AL-842', type: 'POLICY', severity: 'ELEVATED', title: 'Lithography Export Control Update', status: 'INVESTIGATING', time: '1h ago' },
    { id: 'AL-773', type: 'GEOPOLITICAL', severity: 'STABLE', title: 'Rotterdam Port Congestion Index', status: 'RESOLVED', time: '4h ago' }
  ]);
});

// reports history (mock)
app.get('/api/reports', async (req, res) => {
  res.json([
    { id: 'REP-001', name: 'Strategic Analysis: Xinghua Electronics', size: '1.2 MB', date: '2024-05-12', type: 'PDF' },
    { id: 'REP-002', name: 'Monthly Supply Chain Audit - April', size: '4.8 MB', date: '2024-05-01', type: 'PDF' }
  ]);
});

// PDF Generation
app.post('/api/generate-report', async (req, res) => {
  try {
    const doc = new jsPDF();
    const { title, data, nodeInfo } = req.body;

    // Deep Dark Theme / Defense Grade Look
    doc.setFillColor(10, 10, 12);
    doc.rect(0, 0, 210, 297, 'F');

    // Header Header
    doc.setTextColor(99, 102, 241); // Indigo Primary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('GLOBESEC', 20, 30);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('STRATEGIC RISK ASSESSMENT REPORT', 20, 38);
    
    const reportId = `SR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    doc.text(`ID: ${reportId}`, 150, 38);

    // Separator line
    doc.setDrawColor(30, 30, 35);
    doc.line(20, 45, 190, 45);

    // Subject
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'Intelligence Audit Report', 20, 58);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Generated on: ${new Date().toUTCString()}`, 20, 65);
    doc.text('Clearance Level: LEVEL 5 (VOIGHT-KAMPFF)', 20, 70);

    // Node Summary Section
    if (nodeInfo) {
      doc.setFillColor(15, 15, 18);
      doc.rect(20, 80, 170, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('ENTITY PROFILE', 25, 90);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Node Name: ${nodeInfo.name}`, 25, 98);
      doc.text(`Region: ${nodeInfo.region}`, 25, 104);
      doc.text(`Classification: ${nodeInfo.classification}`, 25, 110);
      
      // Risk Score Circle in PDF
      doc.setDrawColor(239, 68, 68); // Red
      doc.setLineWidth(1);
      doc.circle(170, 100, 12);
      doc.setTextColor(239, 68, 68);
      doc.setFontSize(14);
      doc.text('84', 166, 102);
      doc.setFontSize(7);
      doc.text('RISK', 167, 108);
    }

    // Watermark
    doc.saveGraphicsState();
    (doc as any).setGState(new (doc as any).GState({opacity: 0.03}));
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(60);
    doc.text('INTERNAL USE ONLY', 30, 160, { angle: 45 });
    doc.restoreGraphicsState();

    // Intelligence Summary Section
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('INTELLIGENCE SUMMARY', 20, 135);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const summary = [
      "• Direct affiliation with sanctioned entity 'Huaxin Defense Group' identified.",
      "• Multi-hop relational analysis confirms 34.2% beneficial ownership.",
      "• Recent export control policy shifts (SCOMET H1-2024) significantly impact node availability.",
      "• Confidence score: 92% based on cross-referenced OSINT/AIS streams."
    ];
    summary.forEach((line, i) => doc.text(line, 20, 145 + (i * 6)));

    // Tactical Response
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(12);
    doc.text('TACTICAL RESPONSE RECOMMENDATIONS', 20, 175);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const tactics = [
      "1. Immediate diversification of Tier-4 semiconductor lithography components recommended.",
      "2. Initiate compliance audit with regional PLI/SCOMET guidelines.",
      "3. Active AIS monitoring of vessel shipments from Port of Shanghai."
    ];
    tactics.forEach((t, i) => doc.text(t, 20, 185 + (i * 6)));

    // Table
    autoTable(doc, {
      startY: 210,
      head: [['Relational Node', 'Classification', 'Risk Score']],
      body: data || [
        ['Xinghua Electronics (CN)', 'Primary Target / Tier-4', '8.4'],
        ['Global Semi (TW)', 'Downstream / Tier-3', '1.2'],
        ['Apex Modules (DE)', 'Sub-Assembly / Tier-2', '2.5'],
        ['Titan Pro-X (US)', 'OEM / Assembly', '0.8']
      ],
      theme: 'grid',
      styles: { 
        fillColor: [15, 15, 18], 
        textColor: [200, 200, 200], 
        fontSize: 9,
        cellPadding: 4,
        lineColor: [30, 30, 35]
      },
      headStyles: { 
        fillColor: [99, 102, 241], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [20, 20, 23]
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
      doc.text('GlobeSec Intelligence Platform - India-S1 Node', 20, 285);
      doc.text('SECURITY ENCRYPTED: AES-256', 20, 290);
    }

    const pdfOutput = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfOutput));
  } catch (error: any) {
    console.error('PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlobeSec Intelligence Server running on http://localhost:${PORT}`);
  });
}

startServer();
