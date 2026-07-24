import { createApp } from './app.js';
import { env } from './config/environment.js';
import { databasePool } from './database/connection.js';
import { formatDatabaseError } from './database/errors.js';
import { initializeDatabase } from './database/startup.js';
import {
  startEventMaintenance,
  stopEventMaintenance
} from './services/event-maintenance.service.js';

let server;

async function startServer() {
  console.info(`Ambiente: ${env.nodeEnv}`);
  console.info(`Banco configurado: ${env.database.configured ? 'sim' : 'não'}`);
  console.info(`Host do banco: ${env.database.host ? 'configurado' : 'não configurado'}`);
  console.info(`Porta do banco: ${env.database.port}`);

  await initializeDatabase();
  console.info('Banco de dados inicializado e conexão verificada.');
  await startEventMaintenance();

  const app = createApp();
  await new Promise((resolve, reject) => {
    server = app.listen(env.port, '0.0.0.0', resolve);
    server.once('error', reject);
  });
  console.info(`Servidor iniciado na porta ${env.port}.`);
}

async function shutdown(signal) {
  console.info(`${signal} recebido. Encerrando aplicação...`);
  stopEventMaintenance();

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await databasePool.end();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT').catch((error) => {
  console.error(error);
  process.exit(1);
}));
process.on('SIGTERM', () => shutdown('SIGTERM').catch((error) => {
  console.error(error);
  process.exit(1);
}));

startServer().catch(async (error) => {
  console.error(`Não foi possível iniciar o servidor: ${formatDatabaseError(error)}`);
  await databasePool.end().catch(() => {});
  process.exit(1);
});
