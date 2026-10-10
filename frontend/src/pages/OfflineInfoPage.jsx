import { useState } from 'react';
import { Wifi, WifiOff, PhoneCall, AlertTriangle, RefreshCw, BatteryLow, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useStations } from '../context/StationContext';
import { StationCard } from '../components/stations/StationCard';

const EMERGENCY_CONTACTS = [
  { name: 'National Highways Emergency Helpline', number: '1033', desc: 'Toll-free 24/7 highway breakdown & towing' },
  { name: 'All-India National Emergency Services', number: '112', desc: 'Police, fire, and medical emergency assistance' },
  { name: 'Tata Motors EV Roadside Assistance (RSA)', number: '1800 209 8282', desc: 'Official helpline for Nexon / Punch EV drivers' },
  { name: 'Mahindra Electric RSA', number: '1800 209 6006', desc: '24/7 roadside breakdown assistance for XUV400' },
  { name: 'Ather Energy Grid Helpline', number: '1800 120 7474', desc: 'Two-wheeler charging grid support' }
];

export const OfflineInfoPage = () => {
  const { isOnline } = useUser();
  const { checkHealth, cachedStations } = useStations();

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const health = await checkHealth();
      if (health.success && health.database?.connected) {
        setTestResult({
          type: 'success',
          text: 'Connection restored! Backend API and MongoDB Atlas are operational.'
        });
      } else if (health.success) {
        setTestResult({
          type: 'warning',
          text: 'Backend reachable, but MongoDB database is disconnected.'
        });
      } else {
        setTestResult({
          type: 'error',
          text: 'Unable to reach backend service at http://localhost:5000'
        });
      }
    } catch {
      setTestResult({
        type: 'error',
        text: 'Network request failed. Ensure your connection and backend server are active.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const cacheTimestamp = (() => {
    try {
      const t = localStorage.getItem('chargenear_cache_timestamp');
      return t ? new Date(t).toLocaleString('en-IN') : null;
    } catch {
      return null;
    }
  })();

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          Offline Support & Emergency Guidance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Essential protocols, emergency roadside helpline numbers, and cached station records for low-connectivity zones.
        </p>
      </header>

      {/* Network Status Card */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: isOnline ? 'var(--status-avail-bg)' : '#fee2e2',
                color: isOnline ? 'var(--status-avail-text)' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isOnline ? <Wifi size={22} /> : <WifiOff size={22} />}
            </div>

            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {isOnline ? 'Device is Online' : 'Device is Offline'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isOnline
                  ? 'Your browser detects an active internet connection.'
                  : 'No internet connection detected. Offline guidance and cached records are active.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleTestConnection}
            disabled={testingConnection}
          >
            <RefreshCw size={14} className={testingConnection ? 'spin' : ''} />
            {testingConnection ? 'Testing...' : 'Test Backend Connection'}
          </button>
        </div>

        {testResult && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              backgroundColor:
                testResult.type === 'success'
                  ? 'var(--status-avail-bg)'
                  : testResult.type === 'warning'
                  ? 'var(--status-inuse-bg)'
                  : '#fef2f2',
              color:
                testResult.type === 'success'
                  ? 'var(--status-avail-text)'
                  : testResult.type === 'warning'
                  ? 'var(--status-inuse-text)'
                  : '#991b1b',
              border: `1px solid ${
                testResult.type === 'success'
                  ? 'var(--status-avail-border)'
                  : testResult.type === 'warning'
                  ? 'var(--status-inuse-border)'
                  : '#fca5a5'
              }`
            }}
          >
            {testResult.text}
          </div>
        )}
      </div>

      {/* Emergency Roadside Helplines */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PhoneCall size={18} color="var(--primary-700)" /> Emergency EV Breakdown Helplines (India)
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          In case of unexpected battery depletion or vehicle immobilization, reach out to these numbers directly.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {EMERGENCY_CONTACTS.map((c, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--neutral-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--neutral-border-subtle)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.desc}</div>
              </div>
              <a
                href={`tel:${c.number.replace(/\s+/g, '')}`}
                className="btn btn-outline btn-sm"
                style={{ fontWeight: 700 }}
              >
                Call {c.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Low Battery Protocol Tips */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BatteryLow size={18} color="#b45309" /> Low Battery Range Conservation Tips
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border-subtle)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>1. Deactivate Climate Control</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Air conditioning accounts for 15-25% of energy drain. Rolling windows down slightly or using fan only extends range by 10-15 km.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border-subtle)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>2. Drive in Eco Mode (45-55 km/h)</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Aerodynamic drag increases quadratically above 60 km/h. Maintain smooth throttle inputs and utilize regenerative braking on descents.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--neutral-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border-subtle)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>3. Emergency 15A Socket Access</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Most highway petrol bunks and restaurants possess 15A industrial 3-pin AC sockets. Your OEM portable EVSE charger can provide emergency 2.8kW top-ups.
            </p>
          </div>
        </div>
      </div>

      {/* Cached Stations Reference */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Locally Cached Charging Stations
          </h2>
          {cacheTimestamp && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cached: {cacheTimestamp}
            </span>
          )}
        </div>

        <div className="notice-banner" style={{ marginBottom: '1.25rem' }}>
          <span>
            <strong>Offline Catalog Notice:</strong> These stations were stored in your browser during your last active session. Availability statuses and specifications may be outdated until connection is restored.
          </span>
        </div>

        {cachedStations && cachedStations.length > 0 ? (
          <div className="grid-stations">
            {cachedStations.map((station) => (
              <StationCard key={station._id} station={station} />
            ))}
          </div>
        ) : (
          <div className="state-box">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No station records have been cached yet. Once the app loads stations while online, they are saved here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
