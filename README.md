# ChargeNear — EV Charging Station Finder

ChargeNear is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to help electric vehicle (EV) drivers locate, evaluate, and navigate to charging stations. The application combines structured persistent station records from MongoDB Atlas with live geospatial discovery from OpenStreetMap, offering distance-sorted listings, faceted search, verified navigation destinations, and an honest representation of charger availability.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Application Architecture](#application-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [External Integrations](#external-integrations)
- [Current Limitations](#current-limitations)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

As electric vehicle adoption expands, drivers often struggle with inconsistent charging station discovery, fragmented charger specifications, and misleading status indicators.

ChargeNear addresses these challenges by providing:
1. **Unified Station Catalog:** Centralized storage of charging stations across major metropolitan corridors (Bengaluru, Hyderabad, Chennai, Mumbai) in MongoDB Atlas.
2. **Live Open-Source Geospatial Discovery:** Integration with OpenStreetMap via the Overpass API for real-time geographic station retrieval in Hyderabad without requiring paid API keys.
3. **Transparent Data Integrity:** Honest reporting of charger availability states ("Availability unknown" / "Unmonitored") whenever live telemetry is unverified, avoiding false claims of real-time slot occupancy.
4. **Proximity-Based Sorting:** In-browser GPS geolocation and mathematical Haversine calculations that sort stations from closest to farthest.
5. **Seamless Navigation:** Turn-by-turn routing through Google Maps to verified landmark coordinates.

---

## Features

### Charging Station Discovery & Browsing
- **Dual-Source Catalog:** Browse persistent database records from MongoDB Atlas alongside live external geographic stations retrieved from OpenStreetMap.
- **Dedicated Hyderabad Live Mode:** Instant toggle between genuine OpenStreetMap locations and local database records when Hyderabad is selected.
- **Rich Station Information:** Displays station name, street address, city, landmark, network operator, power ratings (kW), connector configurations, pricing, and available amenities.

### Search and Faceted Filtering
- **Keyword Search:** Full-text keyword matching across station name, street address, city, and operator name.
- **Faceted Filters:** Filter by city (e.g., Bengaluru, Hyderabad, Chennai, Mumbai), connector type (CCS2, Type 2, CHAdeMO, GB/T, Standard AC), and status.
- **Real-Time Client Updates:** Dynamic filtering with immediate visual feedback and clear filter reset capabilities.

### GPS Proximity & Distance Calculation
- **Geolocation Integration:** Requests browser GPS location via the HTML5 Geolocation API with explicit permission handling.
- **Haversine Distance Engine:** Calculates precise straight-line distance (in kilometers) between user coordinates and station GeoJSON `[longitude, latitude]` points.
- **Nearest-First Sorting:** Automatically orders stations by proximity when GPS is enabled, placing unmapped stations at the end.

### Station Details & Verified Navigation
- **Station Detail Pages:** Comprehensive view of individual stations with technical specs, connector power, operational hours, and amenities.
- **Google Maps Navigation:** Generates turn-by-turn Google Maps directions using verified coordinates for supported destinations (e.g., Cyber Towers, HITEC City).
- **Graceful Unmapped Handling:** Explicitly marks unmapped or illustrative secondary stations without generating false routes.

### User Experience & Preferences
- **Bookmark / Saved Stations:** Save preferred stations to local storage for quick offline access.
- **EV Profile Management:** Configure vehicle preferences, preferred connector type, battery capacity (kWh), and home city.
- **8 Responsive Screens:** Complete user flow including Welcome, Vehicle Selection, Location Permission, Home Discovery, Station Details, Saved Stations, User Profile, and Offline Information.

### Backend CRUD & Data Management
- **Full RESTful Lifecycle:** Complete `GET`, `POST`, `PUT`, and `DELETE` endpoints for charging stations.
- **Robust Validation:** Enforces Mongoose schema constraints, GeoJSON coordinate ranges, connector formats, and 24-character hexadecimal ObjectId checks.
- **Health Monitoring:** Dedicated health endpoint reporting runtime status, environment, and MongoDB connection state.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Database** | **MongoDB Atlas** | Cloud NoSQL database with 2dsphere geospatial indexing and text search |
| **Backend Framework** | **Express.js (v4)** | REST API server, routing, validation middleware, centralized error handling |
| **Backend Runtime** | **Node.js (v18+)** | Asynchronous server-side JavaScript runtime with native ES modules |
| **ODM** | **Mongoose (v8)** | Schema enforcement, document validation, lifecycle hooks, and query helpers |
| **Frontend Framework** | **React.js (v19)** | Declarative UI, component lifecycle, Context API for state management |
| **Build Tool** | **Vite (v8)** | Fast development server, hot module replacement (HMR), production bundling |
| **Routing** | **React Router (v7)** | Client-side routing across all application views |
| **Styling** | **Vanilla CSS** | Custom design system using CSS custom properties, responsive grid/flexbox layouts |
| **Icons** | **Lucide React** | Lightweight, clean SVG iconography |
| **External Geospatial** | **OpenStreetMap / Overpass API** | Open public geospatial query engine for live charging station discovery |
| **Navigation** | **Google Maps** | External turn-by-turn navigation via standard URL parameters |

---

## How It Works

1. **Frontend Presentation & State:**
   - The user opens the React SPA in a modern browser.
   - React Router mounts the requested page (e.g., `/home` or `/station/:id`).
   - `UserContext` manages user preferences and GPS coordinates. When permitted, the browser's Geolocation API obtains coordinates and triggers distance calculations using the Haversine formula.
   - `StationContext` coordinates data fetching through the centralized [`frontend/src/services/api.js`](frontend/src/services/api.js) client.

2. **Backend API & Request Lifecycle:**
   - The Express application (`backend/server.js`) listens on port 5000 and applies CORS, JSON body parsing, and routing middleware.
   - Requests to `/api/stations` are processed by `stationController.js`.
   - MongoDB queries apply regex filters for text search and exact matches for connector type and city.
   - Responses follow a standardized JSON envelope (`success`, `message`, `data`, `pagination`).

3. **Database Persistence:**
   - MongoDB Atlas stores persistent station records adhering to the Mongoose `StationSchema`.
   - Geographic coordinates are stored as standard GeoJSON `Point` objects (`[longitude, latitude]`).
   - Seed scripts (`backend/src/utils/seedData.js`) populate and preserve demonstration records idempotently.

4. **External API Interactions:**
   - When Hyderabad is selected, the frontend queries `/api/stations/live/hyderabad`.
   - The backend service (`liveStationService.js`) constructs an Overpass QL bounding-box query to `overpass-api.de`.
   - Results are normalized to match the station schema and cached in memory for 15 minutes to respect rate limits.
   - When a user clicks **Get Directions** on a supported station, the application generates a Google Maps URL with verified coordinates or address parameters.

---

## Application Architecture

```mermaid
flowchart TD
    User(["EV Driver / User"])

    subgraph Client ["Client Tier (Browser — React SPA)"]
        UI["React 19 Components (Pages, Cards, Badges)"]
        Context["Context State (UserContext & StationContext)"]
        GeoAPI["HTML5 Geolocation API (User GPS)"]
        APIService["Frontend API Client (api.js)"]
        
        UI <--> Context
        GeoAPI --> Context
        Context <--> APIService
    end

    subgraph Server ["Server Tier (Node.js & Express.js)"]
        Router["Express REST API Router (/api)"]
        HealthRoute["GET /api/health"]
        StationCtrl["Station Controller (stationController.js)"]
        LiveService["Live Station Service (liveStationService.js)"]
        Middleware["Middleware (CORS, Validate, ErrorHandler)"]
        
        Router --> HealthRoute
        Router --> Middleware
        Middleware --> StationCtrl
        StationCtrl <--> LiveService
    end

    subgraph Database ["Database Tier"]
        Mongoose["Mongoose ODM (Station Model)"]
        MongoDB[("MongoDB Atlas (Persistent Records)")]
        
        StationCtrl <--> Mongoose
        Mongoose <--> MongoDB
    end

    subgraph External ["External Services"]
        Overpass["OpenStreetMap Overpass API (Live Hyderabad POIs)"]
        GMaps["Google Maps (External Turn-by-Turn Navigation)"]
        
        LiveService <-->|Overpass QL / JSON| Overpass
        UI -.->|Direct URL Navigation| GMaps
    end

    User <-->|Views & Interacts| UI
    APIService <-->|HTTP / REST (Vite Proxy: 5173 -> 5000)| Router
```

---

## Project Structure

```text
chargeNear/
├── ARCHITECTURE.md              # System design and component specification
├── PRD.md                       # Product requirements and problem statement
├── README.md                    # Root project documentation
├── TECHNICAL_SPEC.md            # Technical specifications and data schemas
├── backend/                     # Node.js and Express backend service
│   ├── .env.example             # Template for backend environment variables
│   ├── package.json             # Backend dependencies and scripts
│   ├── server.js                # Server entry point and HTTP listener
│   ├── test_check.js            # Automated backend integration tests
│   └── src/
│       ├── app.js               # Express app configuration and middleware
│       ├── config/
│       │   └── db.js            # Mongoose connection & lifecycle handlers
│       ├── controllers/
│       │   └── stationController.js # Station retrieval, search, filtering, CRUD
│       ├── middleware/
│       │   ├── errorHandler.js  # Global error and 404 response handlers
│       │   └── validate.js      # ObjectId and payload validation middleware
│       ├── models/
│       │   └── Station.js       # Mongoose Station model and GeoJSON schema
│       ├── routes/
│       │   └── stationRoutes.js # REST endpoints for station operations
│       ├── services/
│       │   └── liveStationService.js # OpenStreetMap Overpass integration
│       └── utils/
│           ├── apiResponse.js   # Standardized JSON response envelope
│           └── seedData.js      # Idempotent database seeder
└── frontend/                    # Vite + React single-page application
    ├── .env.example             # Template for frontend environment variables
    ├── index.html               # SPA HTML entry point
    ├── package.json             # Frontend dependencies and scripts
    ├── test_api_integration.js  # API connectivity test script
    ├── test_full_suite.js       # 50-point end-to-end verification test suite
    ├── vite.config.js           # Vite build config and backend dev proxy
    └── src/
        ├── App.jsx              # Main router and root layout
        ├── main.jsx             # React DOM entry point
        ├── components/
        │   ├── common/          # Reusable UI elements (Badge, Button, Card, Modal)
        │   ├── layout/          # Navbar, BottomNav, Footer
        │   └── stations/        # StationCard, StationFilter, StationSearch
        ├── context/
        │   ├── StationContext.jsx # Stations catalog, filters, active station
        │   └── UserContext.jsx    # User preferences, vehicle info, GPS coords
        ├── pages/
        │   ├── HomePage.jsx          # Main station discovery view
        │   ├── LocationPermPage.jsx  # Geolocation permission prompt
        │   ├── OfflineInfoPage.jsx   # Emergency guidelines & offline tips
        │   ├── ProfilePage.jsx       # Vehicle specs & user preferences
        │   ├── SavedStationsPage.jsx # Bookmarked station list
        │   ├── StationDetailPage.jsx # Individual station specs & directions
        │   ├── VehicleSelectPage.jsx # EV model & connector selector
        │   └── WelcomePage.jsx       # Introductory onboarding screen
        ├── services/
        │   └── api.js           # Fetch wrapper for backend API endpoints
        ├── styles/
        │   ├── index.css        # Global CSS variables, reset, design tokens
        │   └── pages.css        # Page-specific styling and layout rules
        └── utils/
            └── distance.js      # Haversine distance and coordinate parser
```

---

## Prerequisites

Before setting up ChargeNear locally, ensure the following are installed on your machine:

- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher (packaged with Node.js)
- **MongoDB:** A free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster, or a locally running MongoDB instance (v6.0+)
- **Web Browser:** Modern browser supporting HTML5 Geolocation (Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari)
- **Git:** For cloning the repository

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/chargeNear.git
cd chargeNear
```

### 2. Configure and Install Backend

Navigate to the `backend` directory, install dependencies, and create your environment configuration:

```bash
cd backend
npm install
```

Copy the example environment file:

```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```

Open `.env` in an editor and supply your MongoDB Atlas connection string:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chargenear?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database Records

Populate the database with the baseline station records:

```bash
npm run seed
```

*The seeder runs idempotently, ensuring the 7 baseline demonstration records (including 3 Hyderabad stations) are created without producing duplicates if executed multiple times.*

### 4. Configure and Install Frontend

In a separate terminal, navigate to the `frontend` directory and install dependencies:

```bash
cd ../frontend
npm install
```

Copy the frontend example environment file:

```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```

Verify that `.env` points to the local backend API:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port number on which the Express server listens |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/chargenear` | MongoDB connection URI (Atlas cloud string or local instance) |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin for frontend requests |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Base URL prefix for backend REST API calls |

> **Security Note:** Never commit `.env` files containing database passwords or private connection strings to version control. Both `.env` files are ignored via `.gitignore`.

---

## Running the Application

ChargeNear runs the backend API and frontend client in separate terminal windows.

### Terminal 1: Backend Server

From the `backend/` directory:

```bash
# Development mode with Nodemon auto-reload:
npm run dev

# Or standard production mode:
npm start
```

The backend starts at `http://localhost:5000`. You will see confirmation logs:
- `🚀 [ChargeNear Server] Running in development mode on port 5000`
- `📡 [Health Check] Available at http://localhost:5000/api/health`
- `⚡ [Stations API] Available at http://localhost:5000/api/stations`

### Terminal 2: Frontend Client

From the `frontend/` directory:

```bash
npm run dev
```

The Vite development server starts at `http://localhost:5173`. Open this URL in your browser to access ChargeNear.

---

## API Documentation

All API endpoints return JSON conforming to the standardized structure:
```json
{
  "success": true,
  "message": "Human-readable status message",
  "data": {},
  "pagination": {}
}
```

### Health Check

#### `GET /api/health`
- **Description:** Verifies server uptime and MongoDB connectivity.
- **Access:** Public
- **Sample Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "ChargeNear Backend API is operational",
    "timestamp": "2026-10-21T04:20:00.000Z",
    "database": {
      "status": "connected",
      "connected": true
    },
    "environment": "development",
    "version": "1.0.0"
  }
  ```

---

### Stations Endpoints

#### `GET /api/stations`
- **Description:** Retrieves a paginated list of charging stations from MongoDB with optional filtering and search.
- **Access:** Public
- **Supported Query Parameters:**
  - `search` *(string)*: Case-insensitive search matching name, street, city, or operator.
  - `city` *(string)*: Filters stations by city name (e.g., `Bengaluru`, `Hyderabad`).
  - `connector` *(string)*: Filters by connector type (`CCS2`, `Type 2`, `CHAdeMO`, `GB/T`, `Standard AC`).
  - `status` *(string)*: Filters by recorded availability status (`Available`, `In Use`, `Under Maintenance`, `Offline`, `Unknown`).
  - `limit` *(integer, 1–100)*: Items per page (default: 50).
  - `page` *(integer)*: Page offset (default: 1).

#### `GET /api/stations/live/hyderabad`
- **Description:** Queries OpenStreetMap Overpass API for real-time geographic charging stations located within the Hyderabad bounding box (`17.20, 78.20` to `17.65, 78.70`).
- **Access:** Public
- **Caching:** Responses are cached in-memory for 15 minutes.
- **Availability Disclaimer:** Returns `liveAvailabilitySupported: false` to reflect that OpenStreetMap provides genuine locations but does not track live port occupancy.

#### `GET /api/stations/:id`
- **Description:** Retrieves full details for a single station by its 24-character MongoDB ObjectId, or an external ID prefixed with `osm-`.
- **Access:** Public
- **Error Responses:** `400 Bad Request` if the ID format is invalid; `404 Not Found` if the record does not exist.

#### `POST /api/stations`
- **Description:** Creates a new charging station record in MongoDB.
- **Access:** Development Mode (temporary unrestricted access during hackathon testing).
- **Required Body Fields:** `name` (string), `address.city` (string), `connectors` (non-empty array).

#### `PUT /api/stations/:id`
- **Description:** Updates fields on an existing station record.
- **Access:** Development Mode.

#### `DELETE /api/stations/:id`
- **Description:** Removes a station record from MongoDB by ObjectId.
- **Access:** Development Mode.

---

## External Integrations

### 1. OpenStreetMap & Overpass API
- **Purpose:** Supplies genuine, community-verified geospatial coordinates for real-world charging stations in the Hyderabad metropolitan area.
- **Implementation:** Queries the public Overpass endpoint (`https://overpass-api.de/api/interpreter`) using an optimized bounding-box Overpass QL query:
  ```overpass
  [out:json][timeout:9];
  node["amenity"="charging_station"](17.20,78.20,17.65,78.70);
  out 15;
  ```
- **Resilience:** Employs a 9-second fetch timeout, fallback to cached data, and error shielding to ensure backend stability if the Overpass API is temporarily unreachable.
- **Licensing:** Uses public OpenStreetMap data under the Open Database License (ODbL). No paid API key is required.

### 2. Google Maps Navigation
- **Purpose:** Provides direct turn-by-turn driving navigation from the user's current location to supported destination coordinates.
- **Implementation:** Links directly to Google Maps via standard query parameter URLs:
  `https://www.google.com/maps/dir/?api=1&destination=<latitude>,<longitude>`
- **Designated Landmark:** For demonstration purposes, `ChargeNear Hub — Cyber Towers` routes to the verified real-world public landmark coordinates `17.4504, 78.3808` (Cyber Towers Circle, HITEC City, Hyderabad).

---

## Current Limitations

To maintain full technical honesty and transparency:

1. **No Live Charger Telemetry:** The application does not currently connect to Charge Point Operator (CPO) OCPI/OCPP telemetry streams. Live availability statuses for all stations are truthfully designated as `"Availability unknown"` or `"Unmonitored"`. Port counts are not falsely claimed as live.
2. **Hyderabad-Scoped Live Discovery:** Genuine external OpenStreetMap station discovery is currently implemented for the Hyderabad metropolitan area. Stations in other cities are served from the MongoDB dataset.
3. **Illustrative Demonstration Stations:** Aside from genuine OpenStreetMap records and verified navigation landmarks, baseline database records represent illustrative demonstration stations created for functional validation.
4. **Authentication Deferred:** Role-based access control (JWT authentication and admin middleware) is planned for future iterations. Mutation routes (`POST`, `PUT`, `DELETE`) are accessible in development mode for evaluation.

---

## Testing

ChargeNear includes automated test suites for both backend and frontend verification.

### Backend Tests

From the `backend/` directory:

```bash
npm test
```

Executes [`backend/test_check.js`](backend/test_check.js), validating:
- `GET /api/health` status and DB connectivity reporting.
- 404 handler behavior on undefined routes.
- Input validation and rejection of invalid 24-character ObjectIds (400 Bad Request).
- Payload validation for missing required fields on `POST /api/stations`.
- Graceful database disconnection handling (503 Service Unavailable).

### Frontend Verification Suite

From the `frontend/` directory (with the backend server running):

```bash
npm test
```

Executes [`frontend/test_full_suite.js`](frontend/test_full_suite.js), running **50 automated assertions** covering:
- Backend health check and active MongoDB Atlas connection.
- Verification of the 7 seeded database records.
- Confirmation that obsolete port counts and fictional phone numbers are absent.
- Faceted filtering by city, connector type, status, and keyword search.
- Single station detail lookups.
- UI source cleanliness (absence of demo jargon).
- Routing verification for all 8 application screens.
- Haversine distance calculations, GeoJSON `[lon, lat]` parsing, nearest-first sorting, and coordinate boundary validation.
- Live Hyderabad OpenStreetMap endpoint integration and schema normalization.

### Frontend Production Build

From the `frontend/` directory:

```bash
npm run build
```

Compiles the React application using Vite, validating TypeScript/JSX transformations, CSS bundling, and production asset generation.

---

## Future Improvements

- **OCPI / OCPP Live Telemetry:** Integrate with open EV charging network protocols to display real-time charger occupancy, plug status, and queue times.
- **JWT Authentication & Roles:** Implement user registration, login, and protected admin routes for managing station records.
- **Interactive Map Canvas:** Add an embedded Leaflet or Mapbox map view with interactive station pins and radius-based bounding box queries.
- **In-App Reservation & Payments:** Allow drivers to reserve charging slots in advance and pay digitally via UPI or card gateways.
- **Multi-City Live Discovery:** Expand Overpass API bounding-box queries to automatically discover stations across additional cities based on active user coordinates.

---

## Contributing

Contributions, bug reports, and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of change"
   ```
4. Run both backend and frontend test suites to ensure all checks pass:
   ```bash
   cd backend && npm test
   cd ../frontend && npm test
   ```
5. Push to your branch and submit a Pull Request.

---

## License

No license has been specified for this project. All rights are reserved by the original authors.
