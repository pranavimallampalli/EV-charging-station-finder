/**
 * ChargeNear Frontend API Service
 * Integrates with the Express REST API backend.
 */

// Prefer environment variable, fallback to relative /api (handled by Vite dev proxy)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Normalizes API error messages into user-friendly strings
 */
const handleApiError = async (response) => {
  try {
    const errorData = await response.json();
    return new Error(errorData.error || errorData.message || `Server returned ${response.status}`);
  } catch {
    return new Error(`Network response error: ${response.status} ${response.statusText}`);
  }
};

export const api = {
  /**
   * Health check endpoint
   */
  async getHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw await handleApiError(response);
      }
      return await response.json();
    } catch (err) {
      return {
        success: false,
        error: err.message,
        database: { status: 'disconnected', connected: false }
      };
    }
  },

  /**
   * List charging stations with optional search and filters
   * Query params supported by backend: search, connector, status, city, limit, page
   */
  async getStations(params = {}) {
    const query = new URLSearchParams();

    if (params.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    if (params.connector && params.connector !== 'All') {
      query.set('connector', params.connector);
    }
    if (params.status && params.status !== 'All') {
      query.set('status', params.status);
    }
    if (params.city && params.city !== 'All') {
      query.set('city', params.city);
    }
    if (params.limit) {
      query.set('limit', params.limit);
    }
    if (params.page) {
      query.set('page', params.page);
    }

    const queryString = query.toString();
    const url = `${API_BASE}/stations${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return await response.json();
  },

  /**
   * Retrieve single charging station by ObjectId
   */
  async getStationById(id) {
    if (!id) {
      throw new Error('Station ID is required');
    }

    const response = await fetch(`${API_BASE}/stations/${id}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return await response.json();
  },

  /**
   * Retrieve live real charging station locations in Hyderabad from open source feed
   */
  async getLiveHyderabadStations() {
    try {
      const response = await fetch(`${API_BASE}/stations/live/hyderabad`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        return {
          success: false,
          source: 'OpenStreetMap',
          liveAvailabilitySupported: false,
          data: [],
          message: 'Live Hyderabad stations are temporarily unavailable from the external data provider.'
        };
      }
      return await response.json();
    } catch (err) {
      return {
        success: false,
        source: 'OpenStreetMap',
        liveAvailabilitySupported: false,
        data: [],
        error: err.message,
        message: 'Live Hyderabad stations are temporarily unavailable from the external data provider.'
      };
    }
  }
};
