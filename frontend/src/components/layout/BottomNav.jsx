import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Car, User, WifiOff } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export const BottomNav = () => {
  const location = useLocation();
  const { savedStationIds } = useUser();

  const navItems = [
    { to: '/home', label: 'Explore', icon: Home },
    { to: '/saved', label: 'Saved', icon: Heart, count: savedStationIds.length },
    { to: '/vehicle-select', label: 'Vehicle', icon: Car },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/offline', label: 'Offline', icon: WifiOff }
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-link ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {item.count !== undefined && item.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: 'var(--primary-800)',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '0 4px',
                    fontSize: '0.65rem'
                  }}
                >
                  {item.count}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
