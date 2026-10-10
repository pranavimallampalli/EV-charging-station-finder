import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Zap, BookmarkX } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useStations } from '../context/StationContext';
import { StationCard } from '../components/stations/StationCard';

export const SavedStationsPage = () => {
  const { savedStationIds } = useUser();
  const { stations, loading } = useStations();

  // Filter stations present in savedStationIds
  const savedStations = stations.filter((s) => savedStationIds.includes(s._id));

  // Determine if there are saved IDs for stations that might no longer exist in DB
  const missingCount = savedStationIds.length - savedStations.length;

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          Saved Charging Stations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your bookmarked charging locations, saved locally in your browser for quick access.
        </p>
      </header>

      {missingCount > 0 && (
        <div className="notice-banner" style={{ marginBottom: '1.5rem' }}>
          <span>
            Note: {missingCount} saved station{missingCount > 1 ? 's' : ''} could not be found in the current database catalog.
          </span>
        </div>
      )}

      {savedStations.length === 0 ? (
        <div className="state-box" style={{ padding: '4rem 1.5rem' }}>
          <Heart className="state-icon" style={{ color: 'var(--text-muted)' }} />
          <h2 className="state-title">No Saved Stations Yet</h2>
          <p className="state-desc">
            You haven't bookmarked any charging stations. While browsing stations on the home screen, tap the heart icon on any card to save it here.
          </p>
          <Link to="/home" className="btn btn-primary">
            <Zap size={16} /> Browse Charging Stations
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{savedStations.length}</strong> saved station{savedStations.length > 1 ? 's' : ''}
          </div>

          <div className="grid-stations">
            {savedStations.map((station) => (
              <StationCard key={station._id} station={station} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
