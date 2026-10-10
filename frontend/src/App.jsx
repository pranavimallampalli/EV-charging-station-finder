import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { StationProvider } from './context/StationContext';

// Layout
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';

// Pages
import { WelcomePage } from './pages/WelcomePage';
import { VehicleSelectPage } from './pages/VehicleSelectPage';
import { LocationPermPage } from './pages/LocationPermPage';
import { HomePage } from './pages/HomePage';
import { StationDetailPage } from './pages/StationDetailPage';
import { SavedStationsPage } from './pages/SavedStationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { OfflineInfoPage } from './pages/OfflineInfoPage';

// Styles
import './styles/index.css';
import './styles/pages.css';

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <StationProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* 1. Welcome Screen */}
                <Route path="/" element={<WelcomePage />} />
                <Route path="/welcome" element={<WelcomePage />} />

                {/* 2. Vehicle Selection Screen */}
                <Route path="/vehicle-select" element={<VehicleSelectPage />} />

                {/* 3. Location Permission Screen */}
                <Route path="/location-permission" element={<LocationPermPage />} />

                {/* 4. Home / Find Stations Screen */}
                <Route path="/home" element={<HomePage />} />

                {/* 5. Station Details Screen */}
                <Route path="/station/:id" element={<StationDetailPage />} />

                {/* 6. Saved Stations Screen */}
                <Route path="/saved" element={<SavedStationsPage />} />

                {/* 7. Profile / Preferences Screen */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* 8. Offline Information Screen */}
                <Route path="/offline" element={<OfflineInfoPage />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </main>
            <BottomNav />
            <Footer />
          </div>
        </StationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
