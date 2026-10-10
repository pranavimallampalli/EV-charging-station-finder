import { Link } from 'react-router-dom';
import { Zap, MapPin, ShieldCheck, ArrowRight, BatteryCharging, Sliders } from 'lucide-react';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const WelcomePage = () => {
  return (
    <div className="welcome-hero">
      <div className="welcome-badge">
        <Zap size={15} /> Electric Vehicle Station Finder
      </div>

      <h1 className="welcome-title">
        Find charging stations near you with confidence
      </h1>

      <p className="welcome-subtitle">
        ChargeNear helps electric vehicle drivers discover charging locations across India,
        filter by connector compatibility, and view recorded availability information.
      </p>

      <div className="welcome-actions">
        <Link to="/home" className="btn btn-primary btn-lg">
          Explore Charging Stations <ArrowRight size={18} />
        </Link>
        <Link to="/vehicle-select" className="btn btn-secondary btn-lg">
          <BatteryCharging size={18} /> Select My Vehicle
        </Link>
      </div>

      <div className="welcome-features">
        <div className="feature-box">
          <div className="feature-icon-wrapper">
            <Sliders size={20} />
          </div>
          <h3 className="feature-title">Connector Compatibility</h3>
          <p className="feature-desc">
            Filter specifically for CCS2, Type 2, CHAdeMO, or GB/T connectors compatible with your EV.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-wrapper">
            <MapPin size={20} />
          </div>
          <h3 className="feature-title">Location & Cities</h3>
          <p className="feature-desc">
            Quickly locate stations in Bengaluru, Hyderabad, Mumbai, Delhi, and surrounding hubs.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-wrapper">
            <ShieldCheck size={20} />
          </div>
          <h3 className="feature-title">Recorded Statuses</h3>
          <p className="feature-desc">
            Transparently view recorded station availability with timestamps and source attribution.
          </p>
        </div>
      </div>
    </div>
  );
};
