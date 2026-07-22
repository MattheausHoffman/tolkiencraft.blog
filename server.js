import { createApp } from './app.js';
import { env } from './config/environment.js';
import { bootstrapDatabase } from './database/bootstrap.js';
import { databasePool, verifyDatabaseConnection } from './database/connection.js';

let server;

async function startServer() {
  await bootstrapDatabase();
  await verifyDatabaseConnection();

  const app = createApp();
  server = app.listen(env.port, () => {
    console.info(`TolkienCraft disponível em http://localhost:${env.port}`);
  });
}

async function shutdown(signal) {
  console.info(`${signal} recebido. Encerrando aplicação...`);

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
  console.error('Não foi possível iniciar o servidor:', error);
  await databasePool.end().catch(() => {});
  process.exit(1);
});
