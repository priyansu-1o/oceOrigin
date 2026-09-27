'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OceanMap = dynamic(() => import('@/components/OceanMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', fontSize: '13px' }}>
      Loading map…
    </div>
  ),
});

const VESSELS = [
  { id: 'A', name: 'MV Kaveri Star', mmsi: '419 002 481', type: 'Tanker · IMO 9312410', dist: '3.2 km', dt: '+22 min', bias: 0.66, color: 'var(--red)' },
  { id: 'B', name: 'MT Porbandar', mmsi: '419 118 226', type: 'Tanker · IMO 9204471', dist: '7.8 km', dt: '−54 min', bias: 0.34, color: 'var(--amber)' },
  { id: 'C', name: 'MV Coromandel', mmsi: '419 004 733', type: 'Bulk carrier · IMO 9118820', dist: '11.4 km', dt: '+3h 10m', bias: 0.12, color: 'var(--ink-faint)' },
];

const CASE = { id: 'STB-2447', slick: 'SLK-2447-A', area: '4.6 km²', conf: 0.91, date: '2024-11-14 04:22 UTC' };

function scoreClass(v) { return v >= 60 ? 'high' : v >= 25 ? 'mid' : 'low'; }
function scoreColor(v) { return v >= 60 ? 'var(--red)' : v >= 25 ? 'var(--amber)' : 'var(--ink-faint)'; }
function badgeInfo(s) {
  if (s >= 60) return { t: 'STRONG CANDIDATE', c: 'var(--red)', bg: 'var(--red-soft)' };
  if (s >= 25) return { t: 'PLAUSIBLE', c: 'var(--amber)', bg: 'var(--amber-soft)' };
  return { t: 'RULED OUT', c: 'var(--ink-faint)', bg: 'rgba(110,127,146,0.1)' };
}

// Ring chart
function Ring({ value, color, size = 56 }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * value / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size > 50 ? '12px' : '10px', fontWeight: 800, color,
      }}>{value}%</div>
    </div>
  );
}

