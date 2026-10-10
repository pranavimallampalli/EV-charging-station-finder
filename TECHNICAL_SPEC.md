# ChargeNear — Technical Specification

## 1. Technology Stack

### 1.1 Core Technologies and Roles

* **MongoDB:** Document-oriented NoSQL database used to store charging station records, user credentials, and availability metadata.
* **Mongoose:** Object Data Modeling (ODM) library for Node.js, providing schema validation, type enforcement, and query helpers for MongoDB.
* **Express.js:** Web application framework for Node.js, handling routing, middleware (authentication, validation, error handling), and REST API endpoints.
* **Node.js:** Server-side JavaScript runtime environment executing the backend application and business logic.
* **React.js:** Component-based frontend library used to build a responsive Single Page Application (SPA) based on the ChargeNear Figma prototype.
* **Vanilla CSS / CSS Modules:** Modular and responsive styling ensuring design fidelity, fast load times, and custom component theming without external CSS framework bloat.

### 1.2 Proposed Project Structure

To maintain clean separation of concerns and allow independent execution during the hackathon, the repository will be structured as a decoupled monorepo:

```text
chargeNear/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection configuration
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile logic
│   │   │   └── stationController.js  # CRUD and search logic for stations
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & role authorization
│   │   │   ├── validate.js           # Request body & query parameter validation
│   │   │   └── errorHandler.js       # Centralized error-handling middleware
│   │   ├── models/
│   │   │   ├── Station.js            # Mongoose schema for charging stations
│   │   │   └── User.js               # Mongoose schema for users and admins
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Routes for /api/auth
│   │   │   └── stationRoutes.js      # Routes for /api/stations
│   │   ├── utils/
│   │   │   ├── apiResponse.js        # Standardized JSON response helper
│   │   │   └── seedData.js           # Initial station seed script for demo
│   │   └── app.js                    # Express app initialization & middleware
│   ├── server.js                     # Server entry point listening on PORT
│   ├── .env.example                  # Template for backend environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                   # Icons, brand logos, demo graphics
│   │   ├── components/
│   │   │   ├── common/               # Button, Input, Modal, Badge, Loader
│   │   │   ├── layout/               # Header, BottomNav, ScreenContainer
│   │   │   └── stations/             # StationCard, StationFilter, StationForm
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state (token, user, login, logout)
│   │   │   └── StationContext.jsx    # Station list state, filters, active station
│   │   ├── pages/
│   │   │   ├── WelcomePage.jsx       # Screen 1: Welcome & introduction
│   │   │   ├── VehicleSelectPage.jsx # Screen 2: EV model & connector selection
│   │   │   ├── LocationPermPage.jsx  # Screen 3: Location permission prompt
│   │   │   ├── HomePage.jsx          # Screen 4: Main station finder & search
│   │   │   ├── StationDetailPage.jsx # Screen 5: Station details & connectors
│   │   │   ├── SavedStationsPage.jsx # Screen 6: Bookmarked stations
│   │   │   ├── ProfilePage.jsx       # Screen 7: User profile & role settings
│   │   │   └── OfflineInfoPage.jsx   # Screen 8: Offline tips & helpline info
│   │   ├── services/
│   │   │   └── api.js                # Axios/Fetch client for backend endpoints
│   │   ├── styles/
│   │   │   ├── index.css             # Global styles, variables, typography
│   │   │   └── components/           # Component-level stylesheets
│   │   ├── App.jsx                   # Route configuration & screen transitions
│   │   └── main.jsx                  # React application root
│   ├── .env.example                  # Template for frontend environment variables
│   └── package.json
├── PRD.md                            # Product Requirements Document
├── TECHNICAL_SPEC.md                 # Technical Specification
├── README.md                         # Setup and execution guide
└── .gitignore                        # Global ignore for node_modules and .env files
```

---

## 2. Application Requirements

Translating the PRD requirements into concrete technical deliverables:

1. **Station Discovery:**
   * Public retrieval of all active stations.
   * Render station summaries (name, address, connectors, availability badge, power rating) in responsive card lists.
2. **Search and Filtering:**
   * Keyword search over station name, street, city, and operator.
   * Filter stations by connector type (e.g., CCS2, Type 2, CHAdeMO, GB/T) and recorded availability status (e.g., Available, In Use, Offline, Unknown).
