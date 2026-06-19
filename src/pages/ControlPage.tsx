import { ArrowDown, ArrowUp, Pause, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { confirmAction } from '../components/ConfirmDialog';
import { COMMAND_DESCRIPTIONS, COMMAND_LABELS } from '../constants/commands';
import { useAppStore } from '../store/useAppStore';
import type { CommandCode } from '../types';

const commandButtons: Array<{ command: CommandCode; icon: React.ComponentType<{ className?: string }>; tone: string; layout: string; variant?: 'main' | 'normal' | 'critical' }> = [
  { command: 'ss', icon: ArrowUp, tone: 'bg-emerald-700 hover:bg-emerald-800', layout: 'col-span-2', variant: 'main' },
  { command: 'cc', icon: Play, tone: 'bg-field-900 hover:bg-black', layout: '', variant: 'normal' },
  { command: 'pp', icon: Pause, tone: 'bg-amber-600 hover:bg-amber-700', layout: '', variant: 'normal' },
  { command: 'dd', icon: ArrowDown, tone: 'bg-sky-700 hover:bg-sky-800', layout: 'col-span-2', variant: 'main' },
  { command: 'xx', icon: ShieldAlert, tone: 'bg-steel hover:bg-slate-800', layout: '', variant: 'critical' },
  { command: 'rr', icon: RotateCcw, tone: 'bg-safety hover:bg-red-800', layout: '', variant: 'critical' },
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

      <section className="controller-panel">
        {commandButtons.map(({ command, icon: Icon, tone, layout, variant }) => {
          const label = command === 'xx' ? settings.extraActionLabel : COMMAND_LABELS[command];
          return (
            <button
              key={command}
              className={`control-button ${tone} ${layout} ${variant === 'main' ? 'control-button-main' : ''} ${variant === 'critical' ? 'control-button-critical' : ''}`}
              disabled={!canSend || busyCommand === command}
              onClick={() => void handleCommand(command)}
              aria-label={`${label} comando ${command}`}
            >
              <span className="grid place-items-center gap-2">
                <Icon className={`${variant === 'main' ? 'h-12 w-12' : 'h-9 w-9'} shrink-0`} />
                <span className={`${variant === 'main' ? 'text-3xl' : 'text-xl'} font-semibold leading-none`}>{label}</span>
                <span className="rounded bg-white/16 px-2 py-1 font-mono text-xs uppercase tracking-normal">"{command}"</span>
              </span>
            </button>
          );
        })}
      </section>

      <div className="rounded-md border border-field-100 bg-white p-4 text-sm text-field-700">
        Feedback: <strong className="text-field-900">{feedback ?? 'Nenhum comando enviado nesta tela'}</strong>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {commandButtons.map(({ command }) => (
            <span key={command} className="rounded bg-field-50 px-3 py-2">
              "{command}" - {command === 'xx' ? settings.extraActionLabel : COMMAND_DESCRIPTIONS[command]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
