import { BluetoothConnected, Cloud, LogOut, Power, Smartphone } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDateTime } from '../utils/format';
import { StatCard } from '../components/StatCard';

export function HomePage() {
  const { user, logout, connect, disconnect, connectionStatus, connectedDevice, activeSession, lastSync, online, feedback, settings } = useAppStore();
  const unsupported = connectionStatus === 'unsupported';

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <section className="rounded-md bg-field-900 p-5 text-white shadow-panel">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-field-100">Sistema instalado e pronto para campo</p>
            <h1 className="mt-2 text-3xl font-semibold">Painel inicial</h1>
            <p className="mt-2 max-w-2xl text-field-100">
              Status da conexao, sessao ativa, sincronizacao e suporte Bluetooth do navegador.
            </p>
          </div>
          <button className="secondary-button bg-white text-field-900" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </section>

      {unsupported && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          Este dispositivo/navegador nao suporta conexao Bluetooth BLE via PWA. No iOS pode ser necessario usar uma versao app/hibrida com suporte nativo ao Bluetooth.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bluetooth" value={connectionStatus} detail={settings.demoMode ? 'Modo demonstracao ativo' : 'Web Bluetooth real'} icon={<BluetoothConnected className="h-5 w-5" />} />
        <StatCard label="Dispositivo" value={connectedDevice?.name ?? 'Nao conectado'} detail={connectedDevice?.bleDeviceId ?? 'Aguardando conexao'} icon={<Smartphone className="h-5 w-5" />} />
        <StatCard label="Ultima sincronizacao" value={formatDateTime(lastSync)} detail={online ? 'Conexao com internet disponivel' : 'Offline: registros pendentes'} icon={<Cloud className="h-5 w-5" />} />
        <StatCard label="Utilizador" value={user?.name ?? 'Sem usuario'} detail={user?.role === 'admin' ? 'Administrador' : 'Usuario comum'} />
      </div>

      <section className="rounded-md border border-field-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Conexao com aparelho</h2>
            <p className="mt-1 text-sm text-field-700">
              Ao conectar, uma nova sessao de uso e aberta automaticamente.
            </p>
          </div>
          {connectionStatus === 'connected' ? (
            <button className="danger-button" onClick={() => void disconnect()}>
              <Power className="h-4 w-4" />
              Desconectar
            </button>
          ) : (
            <button className="primary-button" onClick={() => void connect()}>
              <BluetoothConnected className="h-4 w-4" />
              Conectar ao aparelho
            </button>
          )}
        </div>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <div className="info-row"><span>Status</span><strong>{connectionStatus}</strong></div>
          <div className="info-row"><span>Sessao</span><strong>{activeSession ? 'ativa' : 'sem sessao'}</strong></div>
          <div className="info-row"><span>Feedback</span><strong>{feedback ?? 'Aguardando acao'}</strong></div>
        </div>
      </section>
    </div>
  );
}
