export const AvailabilityBadge = ({ status, isLiveVerified = false }) => {
  // Truthful availability: Never display an unverified charger as available
  let label = status || 'Availability unknown';
  if (!isLiveVerified && (label.toLowerCase() === 'available' || label.toLowerCase() === 'unknown')) {
    label = 'Availability unknown';
  } else if (label.toLowerCase() === 'unmonitored') {
    label = 'Unmonitored';
  }

  const norm = label.toLowerCase();
  let className = 'badge-maintenance';

  if (norm === 'available' && isLiveVerified) {
    className = 'badge-available';
  } else if (norm === 'in use') {
    className = 'badge-inuse';
  } else if (norm === 'offline') {
    className = 'badge-offline';
  } else {
    className = 'badge-offline';
  }

  return (
    <span className={`badge ${className}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {label}
    </span>
  );
};

export const ConnectorBadge = ({ type, powerKW }) => {
  return (
    <span className="badge badge-connector">
      {type}
      {powerKW ? ` • ${powerKW}kW` : ''}
    </span>
  );
};

export const RecordNoticeBadge = ({ label = 'Catalog Record' }) => {
  return (
    <span className="badge badge-maintenance">
      {label}
    </span>
  );
};
