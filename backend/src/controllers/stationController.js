import Station from '../models/Station.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { fetchLiveHyderabadStations } from '../services/liveStationService.js';

/**
 * @desc    List all stations with search and filtering
 * @route   GET /api/stations
 * @access  Public
 */
export const getStations = async (req, res, next) => {
  try {
    const { search, connector, status, city, limit = 50, page = 1 } = req.query;

    const filter = {};

    // Filter by connector type
    if (connector) {
      filter['connectors.type'] = connector;
    }

    // Filter by availability status
    if (status) {
      filter['availability.status'] = status;
    }

    // Filter by city (case-insensitive exact or partial match)
    if (city) {
      filter['address.city'] = { $regex: new RegExp(city.trim(), 'i') };
    }

    // Text/Keyword search across name, city, street, and operator
    if (search && search.trim()) {
      const searchRegex = { $regex: new RegExp(search.trim(), 'i') };
      filter.$or = [
        { name: searchRegex },
        { 'address.city': searchRegex },
        { 'address.street': searchRegex },
        { 'operator.name': searchRegex }
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [stations, totalCount] = await Promise.all([
      Station.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Station.countDocuments(filter)
    ]);

    return sendSuccess(res, 200, 'Stations retrieved successfully', stations, {
      count: stations.length,
      total: totalCount,
      page: parsedPage,
      totalPages: Math.ceil(totalCount / parsedLimit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get live real charging stations for Hyderabad from OpenStreetMap
 * @route   GET /api/stations/live/hyderabad
 * @access  Public
 */
export const getLiveHyderabadStations = async (req, res, next) => {
  try {
    const result = await fetchLiveHyderabadStations();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single station by ID
 * @route   GET /api/stations/:id
 * @access  Public
 */
export const getStationById = async (req, res, next) => {
  try {
    if (req.params.id && req.params.id.startsWith('osm-')) {
      const result = await fetchLiveHyderabadStations();
      const match = (result.data || []).find((s) => s._id === req.params.id);
      if (match) {
        return sendSuccess(res, 200, 'Station details retrieved successfully', match);
      }
      return sendError(res, 404, `Live station with ID '${req.params.id}' was not found.`);
    }

    const station = await Station.findById(req.params.id);

    if (!station) {
      return sendError(res, 404, `Charging station with ID '${req.params.id}' was not found.`);
    }

    return sendSuccess(res, 200, 'Station details retrieved successfully', station);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new charging station
 * @route   POST /api/stations
 * @access  Development Mode (Temporary unrestricted access until Phase 5 Auth is implemented)
 */
export const createStation = async (req, res, next) => {
  try {
    const stationData = {
      ...req.body,
      // Ensure demonstration records remain transparently marked
      isDemoRecord: req.body.isDemoRecord !== undefined ? req.body.isDemoRecord : true
    };

    const newStation = await Station.create(stationData);

    return sendSuccess(
      res,
      201,
      'Station created successfully [DEV NOTICE: Unrestricted mutation access active until Phase 5 Auth]',
      newStation
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing charging station
 * @route   PUT /api/stations/:id
 * @access  Development Mode (Temporary unrestricted access until Phase 5 Auth is implemented)
 */
export const updateStation = async (req, res, next) => {
  try {
    const updatedStation = await Station.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedStation) {
      return sendError(res, 404, `Cannot update: station with ID '${req.params.id}' was not found.`);
    }

    return sendSuccess(
      res,
      200,
      'Station updated successfully [DEV NOTICE: Unrestricted mutation access active until Phase 5 Auth]',
      updatedStation
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a charging station
 * @route   DELETE /api/stations/:id
 * @access  Development Mode (Temporary unrestricted access until Phase 5 Auth is implemented)
 */
export const deleteStation = async (req, res, next) => {
  try {
    const deletedStation = await Station.findByIdAndDelete(req.params.id);

    if (!deletedStation) {
      return sendError(res, 404, `Cannot delete: station with ID '${req.params.id}' was not found.`);
    }

    return sendSuccess(
      res,
      200,
      'Station deleted successfully [DEV NOTICE: Unrestricted mutation access active until Phase 5 Auth]',
      { id: req.params.id, name: deletedStation.name }
    );
  } catch (error) {
    next(error);
  }
};
