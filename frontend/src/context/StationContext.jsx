import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useUser } from './UserContext';

const StationContext = createContext(null);

const DEFAULT_FILTERS = {
  search: '',
  city: 'All',
  connector: 'All',
  status: 'All'
};

export const StationProvider = ({ children }) => {
  const { location } = useUser();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState({
    checked: false,
    online: false,
    databaseConnected: false
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Cached stations for offline resilience
  const [cachedStations, setCachedStations] = useState(() => {
    try {
      const stored = localStorage.getItem('chargenear_cached_stations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const checkHealth = useCallback(async () => {
    const health = await api.getHealth();
    setBackendHealth({
      checked: true,
      online: health.success || false,
      databaseConnected: health.database?.connected || false,
      message: health.message || health.error
    });
    return health;
  }, []);

  const fetchStations = useCallback(async (customFilters = null) => {
    setLoading(true);
    setError(null);

    const activeFilters = customFilters || filters;

    try {
      const response = await api.getStations({
        search: activeFilters.search,
        city: activeFilters.city,
        connector: activeFilters.connector,
        status: activeFilters.status
      });

      if (response && response.success && Array.isArray(response.data)) {
        setStations(response.data);

        // Update offline cache with fresh records
        if (response.data.length > 0) {
          setCachedStations(response.data);
          try {
            localStorage.setItem(
              'chargenear_cached_stations',
              JSON.stringify(response.data)
            );
            localStorage.setItem(
              'chargenear_cache_timestamp',
              new Date().toISOString()
            );
          } catch (e) {
            console.warn('Unable to cache stations locally', e);
          }
        }
      } else {
        setStations([]);
      }
    } catch (err) {
      console.error('Failed to fetch stations:', err);
      setError(err.message || 'Unable to load charging stations from backend.');

      // If offline/server down, fallback to cached stations if available
      try {
        const stored = localStorage.getItem('chargenear_cached_stations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStations(parsed);
          }
        }
      } catch {
        // ignore cache read failure
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load: check health & fetch stations
  useEffect(() => {
    checkHealth();
    fetchStations();
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <StationContext.Provider
      value={{
        stations,
        loading,
        error,
        filters,
        updateFilter,
        resetFilters,
        fetchStations,
        backendHealth,
        checkHealth,
        cachedStations
      }}
    >
      {children}
    </StationContext.Provider>
  );
};

export const useStations = () => {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStations must be used within a StationProvider');
  }
  return context;
};
