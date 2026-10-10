import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Heart,
  ExternalLink,
  Zap,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { AvailabilityBadge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { getStationDistance, formatDistance } from '../utils/distance';

export const StationDetailPage = () => {
  const { id } = useParams();
  const { isStationSaved, toggleSaveStation, location } = useUser();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getStationById(id);
      if (response && response.success && response.data) {
        setStation(response.data);
      } else {
        setError('Station details could not be retrieved.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching station details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const saved = station ? isStationSaved(station._id) : false;
  const distanceKm = location?.coords ? getStationDistance(location.coords, station) : null;

  // Directions link to Google Maps
  const isPrimaryStation = station?.isPrimaryDemo || station?.name === 'ChargeNear Hub — Cyber Towers';
  const isSecondaryUnmapped = station?.name === 'ChargeNear Point — Financial District';

  let directionsUrl = null;
  if (isPrimaryStation) {
    // Verified real-world public destination: Cyber Towers, HITEC City, Hyderabad
    directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=17.4504,78.3808';
  } else if (!isSecondaryUnmapped) {
    const destinationCoord = station?.location?.coordinates?.length === 2
      ? `${station.location.coordinates[1]},${station.location.coordinates[0]}`
      : encodeURIComponent(`${station?.name || ''} ${station?.address?.city || ''}`);
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationCoord}`;
  }

  if (loading) {
    return (
      <div className="detail-container">
        <Link to="/home" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Stations
        </Link>
        <div className="ui-card" style={{ padding: '2rem' }}>
          <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: '120px', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="detail-container">
        <Link to="/home" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Stations
        </Link>
        <div className="state-box">
          <AlertTriangle className="state-icon" style={{ color: '#ef4444' }} />
          <h2 className="state-title">Station Not Found</h2>
          <p className="state-desc">{error || 'This station record is unavailable.'}</p>
          <button type="button" className="btn btn-primary" onClick={fetchDetail}>
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const priceText = station.pricing?.isFree
    ? 'Free'
    : station.pricing?.costPerKWh
    ? `₹${station.pricing.costPerKWh} / kWh`
    : 'Pricing unlisted';

  return (
    <div className="detail-container">
      {/* Top Back Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <Link to="/home" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Stations
        </Link>

        <button
          type="button"
          className={`btn ${saved ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => toggleSaveStation(station._id)}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved Station' : 'Save to Favorites'}
        </button>
      </div>

      {/* Main Header Card */}
      <div className="ui-card detail-header-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              {station.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <MapPin size={18} style={{ color: 'var(--primary-700)' }} />
              <span>
                {station.address?.street ? `${station.address.street}, ` : ''}
                {station.address?.city}
                {station.address?.state ? `, ${station.address.state}` : ''}
                {station.address?.postalCode ? ` - ${station.address.postalCode}` : ''}
              </span>
            </div>
            {station.address?.landmark && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginLeft: '1.5rem' }}>
                Landmark: {station.address.landmark}
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AvailabilityBadge
                status={station.availability?.status}
                isLiveVerified={station.availability?.isLiveVerified}
              />
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {priceText}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--neutral-border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <span>
              Coordinates: {station.location?.coordinates ? `${station.location.coordinates[1]}, ${station.location.coordinates[0]}` : 'N/A'}
            </span>
            {distanceKm !== null && (
              <span style={{ marginLeft: '0.75rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                • ~{formatDistance(distanceKm)}
              </span>
            )}
            {isPrimaryStation && (
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                Navigation destination: Cyber Towers, HITEC City
              </div>
            )}
          </div>

          {directionsUrl ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <ExternalLink size={15} /> Get Directions
            </a>
          ) : (
            <span
              className="btn btn-secondary btn-sm"
              style={{ opacity: 0.65, cursor: 'default' }}
            >
              Directions unmapped
            </span>
          )}
        </div>
      </div>

      {/* Grid of Connectors and Operator / Amenities */}
      <div className="detail-specs-grid">
        {/* Connectors Card */}
        <div className="ui-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="var(--primary-700)" /> Supported Connectors
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Illustrative hardware connector compatibility and power specifications.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {station.connectors?.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--neutral-subtle)',
                  border: '1px solid var(--neutral-border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Power: {c.powerKW ? `${c.powerKW} kW (Illustrative rating)` : 'Standard AC power'}
                  </div>
                </div>

                <div>
                  <span className="badge badge-connector">Standard Plug</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operator and Amenities Card */}
        <div className="ui-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Operator & Site Amenities
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Charge Point Operator
              </h3>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                {station.operator?.name || 'Independent Operator'}
              </p>
              {station.operator?.network && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Network: {station.operator.network}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Reported Site Amenities (Demo)
              </h3>
              {station.amenities && station.amenities.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {station.amenities.map((amenity, i) => (
                    <span key={i} className="badge badge-connector">
                      <CheckCircle size={12} style={{ color: 'var(--primary-600)' }} /> {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No amenities specified</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
