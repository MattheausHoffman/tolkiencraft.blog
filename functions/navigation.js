import { getBasePath, getCurrentPage } from './utilities.js';
import { SITE_CONFIG } from '../js/config.js';

const NAV_ITEMS = [
  ['home', 'Início', 'index.html'],
  ['como-jogar', 'Como jogar', 'pages/como-jogar.html'],
  ['reinos', 'Reinos', 'pages/reinos.html'],
  ['mapa', 'Mapa', 'pages/mapa.html'],
  ['eventos', 'Eventos', 'pages/eventos.html'],
  ['publicacoes', 'Publicações', 'pages/publicacoes.html'],
  ['regras', 'Regras', 'pages/regras.html'],
  ['comunidade', 'Comunidade', 'pages/comunidade.html']
];

function link(base, path) {
  return `${base}${path}`;
}

export function mountLayout() {
  const base = getBasePath();
  const currentPage = getCurrentPage();
  const header = document.querySelector('[data-site-header]');
  const footer = document.querySelector('[data-site-footer]');

  if (header) {
    const navMarkup = NAV_ITEMS.map(([id, label, path]) => {
      const current = id === currentPage;
      return `<li><a href="${link(base, path)}" ${current ? 'aria-current="page"' : ''}>${label}</a></li>`;
    }).join('');

    header.innerHTML = `
      <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div class="site-header__inner container">
        <a class="brand" href="${link(base, 'index.html')}" aria-label="${SITE_CONFIG.brand.name}, página inicial">
          <img src="${link(base, 'assets/icons/favicon.svg')}" width="42" height="42" alt="">
          <span><strong>${SITE_CONFIG.brand.name}</strong><small>Beleriand em Minecraft</small></span>
        </a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">
          <span class="sr-only">Abrir menu</span>
          <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
        <nav id="site-nav" class="site-nav" aria-label="Navegação principal">
          <ul>${navMarkup}</ul>
          <div class="site-nav__actions">
            <a class="button button--small" href="${link(base, 'pages/como-jogar.html')}">Jogar agora</a>
            <a class="button button--small admin-access-button" href="${link(base, 'adm/login')}">Login administrativo</a>
          </div>
        </nav>
      </div>`;
  }

  if (footer) {
    footer.innerHTML = `
      <div class="container footer-grid">
        <div>
          <a class="brand brand--footer" href="${link(base, 'index.html')}">
            <img src="${link(base, 'assets/icons/favicon.svg')}" width="38" height="38" alt="">
            <span><strong>${SITE_CONFIG.brand.name}</strong><small>${SITE_CONFIG.brand.tagline}</small></span>
          </a>
          <p class="footer-note">Portal dinâmico em HTML, CSS, JavaScript, Node.js e MySQL. Minecraft é uma marca da Mojang. TolkienCraft é um projeto de fã independente.</p>
        </div>
        <div>
          <h2 class="footer-title">Explorar</h2>
          <ul class="footer-links">
            <li><a href="${link(base, 'pages/como-jogar.html')}">Como jogar</a></li>
            <li><a href="${link(base, 'pages/reinos.html')}">Raças e reinos</a></li>
            <li><a href="${link(base, 'pages/regras.html')}">Regras</a></li>
            <li><a href="${link(base, 'pages/publicacoes.html')}">Publicações</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer-title">Comunidade</h2>
          <ul class="footer-links">
            <li><a href="${SITE_CONFIG.community.discord}" target="_blank" rel="noopener noreferrer">Discord</a></li>
            <li><a href="${SITE_CONFIG.community.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="mailto:${SITE_CONFIG.community.email}">${SITE_CONFIG.community.email}</a></li>
            <li><a href="${link(base, 'adm/login')}">Administração</a></li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom"><span>© <span data-current-year></span> ${SITE_CONFIG.brand.name}</span><a href="${link(base, 'README.md')}">Documentação do projeto</a></div>`;
  }

  bindMobileNavigation();
}

function bindMobileNavigation() {
  const button = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
}
