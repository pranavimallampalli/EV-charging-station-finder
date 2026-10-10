import { Search, RotateCcw, Filter } from 'lucide-react';
import { useStations } from '../../context/StationContext';

const CITIES = ['All', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi'];
const CONNECTORS = ['All', 'CCS2', 'Type 2', 'CHAdeMO', 'GB/T', 'Standard AC'];
const STATUSES = ['All', 'Available', 'In Use', 'Under Maintenance', 'Offline'];

export const StationFilters = () => {
  const { filters, updateFilter, resetFilters, fetchStations } = useStations();

  const handleSearchChange = (e) => {
    updateFilter('search', e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStations();
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.city !== 'All' ||
    filters.connector !== 'All' ||
    filters.status !== 'All';

  return (
    <div className="filter-container">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by station name, street, city, or operator..."
          value={filters.search}
          onChange={handleSearchChange}
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => {
              updateFilter('search', '');
              fetchStations({ ...filters, search: '' });
            }}
            style={{
              position: 'absolute',
              right: '1rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* City Chips */}
      <div className="filter-row">
        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          City:
        </span>
        <div className="filter-chip-group">
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className={`chip ${filters.city === city ? 'active' : ''}`}
              onClick={() => {
                updateFilter('city', city);
                fetchStations({ ...filters, city });
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Connector and Status Filters */}
      <div className="filter-row" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Connector Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Connector:
            </span>
            <select
              className="filter-select"
              value={filters.connector}
              onChange={(e) => {
                const val = e.target.value;
                updateFilter('connector', val);
                fetchStations({ ...filters, connector: val });
              }}
            >
              {CONNECTORS.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Connectors' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Status:
            </span>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => {
                const val = e.target.value;
                updateFilter('status', val);
                fetchStations({ ...filters, status: val });
              }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              resetFilters();
              fetchStations({ search: '', city: 'All', connector: 'All', status: 'All' });
            }}
          >
            <RotateCcw size={14} /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
