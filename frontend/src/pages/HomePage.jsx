import { useState, useEffect, useMemo } from 'react';
import { useStations } from '../context/StationContext';
import { useUser } from '../context/UserContext';
import { StationCard } from '../components/stations/StationCard';
import { StationFilters } from '../components/stations/StationFilters';
import { StationCardSkeleton } from '../components/stations/StationCardSkeleton';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { AlertCircle, RotateCcw, MapPin, Zap, Navigation, Globe, Database, Info } from 'lucide-react';
import { getStationDistance } from '../utils/distance';
import { api } from '../services/api';

export const HomePage = () => {
  const { stations, loading, error, fetchStations, resetFilters, filters } = useStations();
  const { vehicle, location } = useUser();

  // State for live Hyderabad discovery
  const [liveStations, setLiveStations] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [liveTab, setLiveTab] = useState('live'); // 'live' | 'demo'

  const isHyderabad = filters.city === 'Hyderabad';

  // Fetch live Hyderabad stations whenever user selects Hyderabad
  useEffect(() => {
    if (!isHyderabad) {
      setLiveError(null);
      return;
    }

    let isMounted = true;
    const loadLiveHyderabad = async () => {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const res = await api.getLiveHyderabadStations();
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLiveStations(res.data);
          setLiveTab('live');
        } else {
          setLiveStations([]);
          setLiveError(res?.message || 'Live Hyderabad stations are temporarily unavailable from the external data provider.');
          setLiveTab('demo');
        }
      } catch (err) {
        if (!isMounted) return;
        setLiveStations([]);
        setLiveError('Live Hyderabad stations are temporarily unavailable from the external data provider.');
        setLiveTab('demo');
      } finally {
        if (isMounted) setLiveLoading(false);
      }
    };

    loadLiveHyderabad();

    return () => {
      isMounted = false;
    };
  }, [isHyderabad]);

  const isGpsActive = Boolean(
    location?.granted &&
    location?.coords &&
    typeof location.coords.latitude === 'number' &&
    typeof location.coords.longitude === 'number' &&
    location.method === 'gps'
  );

  // Filter live stations by connector / search if user filtered them
  const activeLiveFiltered = useMemo(() => {
    if (!isHyderabad || liveTab !== 'live') return [];
    return liveStations.filter((st) => {
      if (filters.connector !== 'All') {
        const hasConn = st.connectors?.some((c) => c.type === filters.connector);
        if (!hasConn) return false;
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchName = st.name.toLowerCase().includes(q);
        const matchStreet = st.address?.street?.toLowerCase().includes(q);
        const matchOp = st.operator?.name?.toLowerCase().includes(q);
        if (!matchName && !matchStreet && !matchOp) return false;
      }
      return true;
    });
  }, [liveStations, isHyderabad, liveTab, filters.connector, filters.search]);

  // Determine active station list to display
  const rawList = isHyderabad && liveTab === 'live' && liveStations.length > 0
    ? activeLiveFiltered
    : stations;

  // If GPS coordinates are available, calculate straight-line distances and sort closest first
  const displayStations = useMemo(() => {
    if (!isGpsActive) {
      return rawList;
    }

    const withDistance = rawList.map((station) => {
      const distanceKm = getStationDistance(location.coords, station);
      return {
        ...station,
        distanceKm
      };
    });

    return withDistance.sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [rawList, isGpsActive, location?.coords]);

  return (
    <div>
      {/* Header Info */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Find EV Charging Stations
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Search charging stations by location, connector compatibility, and operational status.
            </p>
          </div>

          {vehicle?.isConfigured && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-800)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <Zap size={14} /> Preset: {vehicle.make} {vehicle.model} ({vehicle.connector})
            </div>
          )}
        </div>
      </div>

      {/* Interactive Search & Filters */}
      <StationFilters />

      {/* Hyderabad Live Discovery Header & Tabs */}
      {isHyderabad && liveLoading && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Globe size={15} className="spinner" /> Searching OpenStreetMap for Hyderabad charging stations...
        </div>
      )}

      {isHyderabad && liveStations.length > 0 && !liveLoading && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`chip ${liveTab === 'live' ? 'active' : ''}`}
            onClick={() => setLiveTab('live')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Globe size={14} /> OpenStreetMap Locations ({liveStations.length})
          </button>
          <button
            type="button"
            className={`chip ${liveTab === 'demo' ? 'active' : ''}`}
            onClick={() => setLiveTab('demo')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Database size={14} /> Local Station Records ({stations.length})
          </button>
        </div>
      )}

      {isHyderabad && liveTab === 'live' && liveStations.length > 0 && !liveLoading && (
        <div
          style={{
            padding: '0.65rem 0.9rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.825rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Info size={16} style={{ flexShrink: 0, color: '#15803d' }} />
          <span>
            <strong>OpenStreetMap Locations:</strong> Retrieved from open community geospatial data. <em>Note: Live charger occupancy is unmonitored by this feed.</em>
          </span>
        </div>
      )}

      {isHyderabad && liveError && (
        <div
          style={{
            padding: '0.65rem 0.9rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.825rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, color: '#d97706' }} />
          <span>
            <strong>Notice:</strong> Live OpenStreetMap discovery is temporarily unavailable. Showing local station records below.
          </span>
        </div>
      )}

      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: isGpsActive ? '0.35rem' : '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span>
          {!loading && (
            <>
              Found <strong style={{ color: 'var(--text-main)' }}>{displayStations.length}</strong>{' '}
              charging station{displayStations.length === 1 ? '' : 's'}
              {filters.city !== 'All' ? ` in ${filters.city}` : ''}
              {filters.connector !== 'All' ? ` with ${filters.connector}` : ''}
            </>
          )}
        </span>

        {isGpsActive && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              color: 'var(--primary-700)',
              backgroundColor: 'var(--primary-50)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--primary-100)'
            }}
            title="Straight-line distance calculation"
          >
            <Navigation size={12} />
            <span>Sorted by distance</span>
          </span>
        )}
      </div>

      {isGpsActive && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          * Distances are approximate straight-line calculations.
        </p>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid-stations">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* API / Database Error State */}
      {!loading && error && (
        <div className="state-box">
          <AlertCircle className="state-icon" style={{ color: '#ef4444' }} />
          <h3 className="state-title">Unable to Connect to Backend Service</h3>
          <p className="state-desc">{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fetchStations()}
          >
            <RotateCcw size={16} /> Retry Connection
          </button>
        </div>
      )}

      {/* Empty Search / Filters Results State */}
      {!loading && !error && displayStations.length === 0 && (
        <div className="state-box">
          <MapPin className="state-icon" />
          <h3 className="state-title">No Charging Stations Found</h3>
          <p className="state-desc">
            No stations match your current search query or filter selection. Try clearing filters or searching for another city.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              resetFilters();
              fetchStations({ search: '', city: 'All', connector: 'All', status: 'All' });
            }}
          >
            <RotateCcw size={16} /> Reset All Filters
          </button>
        </div>
      )}

      {/* Stations Card Grid */}
      {!loading && !error && displayStations.length > 0 && (
        <div className="grid-stations">
          {displayStations.map((station) => (
            <StationCard key={station._id} station={station} />
          ))}
        </div>
      )}
    </div>
  );
};
