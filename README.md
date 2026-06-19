# BLE Control Center

PWA responsiva para controlar um aparelho mecanico via Bluetooth Low Energy usando comandos em string, com modo demonstracao, historico local, sessoes de uso, dashboard administrativo e sincronizacao preparada para API REST/Supabase.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Web Bluetooth API
- IndexedDB com `idb`
- Recharts
- Service Worker e manifest PWA

## Como rodar

```bash
pnpm install
pnpm dev
```

Build de producao:

```bash
pnpm build
```

## Deploy no CapRover

O repositorio inclui `captain-definition`, `Dockerfile` e `nginx.conf`. No CapRover, aponte o app para o repositorio e use deploy por Dockerfile. Nao e necessario configurar Diretorio Persistente para esta PWA estatica.

## Instalacao PWA e tela cheia

O manifest usa `display: "fullscreen"` e `display_override` para abrir como app em tela cheia quando instalado. A tela inicial tambem captura o evento `beforeinstallprompt` em navegadores compativeis e mostra o botao `Instalar app`.

No Android Chrome/Edge, o navegador pode demorar alguns segundos ou exigir uma visita valida em HTTPS antes de mostrar o prompt de instalacao. Se o botao ainda nao aparecer, use o menu do navegador e escolha `Instalar app` ou `Adicionar a tela inicial`.

## Configuracao BLE

Os UUIDs em `src/services/settingsService.ts` sao placeholders:

```ts
bleServiceUuid: "00000000-0000-0000-0000-000000000000"
bleCharacteristicUuid: "00000000-0000-0000-0000-000000000000"
```

Substitua pelos UUIDs reais do firmware/equipamento na tela Configuracoes ou no codigo. O envio usa `TextEncoder` para transformar strings como `"ss"` em bytes antes de escrever na characteristic BLE.

## Teste em modo demo

O modo demo vem ativo por padrao. Nesse modo:

- A conexao Bluetooth e simulada.
- Os comandos sao registrados normalmente.
- Historico, dashboard e CSV funcionam sem hardware.
- A sincronizacao marca registros como pendentes se nenhuma API estiver configurada.

## Teste no Android

1. Abra o app no Chrome ou Edge Android.
2. Desative o modo demo em Configuracoes.
3. Configure os UUIDs reais do equipamento.
4. Toque em Conectar ao aparelho e selecione o dispositivo BLE.
5. Envie comandos pela tela Controle.

## Limitacoes no iOS

Safari/iOS nao oferece suporte oficial ao Web Bluetooth para PWA. Em iPhone/iPad, pode ser necessario empacotar a PWA como app hibrido com Capacitor e usar um plugin BLE nativo, ou usar um navegador/app intermediario com suporte BLE.

## Sincronizacao em nuvem

A tela Configuracoes aceita uma `API base`. Os servicos esperam endpoints REST:

- `POST /users`
- `POST /devices`
- `POST /sessions`
- `POST /commands`
- `GET /history`
- `GET /dashboard/summary`

Enquanto a API nao estiver configurada, registros ficam em IndexedDB com `synced: false`.

## Banco de dados sugerido

Veja [docs/database-schema.sql](docs/database-schema.sql) para uma modelagem PostgreSQL/Supabase com `users`, `devices`, `sessions`, `command_logs` e `app_settings`.

## Preparacao para Capacitor

A camada BLE esta isolada em `src/services/bleService.ts`. Para uma futura versao Android/iOS:

1. Adicione Capacitor ao projeto.
2. Troque internamente as funcoes de `bleService.ts` por um plugin BLE nativo.
3. Preserve as assinaturas `connectDevice`, `disconnectDevice` e `sendCommand`.
4. Mantenha historico, sessoes e sincronizacao sem alteracao nas telas.
