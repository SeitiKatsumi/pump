import type { AppSettings, ConnectionStatus } from '../types';

type BluetoothRemoteGATTCharacteristicWithWrite = BluetoothRemoteGATTCharacteristic & {
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
};

let device: BluetoothDevice | undefined;
let server: BluetoothRemoteGATTServer | undefined;
let characteristic: BluetoothRemoteGATTCharacteristicWithWrite | undefined;
let status: ConnectionStatus = 'disconnected';
let demoMode = true;

const PLACEHOLDER_UUID = '00000000-0000-0000-0000-000000000000';

function clean(value: string) {
  return value.trim();
}

function hasRealUuid(value: string) {
  const uuid = clean(value).toLowerCase();
  return uuid.length > 0 && uuid !== PLACEHOLDER_UUID;
}

function ensureSecureBluetoothContext() {
  if (!window.isSecureContext) {
    throw new Error('Web Bluetooth exige HTTPS. Acesse o app pelo dominio HTTPS do CapRover, nao por HTTP.');
  }
}

export function checkBluetoothSupport(): boolean {
  return typeof navigator !== 'undefined' && window.isSecureContext && 'bluetooth' in navigator;
}

export function getConnectionStatus(): ConnectionStatus {
  if (!checkBluetoothSupport() && !demoMode) return 'unsupported';
  return status;
}

export function configureBle(settings: AppSettings) {
  demoMode = settings.demoMode;
}

export async function requestDevice(settings: AppSettings): Promise<BluetoothDevice | { id: string; name: string }> {
  configureBle(settings);
  if (settings.demoMode) {
    status = 'connected';
    return { id: 'demo-device', name: settings.deviceName || 'Aparelho BLE Demo' };
  }
  ensureSecureBluetoothContext();
  if (!checkBluetoothSupport()) {
    status = 'unsupported';
    throw new Error('Este dispositivo/navegador nao suporta conexao Bluetooth BLE via PWA. No iOS pode ser necessario usar uma versao app/hibrida com suporte nativo ao Bluetooth.');
  }
  status = 'searching';
  const optionalServices = [settings.bleServiceUuid].filter(hasRealUuid).map(clean);
  const namePrefix = clean(settings.bleNamePrefix);
  const servicesOption = optionalServices.length ? { optionalServices } : {};
  const options: RequestDeviceOptions = namePrefix
    ? { filters: [{ namePrefix }], ...servicesOption }
    : { acceptAllDevices: true, ...servicesOption };
  device = await navigator.bluetooth.requestDevice(options);
  return device;
}

export async function connectDevice(settings: AppSettings): Promise<{ id: string; name: string }> {
  configureBle(settings);
  if (settings.demoMode) {
    status = 'connected';
    return { id: 'demo-device', name: settings.deviceName || 'Aparelho BLE Demo' };
  }
  const target = device ?? (await requestDevice(settings));
  if (!('gatt' in target) || !target.gatt) throw new Error('Dispositivo BLE sem GATT disponivel.');
  server = await target.gatt.connect();
  if (!hasRealUuid(settings.bleServiceUuid) || !hasRealUuid(settings.bleCharacteristicUuid)) {
    status = 'error';
    throw new Error('Dispositivo selecionado, mas os UUIDs reais do servico e da characteristic ainda precisam ser configurados para enviar comandos.');
  }
  const service = await server.getPrimaryService(clean(settings.bleServiceUuid));
  characteristic = (await service.getCharacteristic(clean(settings.bleCharacteristicUuid))) as BluetoothRemoteGATTCharacteristicWithWrite;
  status = 'connected';
  return { id: target.id, name: target.name || settings.deviceName || 'Aparelho BLE' };
}

export async function disconnectDevice(): Promise<void> {
  if (server?.connected) server.disconnect();
  characteristic = undefined;
  server = undefined;
  status = 'disconnected';
}

export async function sendCommand(command: string): Promise<void> {
  if (demoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    return;
  }
  if (!characteristic) throw new Error('Nenhum equipamento BLE conectado.');
  const data = new TextEncoder().encode(command);
  if (characteristic.writeValueWithoutResponse) {
    await characteristic.writeValueWithoutResponse(data);
  } else {
    await characteristic.writeValue(data);
  }
}

export async function reconnectLastDevice(settings: AppSettings): Promise<{ id: string; name: string } | undefined> {
  configureBle(settings);
  if (settings.demoMode) return connectDevice(settings);
  if (!device) return undefined;
  return connectDevice(settings);
}
