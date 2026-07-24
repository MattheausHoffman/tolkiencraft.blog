import 'dotenv/config';

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

export class DatabaseConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseConfigurationError';
    this.code = 'INVALID_DATABASE_CONFIG';
  }
}

function integerFromValue(value, name, fallback, {
  min = 0,
  max = Number.MAX_SAFE_INTEGER
} = {}) {
  const parsedValue = value === undefined || value === ''
    ? fallback
    : Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < min || parsedValue > max) {
    throw new Error(`A variável ${name} deve ser um número inteiro entre ${min} e ${max}.`);
  }

  return parsedValue;
}

function integerFromEnv(source, name, fallback, options) {
  return integerFromValue(source[name], name, fallback, options);
}

function booleanFromEnv(source, name, fallback = false) {
  const rawValue = source[name];
  if (rawValue === undefined || rawValue === '') return fallback;
  return TRUE_VALUES.has(String(rawValue).toLowerCase());
}

function firstNonEmpty(source, names) {
  for (const name of names) {
    const value = source[name];
    if (value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return undefined;
}

function firstDefined(source, names) {
  for (const name of names) {
    if (source[name] !== undefined) return String(source[name]);
  }

  return undefined;
}

function decodeUrlComponent(value, fieldName, sourceName) {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new DatabaseConfigurationError(
      `Configuração do banco inválida: ${fieldName} malformado em ${sourceName}.`
    );
  }
}

function parseDatabaseUrl(rawUrl, sourceName) {
  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new DatabaseConfigurationError(
      `Configuração do banco inválida: ${sourceName} não contém uma URL válida.`
    );
  }

  if (!['mysql:', 'mysql2:'].includes(parsedUrl.protocol)) {
    throw new DatabaseConfigurationError(
      `Configuração do banco inválida: ${sourceName} deve utilizar o protocolo mysql.`
    );
  }

  const databasePath = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0] || '';

  return {
    host: parsedUrl.hostname,
    port: integerFromValue(
      parsedUrl.port,
      `${sourceName} (porta)`,
      3306,
      { min: 1, max: 65535 }
    ),
    user: decodeUrlComponent(parsedUrl.username, 'usuário', sourceName),
    password: decodeUrlComponent(parsedUrl.password, 'senha', sourceName),
    name: decodeUrlComponent(databasePath, 'nome do banco', sourceName),
    urlSsl: parsedUrl.searchParams.get('ssl')
      || parsedUrl.searchParams.get('ssl-mode')
      || parsedUrl.searchParams.get('sslmode')
  };
}

function resolveSslConfiguration(source, urlSsl) {
  const explicitSsl = firstNonEmpty(source, ['DB_SSL', 'MYSQL_SSL']);
  const ca = firstDefined(source, ['DB_SSL_CA', 'MYSQL_SSL_CA']);
  let enabled = Boolean(ca);

  if (explicitSsl !== undefined) {
    const normalizedValue = explicitSsl.toLowerCase();
    if (!TRUE_VALUES.has(normalizedValue) && !FALSE_VALUES.has(normalizedValue)) {
      throw new DatabaseConfigurationError(
        'Configuração do banco inválida: DB_SSL/MYSQL_SSL deve ser true ou false.'
      );
    }
    enabled = TRUE_VALUES.has(normalizedValue);
  } else if (urlSsl) {
    enabled = !['0', 'false', 'off', 'disabled', 'disable'].includes(urlSsl.toLowerCase());
  }

  if (!enabled) return undefined;

  return Object.freeze({
    rejectUnauthorized: true,
    ...(ca ? { ca: ca.replace(/\\n/g, '\n') } : {})
  });
}