export default function AttributePage() {
  const [selected, setSelected] = useState('A');
  const [results, setResults] = useState({ A: 91, B: 43, C: 12 });
  const [runLog, setRunLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | running | done

  const sorted = [...VESSELS].sort((a, b) => results[b.id] - results[a.id]);
  const topMargin = results[sorted[0].id] - results[sorted[1].id];

  const statusPill = (() => {
    if (status === 'idle') return { text: 'Awaiting stability test', c: 'var(--amber)', bg: 'var(--amber-soft)' };
    if (status === 'running') return { text: `Running… (${runCount}/8)`, c: 'var(--teal)', bg: 'var(--teal-soft)' };
    if (topMargin >= 30) return { text: `Robust — ${sorted[0].name.split(' ').slice(-2).join(' ')}`, c: 'var(--green)', bg: 'var(--green-soft)' };
    if (topMargin < 10) return { text: 'Attribution unresolved', c: 'var(--red)', bg: 'var(--red-soft)' };
    return { text: 'Competing candidates', c: 'var(--amber)', bg: 'var(--amber-soft)' };
  })();

  const runStabilityTest = useCallback(async () => {
    if (running) return;
    setRunning(true); setStatus('running'); setRunLog([]); setRunCount(0);
    const wins = { A: 0, B: 0, C: 0 };
    const log = [];

    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 320));
      const scores = {};
      VESSELS.forEach(v => { scores[v.id] = v.bias + (Math.random() - 0.5) * 0.5; });
      const ranked = [...VESSELS].sort((a, b) => scores[b.id] - scores[a.id]);
      wins[ranked[0].id]++;
      log.push(ranked.map(v => v.id).join(' > '));
      setRunCount(i + 1);
      setRunLog([...log]);
    }

    const newResults = {
      A: Math.round(wins.A / 8 * 100),
      B: Math.round(wins.B / 8 * 100),
      C: Math.round(wins.C / 8 * 100),
    };
    setResults(newResults);
    const newSorted = [...VESSELS].sort((a, b) => newResults[b.id] - newResults[a.id]);
    setSelected(newSorted[0].id);
    setRunning(false);
    setStatus('done');
  }, [running]);

  const selectedVessel = VESSELS.find(v => v.id === selected);
  const selectedScore = results[selected];
  const badge = badgeInfo(selectedScore);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Top bar ── */}
        <div style={{
          borderBottom: '1px solid var(--line)', background: 'var(--panel)',
          padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--ink-faint)', fontWeight: 600, marginBottom: '2px' }}>
              CASE {CASE.id} · SENTINEL-1 · {CASE.slick}
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Source Attribution — Ennore Coast Corridor
            </h1>
          </div>

          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: statusPill.bg, color: statusPill.c,
            padding: '6px 14px', borderRadius: '20px', marginLeft: 'auto',
            fontSize: '12px', fontWeight: 700, transition: 'all 0.3s',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor', animation: status === 'running' ? 'pulse 1s ease-in-out infinite' : 'none', flexShrink: 0 }} />
            {statusPill.text}
          </div>

          {/* Run button */}
          <button
            id="run-stability-btn"
            onClick={runStabilityTest}
            disabled={running}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: running ? 'var(--panel-2)' : 'var(--navy)',
              color: running ? 'var(--ink-soft)' : '#fff',
              border: '1px solid var(--line)', borderRadius: '10px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 700,
              cursor: running ? 'default' : 'pointer', transition: 'all 0.2s',
            }}
          >
            {running
              ? <><svg style={{ animation: 'spin 1s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeDasharray="40" /></svg>Run {runCount}/8…</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2h6v4H9z" /><path d="M9 6H6a1 1 0 00-1 1v13a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-1-1h-3" /></svg>Run stability test</>
            }
          </button>
        </div>

        {/* ── Main layout ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, height: 'calc(100vh - 200px)' }}>

          {/* Vessel list sidebar */}
          <div style={{
            width: '270px', flexShrink: 0, borderRight: '1px solid var(--line)',
            background: 'var(--panel)', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700 }}>Candidate vessels</span>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--teal)',
                background: 'var(--teal-soft)', padding: '2px 9px', borderRadius: '20px',
              }}>3 in corridor</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {VESSELS.map(v => {
                const s = results[v.id];
                return (
                  <div key={v.id} id={`vessel-card-${v.id}`}
                    onClick={() => setSelected(v.id)}
                    style={{
                      padding: '12px', borderRadius: '10px', marginBottom: '6px',
                      cursor: 'pointer', border: `1px solid ${v.id === selected ? 'rgba(14,165,183,0.35)' : 'transparent'}`,
                      background: v.id === selected ? 'var(--teal-soft)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, fontSize: '13px', fontWeight: 700 }}>{v.name}</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: scoreColor(s) }}>{s}%</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                      <span>Dist <b style={{ color: 'var(--ink)' }}>{v.dist}</b></span>
                      <span>Δt <b style={{ color: 'var(--ink)' }}>{v.dt}</b></span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '3px', background: 'var(--line)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        width: `${s}%`, background: scoreColor(s),
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attribution summary */}
            {status === 'done' && (
              <div style={{ borderTop: '1px solid var(--line)', padding: '12px 14px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Attribution outcome
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sorted.map((v, i) => (
                    <div key={v.id} style={{ flex: 1, background: 'var(--bg)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--ink-faint)', marginBottom: '3px' }}>#{i + 1}</div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: scoreColor(results[v.id]) }}>{results[v.id]}%</div>
                      <div style={{ fontSize: '9.5px', color: 'var(--ink-faint)', fontFamily: 'var(--mono)', marginTop: '2px' }}>{v.id}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                  Margin: <b style={{ color: topMargin >= 30 ? 'var(--green)' : 'var(--amber)' }}>{topMargin} pts</b>
                  {' '}· AS score robust if margin ≥ 30
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: 'relative' }}>
            <OceanMap
              selected={selected}
              results={results}
              onSelectVessel={setSelected}
            />
          </div>

          {/* Detail panel */}
          <div style={{
            width: '300px', flexShrink: 0, borderLeft: '1px solid var(--line)',
            background: 'var(--panel)', overflowY: 'auto', padding: '16px',
          }}>
            {/* Vessel header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em' }}>{selectedVessel.name}</div>
              <div style={{
                fontSize: '10px', fontWeight: 800, padding: '3px 9px', borderRadius: '20px',
                color: badge.c, background: badge.bg, flexShrink: 0, marginTop: '2px',
              }}>{badge.t}</div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-faint)', marginBottom: '14px' }}>
              MMSI {selectedVessel.mmsi} · {selectedVessel.type}
            </div>

            {/* Metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {[
                { k: 'Spatial fit', v: selectedVessel.dist },
                { k: 'Temporal fit', v: selectedVessel.dt },
                { k: 'AIS quality', v: selectedVessel.id === 'C' ? 'Medium' : 'High' },
                { k: 'Track overlap', v: `${Math.round(selectedScore * 0.95)}%` },
              ].map(c => (
                <div key={c.k} style={{ background: 'var(--bg)', borderRadius: '9px', padding: '9px 11px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '9.5px', color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{c.k}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{c.v}</div>
                </div>
              ))}
            </div>

            {/* Attribution score ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', background: 'var(--bg)', borderRadius: '10px', padding: '12px', border: '1px solid var(--line)' }}>
              <Ring value={selectedScore} color={scoreColor(selectedScore)} size={56} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  Attribution stability<br />
                  <b style={{ color: 'var(--ink)' }}>
                    {status === 'idle' ? 'Not yet tested' :
                      selectedScore >= 60 ? 'Robust' : selectedScore >= 25 ? 'Competing' : 'Unresolved'}
                  </b>
                  {status === 'done' && sorted[0].id === selected &&
                    <> · margin <span style={{ color: 'var(--green)' }}>{topMargin} pts</span></>
                  }
                </div>
              </div>
            </div>

            {/* All candidates mini-bars */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                All candidates
              </div>
              {sorted.map((v, i) => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--ink-faint)', width: '14px' }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600 }}>{v.name.split(' ').slice(-2).join(' ')}</span>
                      <span style={{ fontWeight: 800, color: scoreColor(results[v.id]) }}>{results[v.id]}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${results[v.id]}%`, background: scoreColor(results[v.id]), transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scenario log */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Scenario log {runLog.length ? `(${runLog.length}/8)` : ''}
              </div>
              {runLog.length === 0 ? (
                <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)', lineHeight: 1.6 }}>
                  Press &ldquo;Run stability test&rdquo; to simulate the perturbation ensemble across 8 scenarios.
                </div>
              ) : (
                <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  {runLog.map((r, i) => (
                    <div key={i} style={{
                      fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-soft)',
                      padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span style={{ color: 'var(--ink-faint)' }}>Run {i + 1}: </span>{r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Output outcome badge */}
            {status === 'done' && (
              <div style={{
                marginTop: '14px', padding: '14px', borderRadius: '10px',
                background: topMargin >= 30 ? 'var(--green-soft)' : topMargin < 10 ? 'var(--red-soft)' : 'var(--amber-soft)',
                border: `1px solid ${topMargin >= 30 ? 'rgba(47,143,91,0.3)' : topMargin < 10 ? 'rgba(201,67,63,0.3)' : 'rgba(220,138,31,0.3)'}`,
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: topMargin >= 30 ? 'var(--green)' : topMargin < 10 ? 'var(--red)' : 'var(--amber)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {topMargin >= 30 ? 'ROBUST' : topMargin < 10 ? 'UNRESOLVED' : 'COMPETING'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {topMargin >= 30
                    ? `${sorted[0].name} is the dominant signal. One clear culprit.`
                    : topMargin < 10
                      ? 'Multiple strong suspects. Attribution lost in the noise.'
                      : 'Similarly supported candidates. Split signal.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
