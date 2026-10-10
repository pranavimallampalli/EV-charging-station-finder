import { Link, useLocation } from 'react-router-dom';
import { Zap, MapPin, Heart, Car, User, WifiOff } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useStations } from '../../context/StationContext';

export const Navbar = () => {
  const location = useLocation();
  const { location: userLoc, savedStationIds } = useUser();
  const { backendHealth } = useStations();

  const isConnected = backendHealth.online && backendHealth.databaseConnected;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/home" className="brand-link">
          <div className="brand-icon-wrapper">
            <Zap size={22} fill="currentColor" />
          </div>
          <span>ChargeNear</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links-desktop">
          <Link
            to="/home"
            className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}
          >
            Find Stations
          </Link>
          <Link
            to="/saved"
            className={`nav-item ${location.pathname === '/saved' ? 'active' : ''}`}
          >
            <Heart size={16} /> Saved
            {savedStationIds.length > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--primary-800)',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '1px 6px',
                  fontSize: '0.72rem'
                }}
              >
                {savedStationIds.length}
              </span>
            )}
          </Link>
          <Link
            to="/vehicle-select"
            className={`nav-item ${location.pathname === '/vehicle-select' ? 'active' : ''}`}
          >
            <Car size={16} /> My Vehicle
          </Link>
          <Link
            to="/profile"
            className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <User size={16} /> Preferences
          </Link>
          <Link
            to="/offline"
            className={`nav-item ${location.pathname === '/offline' ? 'active' : ''}`}
          >
            <WifiOff size={16} /> Offline Help
          </Link>
        </nav>

        {/* Active City & System Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            to="/location-permission"
            className="nav-status-badge"
            title="Click to change location or city"
          >
            <MapPin size={14} style={{ color: 'var(--primary-700)' }} />
            <span>{userLoc.city || 'Bengaluru'}</span>
          </Link>

          <div
            className="nav-status-badge"
            title={
              isConnected
                ? 'Backend API and MongoDB Atlas connected'
                : 'Backend API or database disconnected'
            }
          >
            <span
              className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
            />
            <span style={{ fontSize: '0.75rem' }}>
              {isConnected ? 'Live DB' : 'Offline DB'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
