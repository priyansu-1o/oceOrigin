'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/detect', label: 'SAR Detection' },
  { href: '/transport', label: 'Lagrangian Transport' },
  { href: '/attribute', label: 'Source Attribution' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(8,14,24,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 32px',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
          {/* Satellite + globe icon — matches the OceOrigin brand mark */}
          <svg width="54" height="46" viewBox="0 0 114 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Globe */}
            <circle cx="57" cy="60" r="32" stroke="rgba(160,185,210,0.65)" strokeWidth="2.5"/>
            {/* Latitude lines */}
            <ellipse cx="57" cy="60" rx="32" ry="15" stroke="rgba(160,185,210,0.45)" strokeWidth="1.6"/>
            <ellipse cx="57" cy="72" rx="24" ry="10" stroke="rgba(160,185,210,0.3)" strokeWidth="1.2"/>
            <ellipse cx="57" cy="48" rx="24" ry="10" stroke="rgba(160,185,210,0.3)" strokeWidth="1.2"/>
            {/* Longitude lines */}
            <line x1="57" y1="28" x2="57" y2="92" stroke="rgba(160,185,210,0.48)" strokeWidth="1.6"/>
            <line x1="33" y1="35" x2="33" y2="85" stroke="rgba(160,185,210,0.28)" strokeWidth="1.2"/>
            <line x1="81" y1="35" x2="81" y2="85" stroke="rgba(160,185,210,0.28)" strokeWidth="1.2"/>
            {/* Equator */}
            <line x1="25" y1="60" x2="89" y2="60" stroke="rgba(160,185,210,0.48)" strokeWidth="1.6"/>

            {/* Left solar panel */}
            <rect x="3" y="53" width="41" height="15" rx="1" stroke="rgba(210,225,240,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.05)"/>
            <line x1="17" y1="53" x2="17" y2="68" stroke="rgba(210,225,240,0.55)" strokeWidth="1.3"/>
            <line x1="31" y1="53" x2="31" y2="68" stroke="rgba(210,225,240,0.55)" strokeWidth="1.3"/>
            <line x1="3"  y1="60" x2="44" y2="60" stroke="rgba(210,225,240,0.55)" strokeWidth="1.3"/>

            {/* Right solar panel */}
            <rect x="70" y="53" width="41" height="15" rx="1" stroke="rgba(210,225,240,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.05)"/>
            <line x1="84"  y1="53" x2="84"  y2="68" stroke="rgba(210,225,240,0.55)" strokeWidth="1.3"/>
            <line x1="98"  y1="53" x2="98"  y2="68" stroke="rgba(210,225,240,0.55)" strokeWidth="1.3"/>
            <line x1="70"  y1="60" x2="111" y2="60" stroke="rgba(210,225,240,0.55)" strokeWidth="1.3"/>

            {/* Satellite body */}
            <rect x="47" y="47" width="20" height="26" rx="1" fill="rgba(15,26,40,0.98)" stroke="rgba(210,225,240,0.85)" strokeWidth="2.2"/>
            {/* Body vertical divisions */}
            <line x1="52" y1="47" x2="52" y2="73" stroke="rgba(200,215,230,0.5)" strokeWidth="1.2"/>
            <line x1="57" y1="47" x2="57" y2="73" stroke="rgba(200,215,230,0.5)" strokeWidth="1.2"/>
            <line x1="62" y1="47" x2="62" y2="73" stroke="rgba(200,215,230,0.5)" strokeWidth="1.2"/>

            {/* Antenna pole */}
            <line x1="57" y1="47" x2="57" y2="35" stroke="rgba(215,230,245,0.95)" strokeWidth="2" strokeLinecap="round"/>
            {/* Dish */}
            <circle cx="57" cy="33" r="5" fill="rgba(215,230,245,1)"/>

            {/* Signal waves — teal */}
            <path d="M51 27 Q57 20 63 27"  fill="none" stroke="#0EA5B7" strokeWidth="2.6" strokeLinecap="round"/>
            <path d="M47 21 Q57 12 67 21"  fill="none" stroke="#0EA5B7" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M43 15 Q57  4 71 15"  fill="none" stroke="#0EA5B7" strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
            <path d="M40  9 Q57 -3 74  9"  fill="none" stroke="#0EA5B7" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
          </svg>

          <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            OCE<span style={{ color: 'var(--teal)' }}>ORIGIN</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="nav-desktop">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                padding: '7px 14px', borderRadius: '8px',
                fontSize: '13.5px', fontWeight: 600,
                color: active ? 'var(--teal)' : 'var(--ink-soft)',
                background: active ? 'var(--teal-soft)' : 'transparent',
                border: active ? '1px solid rgba(14,165,183,0.25)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!active) { e.target.style.color = 'var(--ink)'; e.target.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!active) { e.target.style.color = 'var(--ink-soft)'; e.target.style.background = 'transparent'; } }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--teal)',
            background: 'var(--teal-soft)', border: '1px solid rgba(14,165,183,0.3)',
            padding: '4px 10px', borderRadius: '20px', fontWeight: 600,
          }}>
            PROTOTYPE
          </span>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: '4px' }}
            className="nav-hamburger"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" /></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 999,
          background: 'rgba(8,14,24,0.97)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--line)', padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px', borderRadius: '10px',
                fontSize: '15px', fontWeight: 600,
                color: pathname === href ? 'var(--teal)' : 'var(--ink-soft)',
                background: pathname === href ? 'var(--teal-soft)' : 'transparent',
                textDecoration: 'none', display: 'block',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
