import { env } from '../config/environment.js';
import { listPublications } from '../models/publication.model.js';

function escapeXml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function renderSitemap(request, response) {
  const publications = await listPublications({ includeDrafts: false, limit: 500, sort: 'order_asc' });
  const staticPaths = [
    '/', '/pages/como-jogar.html', '/pages/reinos.html', '/pages/mapa.html',
    '/pages/eventos.html', '/pages/publicacoes.html', '/pages/regras.html', '/pages/comunidade.html'
  ];
  const urls = [
    ...staticPaths.map((pathname) => ({ loc: `${env.siteUrl}${pathname}`, lastmod: null })),
    ...publications.map((publication) => ({
      loc: `${env.siteUrl}/publicacoes/${publication.slug}`,
      lastmod: publication.updatedAt ? new Date(publication.updatedAt).toISOString() : null
    }))
  ];
  const entries = urls.map((url) => `<url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}</url>`).join('');
  response.type('application/xml').set('Cache-Control', 'public, max-age=300').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`);
}

export function renderRobots(request, response) {
  response.type('text/plain').set('Cache-Control', 'public, max-age=300').send([
    'User-agent: *',
    'Disallow: /adm/',
    'Disallow: /api/',
    'Allow: /',
    '',
    `Sitemap: ${env.siteUrl}/sitemap.xml`
  ].join('\n'));
}