3. **Station Details:**
   * Deep view of an individual station by identifier.
   * Display accurate geolocation coordinates, full address, connector breakdown, charging speeds, pricing, amenities, and recorded availability metadata.
4. **CRUD Operations:**
   * Complete RESTful administrative CRUD interface for creating, viewing, modifying, and deleting stations.
   * Input sanitization and validation on all state-changing operations.
5. **Availability Presentation:**
   * Distinction between recorded database status and real-time live telemetry.
   * Visual indicators showing the data source and the last time the record was updated.
6. **Responsive Interface:**
   * Seamless rendering across desktop viewports and mobile screens (following the 8 Figma prototype screens).
   * Touch-friendly navigation, quick-filter chips, and clear status badges.

---

## 3. MongoDB Data Model

### 3.1 Station Schema (`Station.js`)

The Station schema stores charging infrastructure details while distinguishing confirmed records from optional or missing attributes.

```javascript
const mongoose = require('mongoose');

const ConnectorSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Connector type is required'],
    enum: ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T', 'Standard AC', 'Other'],
    trim: true
  },
  powerKW: {
    type: Number,
    min: [0, 'Power rating cannot be negative'],
    default: null
  }
}, { _id: false });

const StationSchema = new mongoose.Schema({
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
    // Coordinates formatted as [longitude, latitude] for GeoJSON compliance
    coordinates: {
      type: [Number],
      validate: {
        validator: function(coords) {
          if (!coords || coords.length === 0) return true; // Optional coordinates
          return coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 && // longitude
            coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates: format must be [longitude, latitude]'
      },
      default: undefined
    }
  },
  connectors: {
    type: [ConnectorSchema],
    validate: {
      validator: function(v) { return Array.isArray(v) && v.length > 0; },
      message: 'At least one connector type must be specified'
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Under Maintenance', 'Offline', 'Unknown'],
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
  amenities: [{
    type: String,
    enum: ['Restrooms', 'Cafe', 'WiFi', 'Shopping', '24/7 Access', 'Covered Parking']
  }],
  isDemoRecord: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for search and geospatial queries
StationSchema.index({ name: 'text', 'address.city': 'text', 'operator.name': 'text' });
StationSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
StationSchema.index({ 'availability.status': 1 });
StationSchema.index({ 'connectors.type': 1 });

module.exports = mongoose.model('Station', StationSchema);
```

### 3.2 User Schema (`User.js`)

Supports authentication, role-based station management, and saved stations.

```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  savedStations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station'
  }],
  vehiclePreference: {
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    preferredConnector: {
      type: String,
      enum: ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T', 'Standard AC', 'Any'],
      default: 'Any'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
```

---

## 4. REST API Specification

### 4.1 Standardized Response Format

All JSON responses follow a predictable envelope:

```json
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "count": 1
}

// Error Response
{
  "success": false,
  "error": "Error description message",
  "errors": [] // Optional array of field validation details
}
```

### 4.2 Endpoints Summary

| Method | Endpoint | Access | Purpose | Expected Request Fields / Queries | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/stations` | Public | List all stations with search & filter | Query: `search`, `connector`, `status`, `city`, `limit`, `page` | 200, 500 |
| `GET` | `/api/stations/:id` | Public | Retrieve a single station | URL Param: `id` (24-char hex ObjectId) | 200, 400, 404, 500 |
| `POST` | `/api/stations` | Admin | Create a new charging station | Body: Full Station JSON object (`name`, `address`, `connectors`, etc.) | 201, 400, 401, 403, 500 |
| `PUT` | `/api/stations/:id` | Admin | Update an existing station | URL Param: `id`, Body: Partial or full Station fields to update | 200, 400, 401, 403, 404, 500 |
| `DELETE` | `/api/stations/:id` | Admin | Remove a charging station | URL Param: `id` | 200, 400, 401, 403, 404, 500 |
| `POST` | `/api/auth/register` | Public | Register new user or initial admin | Body: `name`, `email`, `password`, `role` (optional, default: `user`) | 201, 400, 409, 500 |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT | Body: `email`, `password` | 200, 400, 401, 500 |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of authenticated user | Headers: `Authorization: Bearer <token>` | 200, 401, 404, 500 |
| `POST` | `/api/auth/saved-stations/:id` | Authenticated | Bookmark / toggle saved station | URL Param: `id` | 200, 400, 401, 404, 500 |

### 4.3 Endpoint Request & Response Examples

#### 1. List Stations with Filtering (`GET /api/stations`)
* **Query Parameters:**
  * `search` (string): Text match on name, city, operator
  * `connector` (string): Match connector type (`CCS2`, `Type 2`, etc.)
  * `status` (string): Match availability status (`Available`, `In Use`, etc.)
  * `city` (string): Match specific city
* **Sample 200 OK Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "660c2e399589d81d2c12a001",
      "name": "EcoCharge Central Hub",
      "address": {
        "street": "14 Tech Park Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560100"
      },
      "connectors": [
        { "type": "CCS2", "powerKW": 50 },
        { "type": "Type 2", "powerKW": 22 }
      ],
      "availability": {
        "status": "Available",
        "isLiveVerified": false,
        "source": "Recorded Database Status",
        "lastUpdated": "2026-10-09T14:30:00.000Z"
      },
      "operator": { "name": "Tata Power EZ Charge" },
      "isDemoRecord": true
    }
  ]
}
```

