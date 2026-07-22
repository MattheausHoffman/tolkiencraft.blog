import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { env } from './environment.js';

const MySQLStore = MySQLStoreFactory(session);

export function createSessionMiddleware() {
  const store = new MySQLStore({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    createDatabaseTable: false,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: env.session.maxAgeMs,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  });

  store.on('error', (error) => {
    console.error('Erro no armazenamento de sessões:', error);
  });

  return session({
    name: 'tolkiencraft.sid',
    secret: env.session.secret,
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: env.session.secureCookie,
      sameSite: 'strict',
      maxAge: env.session.maxAgeMs,
      path: '/'
    }
  });
}
