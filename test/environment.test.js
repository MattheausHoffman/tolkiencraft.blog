import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createDatabaseConnectionOptions,
  createEnvironment,
  resolveDatabaseConfiguration,
  validateDatabaseConfiguration
} from '../config/environment.js';

const COMPLETE_INDIVIDUAL_ENV = Object.freeze({
  DB_HOST: 'mysql.internal',
  DB_PORT: '3307',
  DB_USER: 'app',
  DB_PASSWORD: 'secret',
  DB_NAME: 'tolkiencraft'
});

test('não usa host local como fallback em produção sem variáveis de banco', () => {
  const database = resolveDatabaseConfiguration({}, 'production');

  assert.equal(database.host, undefined);
  assert.equal(database.configured, false);
  assert.throws(
    () => validateDatabaseConfiguration(database, true),
    /DB_HOST\/MYSQLHOST.*DB_USER\/MYSQLUSER.*DB_PASSWORD\/MYSQLPASSWORD.*DB_NAME\/MYSQLDATABASE/
  );
});

test('informa variáveis ausentes quando a configuração de produção está incompleta', () => {
  const database = resolveDatabaseConfiguration({
    DB_HOST: 'mysql.internal',
    DB_USER: 'app'
  }, 'production');

  assert.throws(
    () => validateDatabaseConfiguration(database, true),
    /DB_PASSWORD\/MYSQLPASSWORD, DB_NAME\/MYSQLDATABASE/
  );
});

test('aceita e prioriza DATABASE_URL sobre MYSQL_URL e variáveis individuais', () => {
  const database = resolveDatabaseConfiguration({
    ...COMPLETE_INDIVIDUAL_ENV,
    DATABASE_URL: 'mysql://url_user:url%40pass@database.internal:4406/url_database?ssl=true',
    MYSQL_URL: 'mysql://ignored:ignored@ignored.internal:3306/ignored'
  }, 'production');

  assert.deepEqual({
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
    name: database.name,
    source: database.source
  }, {
    host: 'database.internal',
    port: 4406,
    user: 'url_user',
    password: 'url@pass',
    name: 'url_database',
    source: 'DATABASE_URL'
  });
  assert.equal(database.ssl.rejectUnauthorized, true);
});

test('aceita MYSQL_URL quando DATABASE_URL não foi informada', () => {
  const database = resolveDatabaseConfiguration({
    MYSQL_URL: 'mysql://railway:password@mysql.railway.internal:3306/railway'
  }, 'production');

  assert.equal(database.source, 'MYSQL_URL');
  assert.equal(database.host, 'mysql.railway.internal');
  assert.equal(database.name, 'railway');
  assert.doesNotThrow(() => validateDatabaseConfiguration(database, true));
});

test('aceita variáveis nativas do MySQL no Railway', () => {
  const database = resolveDatabaseConfiguration({
    MYSQLHOST: 'mysql.railway.internal',
    MYSQLPORT: '3306',
    MYSQLUSER: 'root',
    MYSQLPASSWORD: 'railway-password',
    MYSQLDATABASE: 'railway'
  }, 'production');

  assert.equal(database.host, 'mysql.railway.internal');
  assert.equal(database.user, 'root');
  assert.equal(database.name, 'railway');
  assert.doesNotThrow(() => validateDatabaseConfiguration(database, true));
});

test('prioriza DB_* sobre MYSQL* quando são usadas variáveis individuais', () => {
  const database = resolveDatabaseConfiguration({
    ...COMPLETE_INDIVIDUAL_ENV,
    MYSQLHOST: 'ignored.internal',
    MYSQLPORT: '3306',
    MYSQLUSER: 'ignored',
    MYSQLPASSWORD: 'ignored',
    MYSQLDATABASE: 'ignored'
  }, 'production');

  assert.equal(database.host, 'mysql.internal');
  assert.equal(database.port, 3307);
  assert.equal(database.user, 'app');
  assert.equal(database.name, 'tolkiencraft');
});

test('mantém os padrões locais somente em desenvolvimento', () => {
  const database = resolveDatabaseConfiguration({}, 'development');

  assert.equal(database.host, '127.0.0.1');
  assert.equal(database.port, 3306);
  assert.equal(database.user, 'root');
  assert.equal(database.password, '');
  assert.equal(database.name, 'admin_system');
  assert.doesNotThrow(() => validateDatabaseConfiguration(database, false));
});

test('rejeita localhost e endereços loopback em produção', () => {
  for (const host of ['localhost', '127.0.0.1', '::1']) {
    const database = resolveDatabaseConfiguration({
      ...COMPLETE_INDIVIDUAL_ENV,
      DB_HOST: host
    }, 'production');

    assert.throws(
      () => validateDatabaseConfiguration(database, true),
      /não é permitido como host em produção/
    );
  }
});

test('habilita SSL com validação de certificado e CA informada pelo ambiente', () => {
  const database = resolveDatabaseConfiguration({
    ...COMPLETE_INDIVIDUAL_ENV,
    DB_SSL: 'true',
    DB_SSL_CA: 'linha-1\\nlinha-2'
  }, 'production');
  const options = createDatabaseConnectionOptions(database);

  assert.equal(options.ssl.rejectUnauthorized, true);
  assert.equal(options.ssl.ca, 'linha-1\nlinha-2');
});

test('usa PORT do ambiente e o servidor faz bind externo', async () => {
  const runtimeEnvironment = createEnvironment({ PORT: '8123' });
  const serverSource = await readFile(new URL('../server.js', import.meta.url), 'utf8');

  assert.equal(runtimeEnvironment.port, 8123);
  assert.match(serverSource, /app\.listen\(env\.port,\s*'0\.0\.0\.0'/);
});