#### 2. Create Station (`POST /api/stations`)
* **Headers:** `Authorization: Bearer <token>`
* **Sample Request Body:**
```json
{
  "name": "GreenGrid Station North",
  "address": {
    "street": "Outer Ring Road, Marathahalli",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560037"
  },
  "location": {
    "type": "Point",
    "coordinates": [77.6974, 12.9591]
  },
  "connectors": [
    { "type": "CCS2", "powerKW": 60 }
  ],
  "availability": {
    "status": "Available",
    "isLiveVerified": false,
    "source": "Admin Entry"
  },
  "operator": {
    "name": "GreenGrid Mobility"
  },
  "pricing": {
    "costPerKWh": 18.5,
    "currency": "INR",
    "isFree": false
  }
}
```
* **Sample 201 Created Response:**
```json
{
  "success": true,
  "message": "Station created successfully",
  "data": {
    "_id": "660c2e399589d81d2c12a002",
    "name": "GreenGrid Station North",
    "createdAt": "2026-10-09T15:00:00.000Z"
  }
}
```

---

## 5. Authentication and Authorisation

### 5.1 Roles and Permissions

* **Public / Unauthenticated Users:**
  * Can discover and view all charging station records.
  * Can search and filter stations.
  * Can view station details and offline helpline information.
* **Registered EV Owners (`user` role):**
  * All public privileges.
  * Can save and manage personal bookmarked stations (`savedStations`).
  * Can store vehicle preferences for automatic connector filtering.
* **Administrators (`admin` role):**
  * All user privileges.
  * Full authorization to execute Create (`POST`), Update (`PUT`), and Delete (`DELETE`) operations on station records.

### 5.2 Implementation Strategy for Hackathon

* **Password Security:** Use `bcryptjs` with salt rounds (10) for one-way password hashing prior to storing in MongoDB.
* **Token Authentication:** Issue JSON Web Tokens (JWT) upon successful login containing user `id` and `role`.
* **Header Transmission:** Frontend transmits the token via standard HTTP header: `Authorization: Bearer <token>`.
* **Route Protection Middleware:**
  * `verifyToken`: Validates token signature, expiration, and extracts `req.user`.
  * `requireAdmin`: Checks `req.user.role === 'admin'`; returns `403 Forbidden` if unauthorized.
* **Secrets Handling:**
  * JWT secret is strictly loaded from `process.env.JWT_SECRET`.
  * Tokens and passwords are never logged, committed to source control, or embedded in client bundles.

---

## 6. Station Data and Availability

### 6.1 Honest Data Policy

To adhere strictly to the PRD:
1. **No Fabricated Live Data:** Real-time hardware telemetry and live occupancy cannot be claimed without an active, verified IoT or CPO (Charge Point Operator) API integration.
2. **Recorded Database Status:** Availability is treated and displayed as *Recorded Database Status* alongside a `lastUpdated` timestamp and data source label.
3. **Demo Records:** Pre-seeded station records will include `isDemoRecord: true` and will be transparently presented as demonstration data.
4. **Third-Party Integration Caution:** Live external APIs (e.g., Open Charge Map, TomTom, government portals) require API keys, have variable coverage for specific regions, and impose strict rate limits. External API ingestion must remain an isolated adapter module rather than a blocker for the core MERN CRUD implementation.

