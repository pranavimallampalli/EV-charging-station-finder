import { Link } from 'react-router-dom';
import { MapPin, Heart, Zap, ArrowRight, Navigation } from 'lucide-react';
import { AvailabilityBadge, ConnectorBadge } from '../common/Badge';
import { useUser } from '../../context/UserContext';
import { formatDistance } from '../../utils/distance';

export const StationCard = ({ station }) => {
  const { isStationSaved, toggleSaveStation } = useUser();
  const saved = isStationSaved(station._id);

  const priceFormatted = station.isLiveExternal
    ? 'Pricing on-site'
    : station.pricing?.isFree
    ? 'Free'
    : station.pricing?.costPerKWh
    ? `₹${station.pricing.costPerKWh}/kWh`
    : 'Pricing unlisted';

  return (
    <article className="ui-card station-card">
      <div>
        <header className="station-card-header">
          <div>
            <h3 className="station-title">{station.name}</h3>
            {station.operator?.name && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {station.operator.name}
              </span>
            )}
          </div>
          <button
            type="button"
            className={`btn-bookmark ${saved ? 'saved' : ''}`}
            onClick={() => toggleSaveStation(station._id)}
            title={saved ? 'Remove from saved' : 'Save station'}
            aria-label={saved ? 'Remove from saved' : 'Save station'}
          >
            <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </header>

        {/* Distance Indicator if GPS is active */}
        {station.distanceKm !== undefined && station.distanceKm !== null && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              color: 'var(--primary-700)',
              fontWeight: 600,
              backgroundColor: 'var(--primary-50)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-pill)',
              marginBottom: '0.65rem',
              border: '1px solid var(--primary-100)'
            }}
            title="Estimated straight-line distance"
          >
            <Navigation size={12} />
            <span>{formatDistance(station.distanceKm)}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>(straight-line)</span>
          </div>
        )}

        <div className="station-address">
          <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-600)' }} />
          <span>
            {station.address?.street
              ? `${station.address.street}, ${station.address.city}`
              : station.address?.city || 'Address unlisted'}
          </span>
        </div>

        <div className="station-connectors">
          {station.connectors?.map((conn, idx) => (
            <ConnectorBadge key={idx} type={conn.type} powerKW={conn.powerKW} />
          ))}
        </div>
      </div>

      <footer>
        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <AvailabilityBadge
            status={
              station.isLiveExternal && !station.liveAvailabilitySupported
                ? 'Unmonitored'
                : station.availability?.status
            }
            isLiveVerified={station.availability?.isLiveVerified}
          />
          <span className="station-price">{priceFormatted}</span>
        </div>

        <div className="station-meta-row">
          {station.isLiveExternal ? (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--primary-800)',
                fontWeight: 600,
                backgroundColor: 'var(--primary-50)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--primary-200)'
              }}
              title="Real public charging station location retrieved from OpenStreetMap"
            >
              OpenStreetMap
            </span>
          ) : station.isPrimaryDemo ? (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--primary-800)',
                fontWeight: 600,
                backgroundColor: 'var(--primary-50)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--primary-200)'
              }}
              title="Validated navigation destination"
            >
              Verified Destination
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Standard Listing
            </span>
          )}
          <Link
            to={`/station/${station._id}`}
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 600 }}
          >
            Details <ArrowRight size={14} />
          </Link>
        </div>
      </footer>
    </article>
  );
};
