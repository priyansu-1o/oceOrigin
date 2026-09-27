'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── Simulated SAR slick records ──
const SAR_RECORDS = [
  {
    id: 'SLK-2447-A', date: '2024-11-14 04:22 UTC', satellite: 'Sentinel-1A',
    area: '4.6 km²', dims: '4.6 × 1.1 km', confidence: 0.91,
    lat: '13.222°N', lng: '80.446°E', type: 'Mineral oil',
    morphology: 'Elongated ribbon', orientation: '248°',
    status: 'CONFIRMED',
  },
  {
    id: 'SLK-2441-B', date: '2024-11-10 03:58 UTC', satellite: 'Sentinel-1B',
    area: '2.1 km²', dims: '2.1 × 0.8 km', confidence: 0.74,
    lat: '13.31°N', lng: '80.39°E', type: 'Probable mineral oil',
    morphology: 'Irregular patch', orientation: '195°',
    status: 'PROBABLE',
  },
  {
    id: 'SLK-2439-C', date: '2024-11-08 04:10 UTC', satellite: 'Sentinel-1A',
    area: '0.9 km²', dims: '1.2 × 0.6 km', confidence: 0.56,
    lat: '13.19°N', lng: '80.52°E', type: 'Unclassified',
    morphology: 'Diffuse patch', orientation: '310°',
    status: 'LOOK-ALIKE',
  },
];

