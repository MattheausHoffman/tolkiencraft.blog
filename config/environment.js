import 'dotenv/config';

function integerFromEnv(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const rawValue = process.env[name];
  const value = rawValue === undefined || rawValue === '' ? fallback : Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`A variável ${name} deve ser um número inteiro entre ${min} e ${max}.`);
  }

  return value;
}

function booleanFromEnv(name, fallback = false) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(rawValue.toLowerCase());
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const sessionSecret = process.env.SESSION_SECRET || '';

if (isProduction && sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET deve possuir ao menos 32 caracteres em produção.');
}

export const env = Object.freeze({
  nodeEnv,
  isProduction,
  port: integerFromEnv('PORT', 3000, { min: 1, max: 65535 }),
  trustProxy: integerFromEnv('TRUST_PROXY', 0, { min: 0, max: 10 }),
  database: Object.freeze({
    host: process.env.DB_HOST || '127.0.0.1',
    port: integerFromEnv('DB_PORT', 3306, { min: 1, max: 65535 }),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'admin_system',
    connectionLimit: integerFromEnv('DB_CONNECTION_LIMIT', 10, { min: 1, max: 100 })
  }),
  session: Object.freeze({
    secret: sessionSecret || 'development-only-session-secret-change-before-production',
    maxAgeMs: integerFromEnv('SESSION_MAX_AGE_MS', 28_800_000, { min: 60_000 }),
    secureCookie: booleanFromEnv('SESSION_COOKIE_SECURE', isProduction)
  }),
  security: Object.freeze({
    bcryptRounds: integerFromEnv('BCRYPT_ROUNDS', 12, { min: 10, max: 15 })
  }),
  defaultAdmin: Object.freeze({
    id: 1,
    name: process.env.DEFAULT_ADMIN_NAME || 'ADMIN',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'Mattheaus.hoffman@gmail.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Matth)19052005'
  })
});
