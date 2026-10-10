# ChargeNear — Backend Service

The Node.js and Express REST API backend for the **ChargeNear** EV charging station finder.

## Technology Stack

* **Runtime:** Node.js (v18+) with ES Modules (`import`/`export`)
* **Framework:** Express.js 4.x
* **Database & ODM:** MongoDB with Mongoose 8.x
* **Configuration:** dotenv
* **CORS:** cors

---

## Installation and Setup

### 1. Install Dependencies

From the `backend/` directory:

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration values inside `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chargenear
CLIENT_URL=http://localhost:5173
```

> **Note:** If you are using a cloud database (MongoDB Atlas), replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/chargenear?retryWrites=true&w=majority`.

### 3. Seed Demonstration Records (Optional)

Once your MongoDB instance is running and reachable, seed fictional demonstration stations:

```bash
npm run seed
```

All seeded stations are explicitly flagged with `isDemoRecord: true` and `isLiveVerified: false`.

### 4. Run the Server

* **Development mode (with auto-reload via Nodemon):**
  ```bash
  npm run dev
  ```

* **Production mode:**
  ```bash
  npm start
  ```

---

## REST Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service health & database connectivity status | Public |
| `GET` | `/api/stations` | List stations with search (`?search=`) & filters (`?connector=`, `?status=`, `?city=`) | Public |
| `GET` | `/api/stations/:id` | Get single station by MongoDB ObjectId | Public |
| `POST` | `/api/stations` | Create a new station (JSON body required) | Dev Mode (Temporary unrestricted) |
| `PUT` | `/api/stations/:id` | Update an existing station | Dev Mode (Temporary unrestricted) |
| `DELETE` | `/api/stations/:id` | Delete a station | Dev Mode (Temporary unrestricted) |

---

## Architecture Compliance

* **Data Honesty:** Distinguishes recorded database status from live verified hardware feeds.
* **Error Handling:** Validates 24-character hexadecimal ObjectIds, returns 400 for validation errors, 404 for missing stations, and 503 if the database is unreachable.
* **Security:** Excludes environment files and secrets from Git.
