export const StationCardSkeleton = () => {
  return (
    <div className="ui-card station-card" style={{ minHeight: '260px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="skeleton" style={{ height: '24px', width: '70%' }} />
          <div className="skeleton" style={{ height: '24px', width: '24px', borderRadius: '50%' }} />
        </div>
        <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '16px', width: '50%', marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div className="skeleton" style={{ height: '26px', width: '80px', borderRadius: '9999px' }} />
          <div className="skeleton" style={{ height: '26px', width: '70px', borderRadius: '9999px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f0eee8' }}>
        <div className="skeleton" style={{ height: '22px', width: '90px' }} />
        <div className="skeleton" style={{ height: '32px', width: '100px', borderRadius: '8px' }} />
      </div>
    </div>
  );
};
