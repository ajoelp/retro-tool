type AlertBadgeProps = {
  count: number;
  show?: boolean;
};
export function AlertBadge({ count, show }: AlertBadgeProps) {
  if (count <= 0 || !show) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 absolute top-0 right-0 ring-1 ring-white dark:ring-gray-700 -mt-1 -mr-1 z-20">
      {count}
    </span>
  );
}
