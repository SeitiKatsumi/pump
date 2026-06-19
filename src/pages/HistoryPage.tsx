import { Download, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COMMAND_LABELS } from '../constants/commands';
import { useAppStore } from '../store/useAppStore';
import type { CommandCode } from '../types';
import { formatDateTime, formatDuration, toCsv } from '../utils/format';

export function HistoryPage() {
  const { sessions, commands } = useAppStore();
  const [userFilter, setUserFilter] = useState('');
  const [commandFilter, setCommandFilter] = useState<'all' | CommandCode>('all');
  const [successFilter, setSuccessFilter] = useState<'all' | 'success' | 'error'>('all');
  const [selectedSession, setSelectedSession] = useState<string | undefined>(sessions[0]?.id);

  const filteredCommands = useMemo(() => {
    return commands.filter((command) => {
      if (userFilter && !command.userName.toLowerCase().includes(userFilter.toLowerCase())) return false;
      if (commandFilter !== 'all' && command.command !== commandFilter) return false;
      if (successFilter === 'success' && !command.success) return false;
      if (successFilter === 'error' && command.success) return false;
      return true;
    });
  }, [commandFilter, commands, successFilter, userFilter]);

  const selectedTimeline = filteredCommands.filter((command) => command.sessionId === selectedSession).reverse();

  function exportCsv() {
    const csv = toCsv(filteredCommands.map((command) => ({ ...command })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-ble-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Historico</h1>
            <p className="mt-1 text-sm text-field-700">Filtros locais, sessoes e timeline dos comandos enviados.</p>
          </div>
          <button className="secondary-button" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="field-label">
            Usuario
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-field-500" />
              <input className="field-input pl-9" value={userFilter} onChange={(event) => setUserFilter(event.target.value)} placeholder="Filtrar" />
            </div>
          </label>
          <label className="field-label">
            Comando
            <select className="field-input" value={commandFilter} onChange={(event) => setCommandFilter(event.target.value as 'all' | CommandCode)}>
              <option value="all">Todos</option>
              {Object.entries(COMMAND_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <label className="field-label">
            Status
            <select className="field-input" value={successFilter} onChange={(event) => setSuccessFilter(event.target.value as 'all' | 'success' | 'error')}>
              <option value="all">Todos</option>
              <option value="success">Sucesso</option>
              <option value="error">Erro</option>
            </select>
          </label>
          <label className="field-label">
            Sessao
            <select className="field-input" value={selectedSession ?? ''} onChange={(event) => setSelectedSession(event.target.value)}>
              <option value="">Selecione</option>
              {sessions.map((session) => <option key={session.id} value={session.id}>{formatDateTime(session.startedAt)}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Sessoes</h2>
          <div className="mt-4 space-y-3">
            {sessions.map((session) => (
              <button key={session.id} onClick={() => setSelectedSession(session.id)} className={`w-full rounded-md border p-4 text-left ${selectedSession === session.id ? 'border-field-900 bg-field-50' : 'border-field-100 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{session.userName}</p>
                    <p className="text-sm text-field-700">{session.deviceName}</p>
                  </div>
                  <span className="rounded bg-field-100 px-2 py-1 text-xs font-semibold">{session.finalStatus ?? 'ativa'}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <span>{formatDuration(session.durationSeconds)}</span>
                  <span>{session.totalCommands} comandos</span>
                  <span>{session.synced ? 'Sincronizada' : 'Pendente'}</span>
                </div>
              </button>
            ))}
            {!sessions.length && <p className="text-sm text-field-700">Nenhuma sessao registrada.</p>}
          </div>
        </section>

        <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <div className="mt-4 space-y-3">
            {selectedTimeline.map((event) => (
              <div key={event.id} className="rounded-md border border-field-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{formatDateTime(event.timestamp)}</p>
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${event.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {event.success ? 'Sucesso' : 'Erro'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-field-700">{event.actionLabel} - "{event.command}"</p>
                {event.errorMessage && <p className="mt-1 text-sm text-red-700">{event.errorMessage}</p>}
              </div>
            ))}
            {!selectedTimeline.length && <p className="text-sm text-field-700">Selecione uma sessao com comandos registrados.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
