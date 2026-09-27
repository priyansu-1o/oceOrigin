'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OceanMap = dynamic(() => import('@/components/OceanMap'), {
  ssr: false, loading: () => (
    <div style={{ width: '100%', height: '100%', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', fontSize: '13px' }}>
      Loading map…
    </div>
  )
});

const PARTICLES_COUNT = 60;

function generateParticles(seed) {
  return Array.from({ length: PARTICLES_COUNT }, (_, i) => {
    const angle = ((i / PARTICLES_COUNT) * Math.PI * 2) + (seed * 0.3);
    const r = 0.04 + Math.random() * 0.12;
    return {
      lat: 13.30 + Math.cos(angle) * r + (Math.random() - 0.5) * 0.02,
      lng: 80.40 + Math.sin(angle) * r + (Math.random() - 0.5) * 0.02,
      age: Math.random(),
    };
  });
}

function ParticleCanvas({ running, step, totalSteps }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    particlesRef.current = generateParticles(0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw probability heatmap
      const prog = step / Math.max(totalSteps, 1);
      const cx = W * 0.48, cy = H * 0.52;

      // Heatmap rings
      [
        { r: 160 * prog, op: 0.06, color: '#DC8A1F' },
        { r: 110 * prog, op: 0.10, color: '#DC8A1F' },
        { r: 70 * prog, op: 0.16, color: '#C9433F' },
        { r: 35 * prog, op: 0.24, color: '#C9433F' },
      ].forEach(ring => {
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, ring.r);
        grd.addColorStop(0, `${ring.color}${Math.round(ring.op * 255).toString(16).padStart(2, '0')}`);
        grd.addColorStop(1, `${ring.color}00`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Slick polygon
      ctx.beginPath();
      const slickPts = [[0.48, 0.52], [0.49, 0.50], [0.51, 0.49], [0.52, 0.51], [0.52, 0.54], [0.50, 0.55]];
      ctx.moveTo(slickPts[0][0] * W, slickPts[0][1] * H);
      slickPts.forEach(([x, y]) => ctx.lineTo(x * W, y * H));
      ctx.closePath();
      ctx.fillStyle = 'rgba(11,37,69,0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(14,165,183,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Particles
      if (running) {
        particlesRef.current.forEach(p => {
          // Drift toward slick
          p.lat += (13.222 - p.lat) * 0.008 * prog + (Math.random() - 0.5) * 0.001;
          p.lng += (80.446 - p.lng) * 0.008 * prog + (Math.random() - 0.5) * 0.001;
          p.age = Math.min(1, p.age + 0.003);
        });
      }

      particlesRef.current.forEach(p => {
        const px = ((p.lng - 80.30) / 0.22) * W;
        const py = ((13.40 - p.lat) / 0.22) * H;
        const alpha = 0.3 + p.age * 0.6;
        const col = p.age > 0.7 ? `rgba(201,67,63,${alpha})` : `rgba(220,138,31,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      if (running) rafRef.current = requestAnimationFrame(draw);
    };

    if (running) {
      draw();
    } else {
      draw();
    }

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, step, totalSteps]);

  return (
    <canvas
      ref={canvasRef}
      width={640} height={380}
      style={{ width: '100%', height: '100%', borderRadius: '12px', background: '#060E1A' }}
    />
  );
}

const SCENARIOS = [
  { id: 'S1', label: 'Nominal', windBias: 0, currentBias: 0 },
  { id: 'S2', label: '+15% wind speed', windBias: 0.15, currentBias: 0 },
  { id: 'S3', label: '−15% wind speed', windBias: -0.15, currentBias: 0 },
  { id: 'S4', label: '+10° wind rotation', windBias: 0.05, currentBias: 0.05 },
  { id: 'S5', label: 'ERA5 ±σ current', windBias: 0, currentBias: 0.15 },
  { id: 'S6', label: 'T−6h release', windBias: 0.02, currentBias: 0.03 },
  { id: 'S7', label: 'T+6h release', windBias: -0.03, currentBias: -0.02 },
  { id: 'S8', label: 'Diffusion +50%', windBias: 0.01, currentBias: 0.01 },
];

export default function TransportPage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [totalSteps] = useState(80);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [params, setParams] = useState({
    windField: 'ERA5 HRES 0.25°',
    currentField: 'CMEMS global 1/12°',
    diffusion: '2.0 m²/s',
    releaseTime: '2024-11-14 06:00 UTC',
    backtrackHours: 18,
    particles: 5000,
  });

  const runSimulation = async () => {
    setRunning(true);
    setStep(0);
    setCompletedScenarios([]);

    for (let sc = 0; sc < SCENARIOS.length; sc++) {
      setActiveScenario(SCENARIOS[sc].id);
      for (let s = 0; s <= totalSteps; s++) {
        await new Promise(r => setTimeout(r, 25));
        setStep(s);
      }
      setCompletedScenarios(prev => [...prev, SCENARIOS[sc].id]);
      await new Promise(r => setTimeout(r, 200));
    }
    setRunning(false);
    setActiveScenario(null);
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Header */}
        <div style={{
          borderBottom: '1px solid var(--line)', background: 'var(--panel)',
          padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--amber)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>
              MODULE 02 · LAGRANGIAN TRANSPORT
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Ensemble Backward Particle Simulation
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
              Perturb plausible wind, current, diffusion, release time → source probability field (location × time)
            </p>
          </div>
          <button
            id="run-transport-btn"
            onClick={runSimulation}
            disabled={running}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: running ? 'var(--panel-2)' : 'linear-gradient(135deg, var(--amber), #b06b14)',
              color: running ? 'var(--ink-soft)' : '#fff',
              border: '1px solid var(--line)', borderRadius: '10px',
              padding: '11px 22px', fontSize: '13px', fontWeight: 700,
              cursor: running ? 'default' : 'pointer', transition: 'all 0.2s',
            }}
          >
            {running
              ? <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeDasharray="40" /></svg>Simulating…</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>Run Ensemble</>
            }
          </button>
        </div>

        {/* Progress */}
        <div style={{ height: '3px', background: 'var(--line)' }}>
          <div style={{
            height: '100%',
            width: running ? `${(completedScenarios.length / SCENARIOS.length) * 100}%` : completedScenarios.length === SCENARIOS.length ? '100%' : '0%',
            background: 'linear-gradient(90deg, #b06b14, var(--amber))',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 195px)' }}>
          {/* Left panel - params */}
          <div style={{
            width: '260px', flexShrink: 0, borderRight: '1px solid var(--line)',
            background: 'var(--panel)', overflowY: 'auto', padding: '16px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Simulation parameters
            </div>
            {Object.entries(params).map(([k, v]) => (
              <div key={k} style={{
                padding: '10px 12px', background: 'var(--bg)', borderRadius: '8px',
                marginBottom: '8px', border: '1px solid var(--line)',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  {k.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--ink)' }}>{v}</div>
              </div>
            ))}

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Ensemble runs ({SCENARIOS.length})
              </div>
              {SCENARIOS.map(sc => (
                <div key={sc.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
                  fontSize: '11.5px',
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '5px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: completedScenarios.includes(sc.id) ? 'var(--green)' :
                      activeScenario === sc.id ? 'var(--amber)' : 'var(--line)',
                    transition: 'background 0.3s',
                    flexShrink: 0,
                  }}>
                    {completedScenarios.includes(sc.id)
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      : activeScenario === sc.id
                        ? <svg style={{ animation: 'spin 1s linear infinite' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="7" strokeDasharray="30" /></svg>
                        : <span style={{ fontSize: '8px', color: 'var(--ink-faint)', fontWeight: 700 }}>{sc.id}</span>
                    }
                  </div>
                  <span style={{ color: activeScenario === sc.id ? 'var(--amber)' : completedScenarios.includes(sc.id) ? 'var(--ink-soft)' : 'var(--ink-faint)' }}>
                    {sc.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center - canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{
              flex: 1, borderRadius: '12px', overflow: 'hidden',
              border: '1px solid var(--line)', position: 'relative',
            }}>
              <ParticleCanvas running={running} step={step} totalSteps={totalSteps} />

              {/* HUD overlay */}
              <div style={{
                position: 'absolute', top: '12px', left: '12px',
                background: 'rgba(15,26,43,0.9)', backdropFilter: 'blur(10px)',
                borderRadius: '8px', padding: '10px 14px',
                border: '1px solid var(--line)', zIndex: 10,
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-faint)', marginBottom: '4px' }}>BACKWARD TRANSPORT · t−18h</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: running ? 'var(--amber)' : completedScenarios.length === SCENARIOS.length ? 'var(--green)' : 'var(--ink-soft)' }}>
                  {running ? `Scenario ${activeScenario} · step ${step}/${totalSteps}` :
                    completedScenarios.length === SCENARIOS.length ? `Complete · ${SCENARIOS.length} scenarios` : 'Ready to simulate'}
                </div>
              </div>

              {/* Legend */}
              <div style={{
                position: 'absolute', bottom: '12px', right: '12px',
                background: 'rgba(15,26,43,0.9)', backdropFilter: 'blur(10px)',
                borderRadius: '8px', padding: '10px 14px', border: '1px solid var(--line)', zIndex: 10,
              }}>
                {[
                  { color: '#C9433F', label: 'High probability source' },
                  { color: '#DC8A1F', label: 'Candidate zone' },
                  { color: 'rgba(14,165,183,0.8)', label: 'Observed slick' },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'var(--ink-soft)', padding: '2px 0' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color, flexShrink: 0 }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Step slider */}
            {completedScenarios.length > 0 && !running && (
              <div style={{ marginTop: '16px', background: 'var(--panel)', borderRadius: '10px', padding: '14px 18px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--ink-soft)' }}>
                  <span>Timeline</span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--amber)' }}>t−{Math.round((1 - step / totalSteps) * 18)}h</span>
                </div>
                <input type="range" min={0} max={totalSteps} value={step}
                  onChange={e => setStep(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--amber)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ink-faint)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
                  <span>Observed slick (t=0)</span><span>−18 hours</span>
                </div>
              </div>
            )}
          </div>

          {/* Right - results */}
          <div style={{
            width: '240px', flexShrink: 0, borderLeft: '1px solid var(--line)',
            background: 'var(--panel)', overflowY: 'auto', padding: '16px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Source probability
            </div>

            {[
              { label: 'Primary zone', lat: '13.29°N', lng: '80.40°E', prob: 0.71, color: 'var(--red)' },
              { label: 'Secondary zone', lat: '13.25°N', lng: '80.44°E', prob: 0.42, color: 'var(--amber)' },
              { label: 'Tertiary zone', lat: '13.31°N', lng: '80.37°E', prob: 0.18, color: 'var(--ink-faint)' },
            ].map((z, i) => (
              <div key={i} style={{
                background: 'var(--bg)', borderRadius: '10px', padding: '12px',
                marginBottom: '8px', border: '1px solid var(--line)',
                opacity: completedScenarios.length > 0 ? 1 : 0.35,
                transition: 'opacity 0.5s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{z.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: z.color }}>{Math.round(z.prob * 100)}%</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-faint)', marginBottom: '8px' }}>{z.lat} {z.lng}</div>
                <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${z.prob * 100}%`, background: z.color, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Output field
              </div>
              {[
                { k: 'Resolution', v: '0.5 km' },
                { k: 'Time steps', v: '72 (t−18h)' },
                { k: 'Particles', v: '5,000' },
                { k: 'Scenarios', v: `${completedScenarios.length} / ${SCENARIOS.length}` },
              ].map(f => (
                <div key={f.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '11.5px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: 'var(--ink-faint)' }}>{f.k}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--ink-soft)' }}>{f.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
