'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ── Animated particle canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,183,${p.alpha})`;
        ctx.fill();
      });
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14,165,183,${0.06 * (1 - d / 140)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />;
}

/* ── Radar animation ── */
function RadarOrb() {
  return (
    <div style={{ position: 'relative', width: '380px', height: '380px', flexShrink: 0 }}>
      {/* Outer rings */}
      {[1, 0.72, 0.48, 0.26].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          border: `1px solid rgba(14,165,183,${0.08 + i * 0.04})`,
          borderRadius: '50%',
          transform: `scale(${s})`,
          top: '50%', left: '50%',
          marginTop: `-${190 * s}px`, marginLeft: `-${190 * s}px`,
          width: `${380 * s}px`, height: `${380 * s}px`,
        }} />
      ))}
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(14,165,183,0.12)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(14,165,183,0.12)' }} />
        {/* Sweep */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '190px', height: '2px', transformOrigin: '0 50%',
          background: 'linear-gradient(90deg, rgba(14,165,183,0.8), transparent)',
          animation: 'radar-sweep 3s linear infinite',
        }} />
        {/* Sweep glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '180px', height: '80px', transformOrigin: '0 100%',
          background: 'conic-gradient(from 0deg, rgba(14,165,183,0.15), transparent 40%)',
          animation: 'radar-sweep 3s linear infinite',
          marginTop: '-80px',
        }} />
      </div>
      {/* Center dot */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '12px', height: '12px', borderRadius: '50%',
        background: 'var(--teal)', transform: 'translate(-50%,-50%)',
        boxShadow: '0 0 20px rgba(14,165,183,0.8)',
      }} />
      {/* Blip dots */}
      {[
        { top: '30%', left: '60%', color: 'var(--red)' },
        { top: '58%', left: '35%', color: 'var(--amber)' },
        { top: '42%', left: '72%', color: 'var(--ink-faint)' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: b.top, left: b.left,
          width: '8px', height: '8px', borderRadius: '50%',
          background: b.color, border: '2px solid rgba(255,255,255,0.4)',
          boxShadow: `0 0 10px ${b.color}`,
          animation: `pulse ${1.5 + i * 0.4}s ease-in-out infinite`,
        }} />
      ))}
      {/* Slick polygon */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 380 380">
        <path
          d="M210 190 C 230 175,250 178,260 192 C 270 206,265 225,248 232 C 228 241,205 235,196 220 C 188 207,193 202,210 190 Z"
          fill="rgba(11,37,69,0.85)" stroke="rgba(14,165,183,0.5)" strokeWidth="1.5"
          style={{ animation: 'pulse 2.5s ease-in-out infinite' }}
        />
      </svg>
    </div>
  );
}

/* ── Stats ── */
const STATS = [
  { val: '4.6 km²', label: 'Avg slick detected', color: 'var(--teal)' },
  { val: '91%', label: 'Attribution confidence', color: 'var(--green)' },
  { val: '18h', label: 'Backward trace window', color: 'var(--amber)' },
  { val: '8×', label: 'Perturbation ensemble', color: 'var(--red)' },
];

/* ── Feature cards ── */
const FEATURES = [
  {
    href: '/detect',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" />
      </svg>
    ),
    label: '01 / Detect',
    title: 'SAR Slick Detection',
    desc: 'Characterize oil slick polygons from Sentinel-1 SAR imagery. Extract extent, orientation, morphology and confidence scores via automated analysis.',
    tags: ['Sentinel-1', 'SAR', 'Polygon extraction'],
    color: 'var(--teal)',
    bg: 'var(--teal-soft)',
  },
  {
    href: '/transport',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 12c3-4 6-4 9 0s6 4 9 0" /><path d="M3 6c3-4 6-4 9 0s6 4 9 0" />
        <path d="M3 18c3-4 6-4 9 0s6 4 9 0" />
      </svg>
    ),
    label: '02 / Reconstruct',
    title: 'Lagrangian Transport',
    desc: 'Ensemble backward particle transport simulation using ERA5 wind & ocean current fields. Perturb plausible release assumptions to build source probability fields.',
    tags: ['ERA5', 'Backward simulation', 'Probability field'],
    color: 'var(--amber)',
    bg: 'var(--amber-soft)',
  },
  {
    href: '/attribute',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        <path d="M11 8v3l2 2" />
      </svg>
    ),
    label: '03 / Attribute',
    title: 'Source Attribution',
    desc: 'Intersect source probability with historical AIS vessel tracks. Run stability-aware verification across the ensemble to rank candidates with attribution margins.',
    tags: ['Historical AIS', 'Stability test', 'Attribution'],
    color: 'var(--red)',
    bg: 'var(--red-soft)',
  },
];

