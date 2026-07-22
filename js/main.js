import { mountLayout } from '../functions/navigation.js';
import { bindCopyButtons } from '../functions/clipboard.js';
import { renderServerStatus } from '../functions/server-status.js';
import { bindImageModal } from '../functions/modal.js';
import { getCurrentPage, setCurrentYear } from '../functions/utilities.js';

async function loadPageModule(page) {
  const loaders = {
<<<<<<< HEAD
    home: () => import('./pages/home-publications.js').then((module) => module.initHomePublications()),
    reinos: () => import('./pages/reinos.js').then((module) => module.initKingdomsPage()),
    regras: () => import('./pages/regras.js').then((module) => module.initRulesPage()),
    eventos: () => import('./pages/eventos.js').then((module) => module.initEventsPage()),
    publicacoes: () => import('./pages/publicacoes.js').then((module) => module.initPublicationsPage())
=======
    reinos: () => import('./pages/reinos.js').then((module) => module.initKingdomsPage()),
    regras: () => import('./pages/regras.js').then((module) => module.initRulesPage()),
    eventos: () => import('./pages/eventos.js').then((module) => module.initEventsPage())
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
  };
  if (loaders[page]) await loaders[page]();
}

async function init() {
  mountLayout();
  setCurrentYear();
  bindCopyButtons();
  bindImageModal();
  await renderServerStatus();
  await loadPageModule(getCurrentPage());
}

init().catch((error) => {
  console.error('Não foi possível inicializar o site:', error);
});
