import { statusBadgeClass } from '../utils/helpers';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const formatted = status.replace(/_/g, ' ');
  return (
    <span className={statusBadgeClass(status)}>
      {formatted}
    </span>
  );
}
