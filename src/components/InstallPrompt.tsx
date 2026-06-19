import { Download, Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';

function isStandaloneDisplay() {
  return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());
    setFullscreen(!!document.fullscreenElement);

    const onBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    const onFullscreenChange = () => setFullscreen(!!document.fullscreenElement);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
      setInstallEvent(null);
    }
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  }

  const canInstall = !installed && !!installEvent;
  const canToggleFullscreen = !fullscreen && document.fullscreenEnabled;

  if (!canInstall && !canToggleFullscreen && installed) return null;

  return (
    <section className="rounded-md border border-field-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Instalacao do PWA</h2>
          <p className="mt-1 text-sm text-field-700">
            Instale no Android para abrir como app em tela cheia, fora da barra do navegador.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {canInstall && (
            <button className="primary-button" onClick={() => void installApp()}>
              <Download className="h-4 w-4" />
              Instalar app
            </button>
          )}
          {canToggleFullscreen && (
            <button className="secondary-button" onClick={() => void toggleFullscreen()}>
              <Maximize2 className="h-4 w-4" />
              Tela cheia
            </button>
          )}
        </div>
      </div>
      {!installEvent && !installed && (
        <p className="mt-3 rounded bg-field-50 p-3 text-sm text-field-700">
          Se o botao de instalacao ainda nao apareceu, use o menu do navegador e escolha Instalar app ou Adicionar a tela inicial.
        </p>
      )}
    </section>
  );
}
