import {
  env,
  validateDatabaseConfiguration
} from '../config/environment.js';
import { bootstrapDatabase } from './bootstrap.js';
import { verifyDatabaseConnection } from './connection.js';
import { isTransientDatabaseError } from './errors.js';

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function initializeDatabase({
  bootstrap = bootstrapDatabase,
  verify = verifyDatabaseConnection,
  retryDelaysMs = [1_000, 3_000, 6_000],
  sleep = wait,
  logger = console
} = {}) {
  validateDatabaseConfiguration(env.database, env.isProduction);

  const maxAttempts = retryDelaysMs.length + 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await bootstrap();
      await verify();
      return;
    } catch (error) {
      const retryDelay = retryDelaysMs[attempt - 1];
      if (!isTransientDatabaseError(error) || retryDelay === undefined) throw error;

      logger.warn(
        `Banco indisponível (${error.code}). Tentativa ${attempt + 1}/${maxAttempts} em ${retryDelay} ms.`
      );
      await sleep(retryDelay);
    }
  }
}