### 6.2 Data Seeding Plan

* Provide a self-contained seed utility (`backend/src/utils/seedData.js`) populated with realistic station records across major Indian cities (e.g., Bengaluru, Hyderabad, Mumbai, Delhi).
* Each record will specify realistic connector types (`CCS2`, `Type 2`), realistic power outputs (e.g., 22kW AC, 50kW/60kW DC), realistic operators (Tata Power, Zeon, Jio-bp), and valid geographic coordinates.

---

## 7. Frontend Requirements

The React application will implement the 8 screens defined in the ChargeNear Figma design reference:

### 7.1 Screen Responsibilities

| # | Screen Name | Key UI Elements | Primary Responsibilities |
|---|---|---|---|
| 1 | **Welcome** | App logo, hero illustration, "Get Started" CTA, Login/Register shortcuts | Welcomes user, establishes brand identity, routes user into the discovery flow. |
| 2 | **Vehicle Selection** | Vehicle brand & model selector, connector compatibility badges (CCS2, Type 2, etc.) | Captures EV model preferences to automatically pre-filter compatible chargers. Stored in React state and localStorage. |
| 3 | **Location Permission** | Permission explanation card, "Enable Location" button, "Enter City Manually" fallback | Requests browser Geolocation API (`navigator.geolocation`). If denied or skipped, provides manual city selection without breaking the app. |
| 4 | **Home / Find Stations** | Search input, filter chips (Connector, Availability), station list cards, Admin "Add Station" button | Main discovery dashboard. Fetches `/api/stations`, executes live search and filtering, and displays status badges. |
| 5 | **Station Details** | Full address, connector list with power (kW), pricing, operator info, availability indicator with timestamp, "Save Station" button, Admin Edit/Delete actions | Deep view of selected station. Renders verified vs recorded demonstration status disclaimers and connector power ratings. |
| 6 | **Saved Stations** | Filtered list of bookmarked stations, empty state illustration | Displays stations saved by the user for fast repeated access. Stored in User profile (or localStorage fallback). |
| 7 | **Profile** | User details, vehicle settings summary, Admin mode indicator, Logout button, Login prompt | Displays active session state, role status (User vs Admin), and enables switching accounts or logging out. |
| 8 | **Offline Information** | Emergency EV roadside assistance numbers, offline charging guidance, cached station access advice | Provides critical information and instructions when internet connectivity is intermittent or lost. |

### 7.2 Component Architecture and Design System

* **Consistent Theme Variables:** Defined in `styles/index.css` (primary electric teal/green, slate dark background, neutral card surfaces, status colors for Available/In Use/Offline).
* **State Management:** Lightweight React Context API (`AuthContext` and `StationContext`) to avoid Redux overhead while maintaining reactive state across screens.
* **Graceful Degradation:** When location permission is declined, default to a sensible fallback (e.g., Bengaluru) with clear manual city switching.

---

## 8. Validation and Error Handling

### 8.1 Server-Side Validation

* **ObjectId Validation:** Validate that IDs passed to `/api/stations/:id` conform to 24-character hexadecimal MongoDB ObjectIds before issuing database queries; return `400 Bad Request` with message `"Invalid Station ID format"` if malformed.
* **Mongoose Schema Validation:** Automatic type checking, enum verification, and required field enforcement on model saves.
* **Duplicate Email Detection:** Check for unique email conflicts on user registration; return `409 Conflict`.
* **Centralized Express Error Handler:** Catch all unhandled exceptions, log errors server-side, and return a clean `{ success: false, error: "..." }` response rather than leaking stack traces.

### 8.2 Database Resilience

* Backend connection helper (`db.js`) includes connection event listeners (`connected`, `error`, `disconnected`).
* Express server returns `503 Service Unavailable` with friendly message if the database is unreachable rather than crashing silently.

### 8.3 Frontend States

* **Loading States:** Reusable skeleton cards and spinner overlays during asynchronous API requests.
* **Empty Results:** User-friendly messages when queries return no stations (e.g., *"No charging stations match your filter criteria. Try clearing some filters."*).
* **Error Notifications:** Toast banners for failed network requests or validation rejections.