/* ── Pipeline steps ── */
const PIPELINE = [
  { num: '1', title: 'DETECT', sub: 'Sentinel-1 SAR', desc: 'Detect and characterize candidate slicks — polygon, extent, orientation, morphology, confidence.' },
  { num: '2', title: 'RECONSTRUCT', sub: 'Backward ensemble transport', desc: 'Perturb plausible wind, current, diffusion, release time → source probability field (location × time).' },
  { num: '3', title: 'CANDIDATES', sub: 'Historical AIS', desc: 'Intersect probability field with vessel trajectories. AIS gaps treated as uncertainty — not automatic absence.' },
  { num: '4', title: 'VERIFY + STABILISE', sub: 'Stability-aware verification layer', desc: 'Hypothetical release → forward simulation → predicted slick → compare with observed → aggregate across ensemble.' },
];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setActiveStep(s => (s + 1) % 4), 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(14,165,183,0.08) 0%, transparent 70%), var(--bg)',
        paddingTop: '64px',
      }}>
        <ParticleCanvas />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(14,165,183,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,183,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{
          position: 'relative', zIndex: 2, maxWidth: '1200px', width: '100%',
          padding: '0 48px', display: 'flex', alignItems: 'center',
          gap: '64px', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {/* Left text */}
          <div style={{ flex: '1 1 440px', maxWidth: '560px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--teal-soft)', border: '1px solid rgba(14,165,183,0.3)',
              borderRadius: '20px', padding: '5px 14px 5px 10px', marginBottom: '28px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)', animation: 'pulse 1.5s ease-in-out infinite', display: 'block' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--mono)' }}>
                CASE STB-2447 · ENNORE COAST · ACTIVE
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: 900,
              lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '20px',
            }}>
              Marine Oil Spill<br />
              <span style={{
                background: 'linear-gradient(135deg, #0EA5B7 0%, #17D4E8 50%, #0B7F97 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Intelligence</span><br />
              Platform
            </h1>

            <p style={{
              fontSize: '17px', lineHeight: 1.7, color: 'var(--ink-soft)',
              marginBottom: '36px', maxWidth: '480px',
            }}>
              Established physical models + AIS evidence + a stability-aware verification layer.
              Detect, reconstruct, and attribute marine oil spills from satellite SAR data.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/attribute" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, var(--teal), var(--teal-dim))',
                color: '#fff', padding: '14px 28px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 0 30px rgba(14,165,183,0.35)', transition: 'all 0.2s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Launch Attribution
              </Link>
              <Link href="/detect" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.05)', color: 'var(--ink)',
                padding: '14px 24px', borderRadius: '12px',
                fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                border: '1px solid var(--line)', transition: 'all 0.2s',
              }}>
                View SAR Detection
              </Link>
            </div>

            {/* Tech pills */}
            {/* <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '28px' }}>
              {['Python', 'NumPy', 'xarray', 'GeoPandas', 'Shapely', 'Lagrangian'].map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--mono)', fontSize: '10.5px', fontWeight: 500,
                  color: 'var(--ink-faint)', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--line)', padding: '4px 10px', borderRadius: '6px',
                }}>
                  {t}
                </span>
              ))}
            </div> */}
          </div>

          {/* Right radar */}
          <div style={{ flexShrink: 0 }}>
            <RadarOrb />
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          color: 'var(--ink-faint)', fontSize: '11px', fontFamily: 'var(--mono)',
          zIndex: 2, animation: 'float-up 1s ease 0.5s both',
        }}>
          Scroll to explore
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        background: 'var(--panel)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
        padding: '40px 48px',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px',
        }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '38px', fontWeight: 900, color: s.color, letterSpacing: '-0.03em', marginBottom: '6px' }}>
                {s.val}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section style={{ padding: '100px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '12px' }}>
            TECHNICAL APPROACH
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '14px' }}>
            Four-stage pipeline
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            Established physical models · AIS evidence · stability-aware verification layer
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
          {PIPELINE.map((step, i) => {
            const active = activeStep === i;
            return (
              <div key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  background: active ? 'linear-gradient(135deg, rgba(14,165,183,0.12), rgba(14,165,183,0.04))' : 'var(--panel)',
                  border: `1px solid ${active ? 'rgba(14,165,183,0.4)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)', padding: '24px',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: active ? '0 0 30px rgba(14,165,183,0.12)' : 'none',
                  transform: active ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: active ? 'var(--teal)' : 'var(--panel-2)',
                    color: active ? '#fff' : 'var(--ink-faint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '13px', fontFamily: 'var(--mono)',
                    transition: 'all 0.3s',
                  }}>{step.num}</div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>{step.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{step.sub}</div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: '0 48px 100px',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '12px' }}>
            PLATFORM MODULES
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Three integrated modules
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--panel)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius)', padding: '28px',
                height: '100%', transition: 'all 0.3s ease', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = f.color.replace('var(', '').replace(')', '');
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: f.color, opacity: 0.7 }} />

                <div style={{
                  width: '44px', height: '44px', borderRadius: '11px',
                  background: f.bg, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  {f.icon}
                </div>

                <div style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--ink-faint)', marginBottom: '8px', fontWeight: 500 }}>
                  {f.label}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '12px', color: 'var(--ink)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {f.desc}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {f.tags.map(t => (
                    <span key={t} style={{
                      fontSize: '11px', fontWeight: 600,
                      color: f.color, background: f.bg,
                      padding: '3px 9px', borderRadius: '6px',
                    }}>{t}</span>
                  ))}
                </div>

                <div style={{
                  marginTop: '22px', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 700, color: f.color,
                }}>
                  Open module
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section style={{
        margin: '0 48px 80px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(14,165,183,0.15) 0%, rgba(11,127,151,0.08) 100%)',
        border: '1px solid rgba(14,165,183,0.25)',
        padding: '64px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,183,0.12), transparent 70%)',
        }} />
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '16px' }}>
          READY TO INVESTIGATE
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '14px' }}>
          Start with the live attribution prototype
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Run an 8-scenario perturbation ensemble and see which vessel is the strongest attribution candidate — live.
        </p>
        <Link href="/attribute" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'linear-gradient(135deg, var(--teal), var(--teal-dim))',
          color: '#fff', padding: '16px 36px', borderRadius: '12px',
          fontSize: '15px', fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 0 40px rgba(14,165,183,0.4)', transition: 'all 0.2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Run Stability Test
        </Link>
      </section>

      <Footer />
    </>
  );
}
