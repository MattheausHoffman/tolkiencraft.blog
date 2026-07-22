import { bootstrapDatabase } from './bootstrap.js';
import { databasePool, verifyDatabaseConnection } from './connection.js';

try {
  await bootstrapDatabase();
  await verifyDatabaseConnection();
  console.info('Banco de dados inicializado com sucesso.');
} catch (error) {
  console.error('Falha ao inicializar o banco de dados:', error.message);
  process.exitCode = 1;
} finally {
  await databasePool.end();
}
