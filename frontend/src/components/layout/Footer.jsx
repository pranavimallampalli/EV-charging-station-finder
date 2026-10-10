import { Link } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            <Zap size={16} color="var(--primary-700)" />
            <span>ChargeNear EV Finder</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            MERN stack prototype for EV charging station discovery across India.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.825rem' }}>
          <Link to="/welcome" style={{ color: 'var(--text-secondary)' }}>Welcome Guide</Link>
          <Link to="/vehicle-select" style={{ color: 'var(--text-secondary)' }}>Vehicle Settings</Link>
          <Link to="/location-permission" style={{ color: 'var(--text-secondary)' }}>Location Settings</Link>
          <Link to="/offline" style={{ color: 'var(--text-secondary)' }}>Emergency & Offline</Link>
        </div>
      </div>
    </footer>
  );
};