---

## 9. Security and Configuration

### 9.1 Environment Variables

Sensitive configuration values will be loaded exclusively via environment variables and never checked into version control.

#### Backend (`backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chargenear
JWT_SECRET=replace_with_a_secure_random_jwt_secret_key_for_chargenear
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 9.2 Git Exclusion and Secret Hygiene

* `.gitignore` in the repository root and subdirectories must explicitly exclude `.env`, `.env.local`, and `node_modules/`.
* No MongoDB connection strings, database passwords, or private keys will exist in frontend JavaScript code or public GitHub commits.

---

## 10. Testing Requirements

Given hackathon timelines, testing will focus on high-impact validation of core functionality:

1. **Database Connectivity:** Verify backend logs successful connection to local or cloud MongoDB on startup.
2. **Station CRUD Verification:**
   * Test `POST /api/stations` with valid payload (expect 201).
   * Test `POST /api/stations` with missing required fields (expect 400).
   * Test `GET /api/stations` (expect 200 with station array).
   * Test `GET /api/stations/:id` with valid and invalid IDs (expect 200 and 400/404).
   * Test `PUT /api/stations/:id` and `DELETE /api/stations/:id` (expect 200).
3. **Authentication and Access Control:**
   * Verify registration and login generate valid JWT tokens.
   * Verify station creation/update/deletion without token returns `401 Unauthorized`.
   * Verify station creation/update/deletion with standard user token returns `403 Forbidden`.
   * Verify admin token allows full CRUD access.
4. **Search and Filtering Logic:**
   * Verify search query filters by city, station name, and operator.
   * Verify filtering by connector type (e.g., `CCS2`) excludes non-matching stations.
5. **Frontend Integration:**
   * Verify end-to-end flow: landing on Welcome screen -> entering Home screen -> stations loading from API -> filtering stations -> clicking into Station Details.
   * Verify Admin modal allows creating/updating stations directly from the UI.
   * Verify mobile responsiveness across 375px (mobile) to 1440px (desktop) viewport widths.

---

## 11. Implementation Priorities

Development is structured into 6 sequential phases prioritizing core hackathon problem statement deliverables:

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Setup & Database Connection                        │
│ - Initialize backend and frontend directory structure       │
│ - Setup Express app and connect Mongoose to MongoDB         │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Station Schema & REST CRUD APIs                    │
│ - Implement Station Mongoose model                          │
│ - Build stationController and stationRoutes (CRUD)          │
│ - Create seedData script with realistic initial stations    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: React Interface & Station Discovery                │
│ - Build basic screen layout and CSS design system           │
│ - Integrate Home screen with GET /api/stations              │
│ - Implement responsive StationCard components               │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Search, Filtering & Station Details View           │
│ - Wire up live search bar and connector/status filters      │
│ - Build Station Details view with connector breakdown       │
│ - Build Vehicle Selection and Location Permission screens   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Authentication & Authorisation                     │
│ - Implement User model, bcrypt hashing, JWT issuance        │
│ - Protect station POST, PUT, DELETE routes for Admin only   │
│ - Add Admin Station Management form/modal in React UI       │
│ - Add Profile and Saved Stations screens                    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: Integration Polish, Offline Screen & Demo Prep     │
│ - Build Offline Information screen with helplines           │
│ - Verify all 12 PRD acceptance criteria                     │
│ - Document step-by-step setup and live demo procedure       │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Open Decisions

1. **Station Geolocation Visualization (Map vs List):**
   * *Status:* Open.
   * *Options:* Option A is an interactive Leaflet/OpenStreetMap integration if frontend time permits; Option B is an interactive card-based list view with embedded Google Maps / directions external links. The card-based view is guaranteed first, with Leaflet map added only as an enhancement.
2. **Production Deployment Platform:**
   * *Status:* Open.
   * *Options:* Options include Render/Railway (Backend & MongoDB Atlas) + Vercel/Netlify (React Frontend) vs running a clean local multi-terminal live demonstration. Both setup instructions will be documented.
3. **External Real-Time CPO Integration:**
   * *Status:* Deferred.
   * *Rationale:* External live CPO APIs require commercial agreements or developer credentials not obtainable during the hackathon. The system relies on seeded and admin-managed records, clearly labeled as recorded database status.
