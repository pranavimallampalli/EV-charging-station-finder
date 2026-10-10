import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, Check, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useStations } from '../context/StationContext';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

const PRESET_VEHICLES = [
  { make: 'Tata Motors', model: 'Nexon EV', connector: 'CCS2', battery: '40.5 kWh', fastCharge: '50 kW DC' },
  { make: 'Tata Motors', model: 'Punch EV', connector: 'CCS2', battery: '35 kWh', fastCharge: '30 kW DC' },
  { make: 'Mahindra', model: 'XUV400 EV', connector: 'CCS2', battery: '39.4 kWh', fastCharge: '50 kW DC' },
  { make: 'MG', model: 'ZS EV', connector: 'CCS2', battery: '50.3 kWh', fastCharge: '50 kW DC' },
  { make: 'Hyundai', model: 'Ioniq 5', connector: 'CCS2', battery: '72.6 kWh', fastCharge: '350 kW DC' },
  { make: 'Ather Energy', model: '450X', connector: 'Type 2', battery: '3.7 kWh', fastCharge: 'Fast AC / Type 2' },
  { make: 'Ola Electric', model: 'S1 Pro', connector: 'Standard AC', battery: '4.0 kWh', fastCharge: 'Home / Standard AC' },
  { make: 'Commercial Fleet', model: 'GB/T EV', connector: 'GB/T', battery: 'Variable', fastCharge: 'GB/T Fast DC' }
];

const CONNECTORS = ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T', 'Standard AC'];

export const VehicleSelectPage = () => {
  const navigate = useNavigate();
  const { vehicle, setVehicle } = useUser();
  const { updateFilter, fetchStations } = useStations();

  const [selectedVehicle, setSelectedVehicle] = useState(vehicle || PRESET_VEHICLES[0]);
  const [selectedConnector, setSelectedConnector] = useState(vehicle?.connector || 'CCS2');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedVehicle(preset);
    setSelectedConnector(preset.connector);
  };

  const handleSavePreferences = () => {
    const updated = {
      make: selectedVehicle.make,
      model: selectedVehicle.model,
      connector: selectedConnector,
      isConfigured: true
    };

    setVehicle(updated);
    setSaveSuccess(true);

    // Apply connector filter in station context
    updateFilter('connector', selectedConnector);

    setTimeout(() => {
      navigate('/home');
    }, 600);
  };

  return (
    <div className="selection-container">
      <header className="selection-header">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Vehicle & Connector Selection
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select your EV model or preferred connector to filter compatible stations automatically.
        </p>
      </header>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
        Choose an EV Model Preset
      </h2>

      <div className="vehicle-grid">
        {PRESET_VEHICLES.map((v, idx) => {
          const isSelected =
            selectedVehicle.make === v.make && selectedVehicle.model === v.model;

          return (
            <div
              key={idx}
              className={`vehicle-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectPreset(v)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {v.make}
                  </span>
                  {isSelected && (
                    <span style={{ color: 'var(--primary-700)', display: 'flex', alignItems: 'center' }}>
                      <Check size={18} />
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {v.model}
                </h3>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--neutral-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span className="badge badge-connector">{v.connector}</span>
                <span style={{ color: 'var(--text-muted)' }}>{v.fastCharge}</span>
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
        Or Select Connector Directly
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {CONNECTORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${selectedConnector === c ? 'active' : ''}`}
            onClick={() => setSelectedConnector(c)}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Zap size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleSavePreferences}
          style={{ width: '100%', maxWidth: '340px' }}
        >
          {saveSuccess ? 'Preferences Saved!' : 'Save & Find Stations'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
