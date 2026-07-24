import { databasePool } from './connection.js';
import { formatDatabaseError } from './errors.js';
import { initializeDatabase } from './startup.js';

try {
  await initializeDatabase();
  console.info('Banco de dados inicializado com sucesso.');
} catch (error) {
  console.error(`Falha ao inicializar o banco de dados: ${formatDatabaseError(error)}`);
  process.exitCode = 1;
} finally {
  await databasePool.end();
}
