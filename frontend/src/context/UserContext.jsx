import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

const DEFAULT_VEHICLE = {
  make: 'Tata Motors',
  model: 'Nexon EV',
  connector: 'CCS2',
  isConfigured: false
};

const DEFAULT_LOCATION = {
  granted: false,
  coords: null,
  city: 'Bengaluru',
  method: 'default', // 'gps' | 'manual' | 'default'
  error: null
};

export const UserProvider = ({ children }) => {
  // 1. Vehicle Selection State (persisted in localStorage)
  const [vehicle, setVehicleState] = useState(() => {
    try {
      const stored = localStorage.getItem('chargenear_vehicle');
      return stored ? JSON.parse(stored) : DEFAULT_VEHICLE;
    } catch {
      return DEFAULT_VEHICLE;
    }
  });

  const setVehicle = (newVehicle) => {
    const updated = { ...newVehicle, isConfigured: true };
    setVehicleState(updated);
    try {
      localStorage.setItem('chargenear_vehicle', JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to persist vehicle to localStorage', e);
    }
  };

  // 2. Saved Stations State (persisted in localStorage)
  const [savedStationIds, setSavedStationIds] = useState(() => {
    try {
      const stored = localStorage.getItem('chargenear_saved_stations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveStation = (stationId) => {
    if (!stationId) return;
    setSavedStationIds((prev) => {
      const exists = prev.includes(stationId);
      const next = exists ? prev.filter((id) => id !== stationId) : [...prev, stationId];
      try {
        localStorage.setItem('chargenear_saved_stations', JSON.stringify(next));
      } catch (e) {
        console.warn('Unable to persist saved stations to localStorage', e);
      }
      return next;
    });
  };

  const isStationSaved = (stationId) => {
    return savedStationIds.includes(stationId);
  };

  // 3. Location Permission & Preference State
  const [location, setLocation] = useState(() => {
    try {
      const stored = localStorage.getItem('chargenear_location');
      return stored ? JSON.parse(stored) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const saveLocationState = (loc) => {
    setLocation(loc);
    try {
      localStorage.setItem('chargenear_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('Unable to persist location to localStorage', e);
    }
  };

  const requestBrowserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errState = {
          ...location,
          granted: false,
          error: 'Geolocation is not supported by this browser.'
        };
        saveLocationState(errState);
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locState = {
            granted: true,
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            },
            city: location.city || 'Bengaluru',
            method: 'gps',
            error: null
          };
          saveLocationState(locState);
          resolve(locState);
        },
        (err) => {
          let message = 'Location permission was denied or unavailable.';
          if (err.code === 1) message = 'Location permission was denied by user.';
          if (err.code === 2) message = 'Position is unavailable from device.';
          if (err.code === 3) message = 'Location request timed out.';

          const errState = {
            ...location,
            granted: false,
            method: 'manual',
            error: message
          };
          saveLocationState(errState);
          reject(new Error(message));
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    });
  };

  const setManualCity = (cityName) => {
    const locState = {
      ...location,
      city: cityName,
      method: 'manual',
      error: null
    };
    saveLocationState(locState);
  };

  // 4. Online/Offline Network Status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        vehicle,
        setVehicle,
        savedStationIds,
        toggleSaveStation,
        isStationSaved,
        location,
        requestBrowserLocation,
        setManualCity,
        isOnline
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
