import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Car, MapPin, Heart, Database, Trash2, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useStations } from '../context/StationContext';

export const ProfilePage = () => {
  const { vehicle, savedStationIds, location } = useUser();
  const { backendHealth } = useStations();

  const [clearedMessage, setClearedMessage] = useState(false);

  const handleClearLocalData = () => {
    if (window.confirm('Reset all locally stored vehicle preferences and saved stations?')) {
      localStorage.removeItem('chargenear_vehicle');
      localStorage.removeItem('chargenear_saved_stations');
      localStorage.removeItem('chargenear_location');
      localStorage.removeItem('chargenear_cached_stations');
      setClearedMessage(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="selection-container" style={{ maxWidth: '680px' }}>
      <header style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          Preferences & Session Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your saved EV configurations, search defaults, and local browser data.
        </p>
      </header>

      {/* Guest Session Honest Notice */}
      <div className="notice-banner" style={{ marginBottom: '1.5rem' }}>
        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Local Guest Session:</strong> ChargeNear currently stores your vehicle settings, location preferences, and bookmarks locally in your browser. User authentication accounts are scheduled for Phase 5.
        </span>
      </div>

      {/* Vehicle Preference Card */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={18} color="var(--primary-700)" /> EV Profile
          </h2>
          <Link to="/vehicle-select" className="btn btn-secondary btn-sm">
            Change Vehicle
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Configured Vehicle</span>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              {vehicle?.make ? `${vehicle.make} ${vehicle.model}` : 'Tata Nexon EV (Default)'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Connector Preference</span>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              <span className="badge badge-connector">{vehicle?.connector || 'CCS2'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Preference Card */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--primary-700)" /> Location Settings
          </h2>
          <Link to="/location-permission" className="btn btn-secondary btn-sm">
            Change City / GPS
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Default Search City</span>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              {location?.city || 'Bengaluru'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>GPS Permission</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {location?.granted ? 'Granted (GPS)' : 'Manual Selection'}
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks Summary Card */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={18} color="var(--primary-700)" /> Saved Stations
          </h2>
          <Link to="/saved" className="btn btn-secondary btn-sm">
            View All Saved
          </Link>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          You currently have <strong>{savedStationIds.length}</strong> station{savedStationIds.length === 1 ? '' : 's'} saved to your local browser collection.
        </p>
      </div>

      {/* Backend & Database Status */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="var(--primary-700)" /> Backend Connectivity
        </h2>

        <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Express Server:</span>
            <span style={{ fontWeight: 600, color: backendHealth.online ? 'var(--status-avail-text)' : '#ef4444' }}>
              {backendHealth.online ? 'Online (localhost:5000)' : 'Offline'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>MongoDB Atlas:</span>
            <span style={{ fontWeight: 600, color: backendHealth.databaseConnected ? 'var(--status-avail-text)' : '#ef4444' }}>
              {backendHealth.databaseConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Reset Local Storage */}
      <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleClearLocalData}
          style={{ color: '#ef4444', borderColor: '#fecaca' }}
        >
          <Trash2 size={15} /> Reset All Local Preferences & Bookmarks
        </button>
        {clearedMessage && (
          <p style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.5rem' }}>
            Local data reset! Refreshing session...
          </p>
        )}
      </div>
    </div>
  );
};
