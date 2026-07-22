import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/environment.js';
import { createSessionMiddleware } from './config/session.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
<<<<<<< HEAD
import { publicationRouter } from './routes/publication.routes.js';
import { adminPublicationApiRouter } from './routes/admin-publication-api.routes.js';
import { adminKingdomApiRouter } from './routes/admin-kingdom-api.routes.js';
import { kingdomRouter } from './routes/kingdom.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { renderRobots, renderSitemap } from './controllers/seo.controller.js';
=======
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function staticOptions({ immutable = false, maxAge = '1h' } = {}) {
  return {
    fallthrough: true,
    index: false,
    immutable,
    maxAge,
    setHeaders(response) {
      response.setHeader('X-Content-Type-Options', 'nosniff');
    }
  };
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy);

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
<<<<<<< HEAD
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", 'https://www.youtube.com', 'https://player.vimeo.com'],
=======
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: env.isProduction ? [] : null
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

<<<<<<< HEAD
  app.use(express.json({ limit: '2mb', strict: true }));
  app.use(express.urlencoded({ extended: false, limit: '250kb' }));
  app.use(createSessionMiddleware());

  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminPublicationApiRouter);
  app.use('/api/admin', adminKingdomApiRouter);
  app.use('/adm', adminRouter);
  app.use(publicationRouter);
  app.use(kingdomRouter);
=======
  app.use(express.json({ limit: '10kb', strict: true }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));
  app.use(createSessionMiddleware());

  app.use('/api/auth', authRouter);
  app.use('/adm', adminRouter);
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e

  app.use('/assets', express.static(path.join(currentDirectory, 'assets'), staticOptions({ immutable: true, maxAge: '7d' })));
  app.use('/styles', express.static(path.join(currentDirectory, 'styles'), staticOptions({ maxAge: '1d' })));
  app.use('/js', express.static(path.join(currentDirectory, 'js'), staticOptions({ maxAge: '1h' })));
  app.use('/functions', express.static(path.join(currentDirectory, 'functions'), staticOptions({ maxAge: '1h' })));
  app.use('/data', express.static(path.join(currentDirectory, 'data'), staticOptions({ maxAge: '1h' })));
  app.use('/pages', express.static(path.join(currentDirectory, 'pages'), staticOptions({ maxAge: '10m' })));

  app.get(['/', '/index.html'], (request, response) => {
    response.sendFile(path.join(currentDirectory, 'index.html'));
  });
<<<<<<< HEAD
  app.get('/robots.txt', renderRobots);
  app.get('/sitemap.xml', renderSitemap);
=======
  app.get('/robots.txt', (request, response) => response.sendFile(path.join(currentDirectory, 'robots.txt')));
  app.get('/sitemap.xml', (request, response) => response.sendFile(path.join(currentDirectory, 'sitemap.xml')));
>>>>>>> 980f02e005ec0054436948c190aa1947f401cb2e
  app.get('/README.md', (request, response) => response.sendFile(path.join(currentDirectory, 'README.md')));
  app.get('/health', (request, response) => response.json({ status: 'ok' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