// ── SAR-like visual ──
function SARView({ record }) {
  const [scanPos, setScanPos] = useState(0);
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p = (p + 1) % 100;
      setScanPos(p);
    }, 30);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9',
      background: '#020810', borderRadius: '12px', overflow: 'hidden',
      position: 'relative', border: '1px solid var(--line)',
    }}>
      {/* Simulated SAR background - dark grainy ocean */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 48% 58%, rgba(14,165,183,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 80% 80% at 30% 30%, rgba(20,40,70,0.5) 0%, transparent 60%)
        `,
      }} />

      {/* Noise texture overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}>
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Slick polygon (dark on dark) */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 800 450">
        {/* Background speckle pattern */}
        {Array.from({ length: 120 }, (_, i) => (
          <circle key={i}
            cx={20 + Math.sin(i * 31.7) * 380 + 400}
            cy={20 + Math.cos(i * 17.3) * 200 + 225}
            r={Math.sin(i * 7.1) * 1.5 + 0.5}
            fill={`rgba(100,150,200,${0.03 + Math.sin(i * 5) * 0.02})`}
          />
        ))}

        {/* Main slick — very dark patch */}
        <ellipse cx="430" cy="260" rx="145" ry="55" fill="rgba(2,6,14,0.92)" />
        <ellipse cx="415" cy="255" rx="100" ry="38" fill="rgba(1,4,10,0.96)" />
        {/* Slick outline glow */}
        <ellipse cx="430" cy="260" rx="147" ry="57" fill="none" stroke="rgba(14,165,183,0.45)" strokeWidth="1.5" />

        {/* Measurement lines */}
        <line x1="285" y1="260" x2="575" y2="260" stroke="rgba(14,165,183,0.6)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="430" y="248" textAnchor="middle" fontSize="10" fill="rgba(14,165,183,0.9)" fontFamily="monospace">4.6 km</text>
        <line x1="430" y1="203" x2="430" y2="315" stroke="rgba(14,165,183,0.6)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="450" y="268" fontSize="10" fill="rgba(14,165,183,0.9)" fontFamily="monospace">1.1 km</text>

        {/* Coordinate markers */}
        <circle cx="430" cy="260" r="3" fill="#0EA5B7" />
        <text x="444" y="244" fontSize="9" fill="rgba(14,165,183,0.8)" fontFamily="monospace">13.222°N 80.446°E</text>

        {/* Heading indicator */}
        <line x1="350" y1="300" x2="510" y2="220" stroke="rgba(220,138,31,0.5)" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x="360" y="318" fontSize="9" fill="rgba(220,138,31,0.8)" fontFamily="monospace">248° drift</text>

        {/* HUD corners */}
        <path d="M10 10 L10 30 L30 10 Z" fill="none" stroke="rgba(14,165,183,0.4)" strokeWidth="1.5" />
        <path d="M790 10 L790 30 L770 10 Z" fill="none" stroke="rgba(14,165,183,0.4)" strokeWidth="1.5" />
        <path d="M10 440 L10 420 L30 440 Z" fill="none" stroke="rgba(14,165,183,0.4)" strokeWidth="1.5" />
        <path d="M790 440 L790 420 L770 440 Z" fill="none" stroke="rgba(14,165,183,0.4)" strokeWidth="1.5" />

        {/* Info boxes */}
        <rect x="10" y="10" width="120" height="16" fill="rgba(0,0,0,0.5)" />
        <text x="14" y="22" fontSize="9" fill="rgba(14,165,183,0.85)" fontFamily="monospace">SENTINEL-1A · IW · VV</text>
        <rect x="10" y="30" width="140" height="14" fill="rgba(0,0,0,0.5)" />
        <text x="14" y="41" fontSize="8.5" fill="rgba(100,150,200,0.7)" fontFamily="monospace">2024-11-14 04:22 UTC</text>
      </svg>

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(14,165,183,0.6) 50%, transparent 100%)',
        top: `${scanPos}%`, transition: 'none',
        boxShadow: '0 0 20px rgba(14,165,183,0.3)',
      }} />

      {/* Status badge */}
      <div style={{
        position: 'absolute', top: '12px', right: '12px',
        background: record.status === 'CONFIRMED' ? 'rgba(47,143,91,0.9)' : record.status === 'PROBABLE' ? 'rgba(220,138,31,0.9)' : 'rgba(110,127,146,0.9)',
        color: '#fff', borderRadius: '6px', padding: '4px 10px',
        fontSize: '10px', fontWeight: 800, fontFamily: 'monospace',
      }}>
        {record.status}
      </div>
    </div>
  );
}

export default function DetectPage() {
  const [selected, setSelected] = useState(SAR_RECORDS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const runAnalysis = async () => {
    setAnalyzing(true); setDone(false); setProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }
    setAnalyzing(false); setDone(true);
  };

  const confColor = (c) => c >= 0.8 ? 'var(--green)' : c >= 0.6 ? 'var(--amber)' : 'var(--ink-faint)';

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Page header */}
        <div style={{
          borderBottom: '1px solid var(--line)', background: 'var(--panel)',
          padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>
              MODULE 01 · SAR SLICK DETECTION
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Sentinel-1 SAR Slick Characterization
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
              Detect and characterize oil slick candidates — polygon, extent, orientation, morphology, confidence
            </p>
          </div>
          <button
            id="run-analysis-btn"
            onClick={runAnalysis}
            disabled={analyzing}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: analyzing ? 'var(--panel-2)' : 'linear-gradient(135deg, var(--teal), var(--teal-dim))',
              color: analyzing ? 'var(--ink-soft)' : '#fff',
              border: '1px solid var(--line)', borderRadius: '10px',
              padding: '11px 22px', fontSize: '13px', fontWeight: 700, cursor: analyzing ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {analyzing
              ? <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeDasharray="40" /></svg>Analysing…</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2h6v4H9z" /><path d="M9 6H6a1 1 0 00-1 1v13a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1h-3" /></svg>Run SAR Analysis</>
            }
          </button>
        </div>

        {/* Progress bar */}
        {(analyzing || done) && (
          <div style={{ height: '3px', background: 'var(--line)' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: done ? 'var(--green)' : 'linear-gradient(90deg, var(--teal-dim), var(--teal))',
              transition: 'width 0.1s linear',
            }} />
          </div>
        )}

        <div style={{ display: 'flex', maxHeight: 'calc(100vh - 160px)' }}>
          {/* Left: record list */}
          <div style={{
            width: '280px', flexShrink: 0, borderRight: '1px solid var(--line)',
            background: 'var(--panel)', overflowY: 'auto',
          }}>
            <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Detection log · {SAR_RECORDS.length} records
              </div>
            </div>
            {SAR_RECORDS.map(r => (
              <div key={r.id}
                id={`slick-card-${r.id}`}
                onClick={() => setSelected(r)}
                style={{
                  padding: '14px 16px', borderBottom: '1px solid var(--line)',
                  cursor: 'pointer', transition: 'background 0.2s',
                  background: selected.id === r.id ? 'var(--teal-soft)' : 'transparent',
                  borderLeft: selected.id === r.id ? '3px solid var(--teal)' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600, color: 'var(--teal)' }}>{r.id}</div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                    color: r.status === 'CONFIRMED' ? 'var(--green)' : r.status === 'PROBABLE' ? 'var(--amber)' : 'var(--ink-faint)',
                    background: r.status === 'CONFIRMED' ? 'var(--green-soft)' : r.status === 'PROBABLE' ? 'var(--amber-soft)' : 'rgba(110,127,146,0.12)',
                  }}>{r.status}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>{r.satellite}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-faint)', fontFamily: 'var(--mono)' }}>{r.date}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--ink-soft)' }}>
                  <span>{r.area}</span>
                  <span style={{ color: confColor(r.confidence) }}>conf. {r.confidence}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: detail */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            {/* SAR visual */}
            <SARView record={selected} />

            {/* Metadata grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px', marginTop: '20px',
            }}>
              {[
                { k: 'Slick ID', v: selected.id },
                { k: 'Satellite', v: selected.satellite },
                { k: 'Acquisition', v: selected.date },
                { k: 'Area', v: selected.area },
                { k: 'Dimensions', v: selected.dims },
                { k: 'Confidence', v: selected.confidence, color: confColor(selected.confidence) },
                { k: 'Latitude', v: selected.lat },
                { k: 'Longitude', v: selected.lng },
                { k: 'Type', v: selected.type },
                { k: 'Morphology', v: selected.morphology },
                { k: 'Orientation', v: selected.orientation },
                { k: 'Status', v: selected.status },
              ].map(item => (
                <div key={item.k} style={{
                  background: 'var(--panel)', border: '1px solid var(--line)',
                  borderRadius: '10px', padding: '12px 14px',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{item.k}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: item.color || 'var(--ink)', fontFamily: item.k === 'Slick ID' || item.k === 'Acquisition' ? 'var(--mono)' : 'inherit' }}>{item.v}</div>
                </div>
              ))}
            </div>

            {/* Confidence bar */}
            <div style={{ marginTop: '20px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-soft)' }}>Detection confidence</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: confColor(selected.confidence) }}>{(selected.confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--line)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  width: `${selected.confidence * 100}%`,
                  background: `linear-gradient(90deg, ${confColor(selected.confidence)}, rgba(255,255,255,0.5))`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--ink-faint)' }}>
                <span>Low (look-alike)</span><span>Medium (probable)</span><span>High (confirmed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
