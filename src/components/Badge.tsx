import { colorClasses } from "@/lib/constants";

export function Badge({
  label,
  color,
  className = "",
}: {
  label: string;
  color: string;
  className?: string;
}) {
  const c = colorClasses(color);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}
