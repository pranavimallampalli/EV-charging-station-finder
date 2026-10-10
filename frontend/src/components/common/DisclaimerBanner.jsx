import { Info } from 'lucide-react';

export const DisclaimerBanner = ({ message, type = 'info' }) => {
  const defaultMessage =
    'Demonstration Data Notice: Station records, specifications, and availability statuses represent illustrative sample data for hackathon evaluation and are not live verified IoT feeds.';

  return (
    <div
      className={`notice-banner ${type === 'alert' ? 'notice-banner-alert' : ''}`}
      role="status"
    >
      <Info size={18} style={{ flexShrink: 0 }} />
      <span>{message || defaultMessage}</span>
    </div>
  );
};
