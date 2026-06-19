import { AlertTriangle, Clock, Database, RadioTower, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatCard } from '../components/StatCard';
import { COMMAND_LABELS } from '../constants/commands';
import { buildDashboardSummary } from '../services/historyService';
import { useAppStore } from '../store/useAppStore';
import type { DashboardSummary } from '../types';
import { formatDateTime, formatDuration } from '../utils/format';

export function AdminPage() {
  const { commands, sessions, user } = useAppStore();
  const [summary, setSummary] = useState<DashboardSummary | undefined>();

  useEffect(() => {
    buildDashboardSummary().then(setSummary);
  }, [commands, sessions]);

  const commandsByType = useMemo(() => {
    return Object.entries(COMMAND_LABELS).map(([command, label]) => ({
      command: label,
      total: commands.filter((event) => event.command === command).length,
    }));
  }, [commands]);

  const usageByDay = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((session) => {
      const key = new Date(session.startedAt).toLocaleDateString('pt-BR');
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([day, total]) => ({ day, total })).reverse();
  }, [sessions]);

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-900">
        Dashboard administrativo restrito a usuarios com perfil administrador.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-field-700">Indicadores para consulta de uso, falhas e sincronizacao.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de utilizacoes" value={summary?.totalSessions ?? 0} detail={`Ultimo uso: ${formatDateTime(summary?.lastUse)}`} icon={<RadioTower className="h-5 w-5" />} />
        <StatCard label="Total de usuarios" value={summary?.totalUsers ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total de dispositivos" value={summary?.totalDevices ?? 0} icon={<Database className="h-5 w-5" />} />
        <StatCard label="Tempo acumulado" value={formatDuration(summary?.accumulatedSeconds)} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Comando mais usado" value={summary?.mostUsedCommand === 'none' ? 'Nenhum' : COMMAND_LABELS[summary?.mostUsedCommand ?? 'ss']} />
        <StatCard label="Erros de conexao/envio" value={summary?.connectionErrors ?? 0} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Sessoes nao sincronizadas" value={summary?.unsyncedSessions ?? 0} />
        <StatCard label="Tempo medio por sessao" value={formatDuration(Math.round((summary?.accumulatedSeconds ?? 0) / Math.max(summary?.totalSessions ?? 1, 1)))} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="chart-panel">
          <h2 className="chart-title">Uso por dia</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={usageByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#2f4050" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="chart-panel">
          <h2 className="chart-title">Comandos por tipo</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={commandsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="command" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2f9e44" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
