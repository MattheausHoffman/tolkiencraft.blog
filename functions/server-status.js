import { SITE_CONFIG } from '../js/config.js';

function statusLabel(status) {
  return status === 'online' ? 'Servidor aberto' : 'Servidor indisponível';
}

export async function renderServerStatus() {
  const statusNodes = document.querySelectorAll('[data-server-status]');
  const playerNodes = document.querySelectorAll('[data-player-count]');
  let serverState = { status: SITE_CONFIG.server.status, players: null };

  if (SITE_CONFIG.server.statusEndpoint) {
    try {
      const response = await fetch(SITE_CONFIG.server.statusEndpoint, { signal: AbortSignal.timeout(4000) });
      if (response.ok) serverState = { ...serverState, ...(await response.json()) };
    } catch {
      // Mantém o estado configurado quando a API não está disponível.
    }
  }

  statusNodes.forEach((node) => {
    node.textContent = statusLabel(serverState.status);
    node.dataset.status = serverState.status;
  });

  playerNodes.forEach((node) => {
    node.textContent = Number.isFinite(serverState.players) ? String(serverState.players) : 'Consulte no Discord';
  });
}