export function resolveDatabaseConfiguration(source = process.env, nodeEnv = 'development') {
  const isProduction = nodeEnv === 'production';
  const databaseUrlName = firstNonEmpty(source, ['DATABASE_URL'])
    ? 'DATABASE_URL'
    : firstNonEmpty(source, ['MYSQL_URL'])
      ? 'MYSQL_URL'
      : undefined;
  const parsedUrl = databaseUrlName
    ? parseDatabaseUrl(source[databaseUrlName], databaseUrlName)
    : undefined;

  const host = parsedUrl
    ? parsedUrl.host
    : firstNonEmpty(source, ['DB_HOST', 'MYSQLHOST'])
      || (isProduction ? undefined : '127.0.0.1');
  const user = parsedUrl
    ? parsedUrl.user
    : firstNonEmpty(source, ['DB_USER', 'MYSQLUSER'])
      || (isProduction ? undefined : 'root');
  const password = parsedUrl
    ? parsedUrl.password
    : firstNonEmpty(source, ['DB_PASSWORD', 'MYSQLPASSWORD'])
      ?? (isProduction ? undefined : firstDefined(source, ['DB_PASSWORD', 'MYSQLPASSWORD']) ?? '');
  const name = parsedUrl
    ? parsedUrl.name
    : firstNonEmpty(source, ['DB_NAME', 'MYSQLDATABASE'])
      || (isProduction ? undefined : 'admin_system');
  const individualPort = firstNonEmpty(source, ['DB_PORT', 'MYSQLPORT']);
  const port = parsedUrl?.port ?? integerFromValue(
    individualPort,
    individualPort === source.DB_PORT ? 'DB_PORT' : 'MYSQLPORT',
    3306,
    { min: 1, max: 65535 }
  );
  const ssl = resolveSslConfiguration(source, parsedUrl?.urlSsl);
  const configured = Boolean(
    host
    && port
    && user
    && name
    && (!isProduction || password)
  );

  return Object.freeze({
    host,
    port,
    user,
    password,
    name,
    ssl,
    configured,
    source: databaseUrlName || 'variáveis individuais',
    connectionLimit: integerFromEnv(
      source,
      'DB_CONNECTION_LIMIT',
      10,
      { min: 1, max: 100 }
    )
  });
}

export function validateDatabaseConfiguration(database, isProduction) {
  const missingVariables = [];

  if (!database.host) missingVariables.push('DB_HOST/MYSQLHOST');
  if (!database.user) missingVariables.push('DB_USER/MYSQLUSER');
  if (database.password === undefined || (isProduction && database.password === '')) {
    missingVariables.push('DB_PASSWORD/MYSQLPASSWORD');
  }
  if (!database.name) missingVariables.push('DB_NAME/MYSQLDATABASE');

  if (missingVariables.length > 0) {
    throw new DatabaseConfigurationError(
      `Configuração do banco inválida. Variáveis ausentes: ${missingVariables.join(', ')}.`
    );
  }

  const normalizedHost = database.host.toLowerCase().replace(/^\[|\]$/g, '');
  if (isProduction && LOCAL_DATABASE_HOSTS.has(normalizedHost)) {
    throw new DatabaseConfigurationError(
      'Configuração do banco inválida: localhost/127.0.0.1 não é permitido como host em produção.'
    );
  }
}

export function createDatabaseConnectionOptions(database, { includeDatabase = true } = {}) {
  return {
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
    ...(includeDatabase ? { database: database.name } : {}),
    ...(database.ssl ? { ssl: database.ssl } : {})
  };
}

export function createEnvironment(source = process.env) {
  const nodeEnv = source.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const sessionSecret = source.SESSION_SECRET || '';

  if (isProduction && sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET deve possuir ao menos 32 caracteres em produção.');
  }

  return Object.freeze({
    nodeEnv,
    isProduction,
    port: integerFromEnv(source, 'PORT', 3000, { min: 1, max: 65535 }),
    siteUrl: (source.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
    trustProxy: integerFromEnv(source, 'TRUST_PROXY', 0, { min: 0, max: 10 }),
    database: resolveDatabaseConfiguration(source, nodeEnv),
    session: Object.freeze({
      secret: sessionSecret || 'development-only-session-secret-change-before-production',
      maxAgeMs: integerFromEnv(source, 'SESSION_MAX_AGE_MS', 28_800_000, { min: 60_000 }),
      secureCookie: booleanFromEnv(source, 'SESSION_COOKIE_SECURE', isProduction)
    }),
    security: Object.freeze({
      bcryptRounds: integerFromEnv(source, 'BCRYPT_ROUNDS', 12, { min: 10, max: 15 })
    }),
    defaultAdmin: Object.freeze({
      id: 1,
      name: source.DEFAULT_ADMIN_NAME || 'ADMIN',
      email: source.DEFAULT_ADMIN_EMAIL || 'Mattheaus.hoffman@gmail.com',
      password: source.DEFAULT_ADMIN_PASSWORD || 'Matth)19052005'
    })
  });
}

export const env = createEnvironment();
