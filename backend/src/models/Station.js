import mongoose from 'mongoose';

const ConnectorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Connector type is required'],
      enum: {
        values: ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T', 'Standard AC', 'Other'],
        message: '{VALUE} is not a supported connector type'
      },
      trim: true
    },
    powerKW: {
      type: Number,
      min: [0, 'Power rating cannot be negative'],
      default: null
    }
  },
  { _id: false }
);

const StationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      maxlength: [120, 'Station name cannot exceed 120 characters']
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      landmark: { type: String, trim: true, default: '' }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      // Coordinates stored as [longitude, latitude] for GeoJSON compliance
      coordinates: {
        type: [Number],
        validate: {
          validator: function (coords) {
            if (!coords || coords.length === 0) return true; // Optional coordinates
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90 // latitude
            );
          },
          message: 'Invalid coordinates: format must be [longitude, latitude] within valid geographic ranges'
        },
        default: undefined
      }
    },
    connectors: {
      type: [ConnectorSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one connector specification is required'
      }
    },
    availability: {
      status: {
        type: String,
        enum: {
          values: ['Available', 'In Use', 'Under Maintenance', 'Offline', 'Unknown'],
          message: '{VALUE} is not a valid availability status'
        },
        default: 'Unknown'
      },
      isLiveVerified: {
        type: Boolean,
        default: false
      },
      source: {
        type: String,
        default: 'Recorded Data / Manual Entry',
        trim: true
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    operator: {
      name: { type: String, trim: true, default: 'Independent' },
      network: { type: String, trim: true, default: '' }
    },
    pricing: {
      costPerKWh: { type: Number, min: 0, default: null },
      currency: { type: String, default: 'INR' },
      isFree: { type: Boolean, default: false }
    },
    amenities: [
      {
        type: String,
        enum: ['Restrooms', 'Cafe', 'WiFi', 'Shopping', '24/7 Access', 'Covered Parking']
      }
    ],
    isDemoRecord: {
      type: Boolean,
      default: true
    },
    isPrimaryDemo: {
      type: Boolean,
      default: false
    },
    verifiedDestination: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for text search, geospatial lookups, and faceted filtering
StationSchema.index({ name: 'text', 'address.city': 'text', 'operator.name': 'text' });
StationSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
StationSchema.index({ 'availability.status': 1 });
StationSchema.index({ 'connectors.type': 1 });

const Station = mongoose.model('Station', StationSchema);

export default Station;
