import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useStations } from '../context/StationContext';

const AVAILABLE_CITIES = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];

export const LocationPermPage = () => {
  const navigate = useNavigate();
  const { location, requestBrowserLocation, setManualCity } = useUser();
  const { updateFilter, fetchStations } = useStations();

  const [loadingGps, setLoadingGps] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedCity, setSelectedCity] = useState(location.city || 'Bengaluru');

  const handleEnableLocation = async () => {
    setLoadingGps(true);
    setStatusMessage(null);

    try {
      const res = await requestBrowserLocation();
      setStatusMessage({
        type: 'success',
        text: `Location enabled! Coordinates: [${res.coords.latitude.toFixed(4)}, ${res.coords.longitude.toFixed(4)}]`
      });
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to access geolocation. Please select your city manually below.'
      });
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSaveManualCity = () => {
    setManualCity(selectedCity);
    updateFilter('city', selectedCity);
    fetchStations({ city: selectedCity });
    navigate('/home');
  };

  return (
    <div className="selection-container" style={{ maxWidth: '640px' }}>
      <header className="selection-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}
        >
          <MapPin size={28} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Location Access & City Preference
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
          Enable location to quickly discover EV charging stations in your vicinity, or pick a city manually.
        </p>
      </header>

      {/* Geolocation Request Card */}
      <div className="ui-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Device Geolocation
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          ChargeNear requests your browser location only with your consent. Your coordinates remain on your device.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleEnableLocation}
          disabled={loadingGps}
          style={{ width: '100%' }}
        >
          <Navigation size={18} />
          {loadingGps ? 'Requesting GPS Location...' : 'Enable Location Access'}
        </button>

        {statusMessage && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: statusMessage.type === 'success' ? 'var(--status-avail-bg)' : '#fef2f2',
              color: statusMessage.type === 'success' ? 'var(--status-avail-text)' : '#991b1b',
              border: `1px solid ${statusMessage.type === 'success' ? 'var(--status-avail-border)' : '#fca5a5'}`
            }}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Manual City Fallback Card */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Manual City Selection (Fallback)
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Choose a metropolitan city to browse stations without sharing GPS location.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {AVAILABLE_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${selectedCity === c ? 'active' : ''}`}
              onClick={() => setSelectedCity(c)}
              style={{ padding: '0.5rem 1rem' }}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSaveManualCity}
          style={{ width: '100%' }}
        >
          Browse Stations in {selectedCity} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
