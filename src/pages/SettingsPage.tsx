import { Save, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { confirmAction } from '../components/ConfirmDialog';
import { useAppStore } from '../store/useAppStore';
import type { AppSettings } from '../types';

export function SettingsPage() {
  const { settings, saveSettings, sync, clearHistory } = useAppStore();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [message, setMessage] = useState('');

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    await saveSettings(draft);
    setMessage('Configuracoes salvas.');
  }

  async function clear() {
    if (!confirmAction('Tem certeza que deseja limpar o historico local?')) return;
    await clearHistory();
    setMessage('Historico local limpo.');
  }

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Configuracoes</h1>
        <p className="mt-1 text-sm text-field-700">UUIDs BLE, comportamento de seguranca, modo demonstracao e sincronizacao.</p>
      </section>

      <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="field-label">
            Nome do aparelho
            <input className="field-input" value={draft.deviceName} onChange={(event) => update('deviceName', event.target.value)} />
          </label>
          <label className="field-label">
            Prefixo do nome BLE
            <input className="field-input" value={draft.bleNamePrefix} onChange={(event) => update('bleNamePrefix', event.target.value)} placeholder="Ex.: Pump, HM-10, ESP32" />
          </label>
          <label className="field-label">
            Nome da acao "xx"
            <input className="field-input" value={draft.extraActionLabel} onChange={(event) => update('extraActionLabel', event.target.value)} />
          </label>
          <label className="field-label md:col-span-2">
            UUID do servico BLE
            <input className="field-input font-mono" value={draft.bleServiceUuid} onChange={(event) => update('bleServiceUuid', event.target.value)} />
          </label>
          <label className="field-label md:col-span-2">
            UUID da characteristic BLE
            <input className="field-input font-mono" value={draft.bleCharacteristicUuid} onChange={(event) => update('bleCharacteristicUuid', event.target.value)} />
          </label>
          <label className="field-label md:col-span-2">
            API base para sincronizacao
            <input className="field-input" value={draft.apiBaseUrl} onChange={(event) => update('apiBaseUrl', event.target.value)} placeholder="https://api.exemplo.com" />
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="toggle-row">
            <input type="checkbox" checked={draft.confirmReset} onChange={(event) => update('confirmReset', event.target.checked)} />
            Exigir confirmacao para Reset
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={draft.confirmExtraAction} onChange={(event) => update('confirmExtraAction', event.target.checked)} />
            Exigir confirmacao para Acao Extra
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={draft.demoMode} onChange={(event) => update('demoMode', event.target.checked)} />
            Modo demonstracao
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <button className="primary-button" onClick={() => void save()}>
            <Save className="h-4 w-4" />
            Salvar
          </button>
          <button className="secondary-button" onClick={() => void sync()}>
            <UploadCloud className="h-4 w-4" />
            Forcar sincronizacao
          </button>
          <button className="danger-button" onClick={() => void clear()}>
            <Trash2 className="h-4 w-4" />
            Limpar historico local
          </button>
        </div>
        {message && <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      </section>

      <section className="rounded-md border border-field-100 bg-white p-5 text-sm text-field-700 shadow-sm">
        Para o seletor do Chrome listar o aparelho, o equipamento precisa estar anunciando BLE. Se o nome aparecer diferente, deixe o prefixo vazio para buscar qualquer dispositivo BLE proximo. Os UUIDs atuais sao placeholders; substitua pelos UUIDs reais do firmware/equipamento antes do envio de comandos.
      </section>
    </div>
  );
}
