/**
 * Haversine Distance Calculation Utilities
 * Calculates approximate straight-line distance between two geographic coordinates.
 * Distances are straight-line approximations and not turn-by-turn driving routes.
 */

/**
 * Calculates the great-circle distance between two points on Earth in kilometers.
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number|null} Distance in kilometers rounded to 1 decimal place, or null if invalid.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }

  // Latitude must be within [-90, 90], Longitude within [-180, 180]
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 || lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
    return null;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};

/**
 * Calculates straight-line distance between user coords and station GeoJSON coordinates.
 * GeoJSON stores coordinates as [longitude, latitude].
 * @param {{ latitude: number, longitude: number }} userCoords
 * @param {{ location?: { coordinates?: [number, number] } }} station
 * @returns {number|null}
 */
export const getStationDistance = (userCoords, station) => {
  if (!userCoords || typeof userCoords.latitude !== 'number' || typeof userCoords.longitude !== 'number') {
    return null;
  }

  const coords = station?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) {
    return null;
  }

  const [stationLng, stationLat] = coords;
  return calculateDistance(userCoords.latitude, userCoords.longitude, stationLat, stationLng);
};

/**
 * Formats a distance in kilometers to a compact user-facing label.
 * @param {number|null} distanceKm
 * @returns {string|null}
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) {
    return null;
  }
  return `${distanceKm} km away`;
};
