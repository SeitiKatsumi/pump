import type { ReactNode } from 'react';

export function StatCard({ label, value, detail, icon }: { label: string; value: ReactNode; detail?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-md border border-field-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-field-700">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-field-900">{value}</p>
          {detail && <p className="mt-2 text-xs text-field-700">{detail}</p>}
        </div>
        {icon && <div className="grid h-10 w-10 place-items-center rounded-md bg-field-100 text-field-900">{icon}</div>}
      </div>
    </div>
  );
}
