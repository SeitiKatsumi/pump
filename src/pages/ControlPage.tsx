import { ArrowDown, ArrowUp, Pause, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { confirmAction } from '../components/ConfirmDialog';
import { COMMAND_DESCRIPTIONS, COMMAND_LABELS } from '../constants/commands';
import { useAppStore } from '../store/useAppStore';
import type { CommandCode } from '../types';

const commandButtons: Array<{ command: CommandCode; icon: React.ComponentType<{ className?: string }>; tone: string }> = [
  { command: 'ss', icon: ArrowUp, tone: 'bg-emerald-700 hover:bg-emerald-800' },
  { command: 'dd', icon: ArrowDown, tone: 'bg-sky-700 hover:bg-sky-800' },
  { command: 'cc', icon: Play, tone: 'bg-field-900 hover:bg-black' },
  { command: 'pp', icon: Pause, tone: 'bg-amber-600 hover:bg-amber-700' },
  { command: 'xx', icon: ShieldAlert, tone: 'bg-steel hover:bg-slate-800' },
  { command: 'rr', icon: RotateCcw, tone: 'bg-safety hover:bg-red-800' },
];

export function ControlPage() {
  const { sendCommand, connectionStatus, activeSession, settings, feedback } = useAppStore();
  const [busyCommand, setBusyCommand] = useState<CommandCode | undefined>();
  const canSend = connectionStatus === 'connected' && !!activeSession;

  async function handleCommand(command: CommandCode) {
    const label = command === 'xx' ? settings.extraActionLabel : COMMAND_LABELS[command];
    if (command === 'rr' && settings.confirmReset && !confirmAction('Tem certeza que deseja enviar Reset?')) return;
    if (command === 'xx' && settings.confirmExtraAction && !confirmAction(`Tem certeza que deseja enviar ${label}?`)) return;
    setBusyCommand(command);
    try {
      await sendCommand(command, label);
    } finally {
      setBusyCommand(undefined);
    }
  }

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Controle</h1>
            <p className="mt-1 text-sm text-field-700">Botoes grandes para operacao em celular, com registro completo por comando.</p>
          </div>
          <span className={`rounded px-3 py-2 text-sm font-semibold ${canSend ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'}`}>
            {canSend ? 'Pronto para enviar' : 'Conecte uma sessao'}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {commandButtons.map(({ command, icon: Icon, tone }) => {
          const label = command === 'xx' ? settings.extraActionLabel : COMMAND_LABELS[command];
          return (
            <button
              key={command}
              className={`control-button ${tone}`}
              disabled={!canSend || busyCommand === command}
              onClick={() => void handleCommand(command)}
            >
              <Icon className="h-8 w-8" />
              <span className="text-2xl font-semibold">{label}</span>
              <span className="text-sm opacity-90">"{command}" - {COMMAND_DESCRIPTIONS[command]}</span>
            </button>
          );
        })}
      </section>

      <div className="rounded-md border border-field-100 bg-white p-4 text-sm text-field-700">
        Feedback: <strong className="text-field-900">{feedback ?? 'Nenhum comando enviado nesta tela'}</strong>
      </div>
    </div>
  );
}
