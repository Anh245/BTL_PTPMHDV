import vi from '@/lib/translations';

const StatusBadge = ({ status, type = "train" }) => {
  const styles = {
    station: {
      true: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      false: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
    },
    train: {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      inactive: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
      unknown: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
    },
    schedule: {
      scheduled: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      boarding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      departed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      arrived: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
      delayed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
  };

  const text = {
    station: {
      true: vi.common.active,
      false: vi.common.inactive
    },
    train: {
      active: vi.common.active,
      maintenance: vi.common.maintenance,
      inactive: vi.common.inactive,
      unknown: 'Không xác định'
    },
    schedule: {
      scheduled: vi.dashboard.status.scheduled,
      boarding: vi.dashboard.status.boarding,
      departed: vi.dashboard.status.departed,
      arrived: vi.dashboard.status.arrived,
      delayed: vi.dashboard.status.delayed,
      cancelled: vi.dashboard.status.cancelled
    },
  };

  const statusKey = String(status);
  const styleClass = styles[type]?.[statusKey] || styles.train.unknown;
  const statusText = text[type]?.[statusKey] || 'Không xác định';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styleClass}`}>
      {statusText}
    </span>
  );
};

export default StatusBadge;
