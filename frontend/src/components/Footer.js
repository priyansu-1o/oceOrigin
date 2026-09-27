'use client';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s} UTC`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <footer style={{
      height: '36px',
      borderTop: '1px solid var(--line)',
      background: 'var(--navy)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-faint)',
        paddingRight: '12px', borderRight: '1px solid var(--line)', marginRight: '12px',
      }}>
        OCE<span style={{ color: 'var(--teal)' }}>ORIGIN</span>
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-faint)' }}>
        MAD-PALs · Smart India Hackathon 2026
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)', display: 'block' }}/>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-faint)' }}>
          {time || '--:--:-- UTC'}
        </span>
      </div>
    </footer>
  );
}
