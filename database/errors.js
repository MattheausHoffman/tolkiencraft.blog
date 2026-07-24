const TRANSIENT_DATABASE_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENOTFOUND',
  'EAI_AGAIN',
  'PROTOCOL_CONNECTION_LOST'
]);

const DATABASE_ERROR_MESSAGES = Object.freeze({
  ECONNREFUSED: 'conexão recusada pelo host configurado',
  ECONNRESET: 'conexão encerrada durante a inicialização',
  ETIMEDOUT: 'tempo limite de conexão excedido',
  EHOSTUNREACH: 'host do banco inalcançável',
  ENETUNREACH: 'rede do banco inalcançável',
  ENOTFOUND: 'host do banco não encontrado no DNS',
  EAI_AGAIN: 'resolução DNS temporariamente indisponível',
  PROTOCOL_CONNECTION_LOST: 'conexão com o banco perdida',
  ER_ACCESS_DENIED_ERROR: 'autenticação recusada pelo MySQL',
  ER_BAD_DB_ERROR: 'banco de dados configurado não existe',
  ER_DBACCESS_DENIED_ERROR: 'usuário sem permissão para acessar o banco'
});

export function isTransientDatabaseError(error) {
  return TRANSIENT_DATABASE_ERROR_CODES.has(error?.code);
}

export function formatDatabaseError(error) {
  if (error?.code === 'INVALID_DATABASE_CONFIG') return error.message;

  const code = typeof error?.code === 'string'
    ? error.code
    : 'DATABASE_STARTUP_ERROR';
  const description = DATABASE_ERROR_MESSAGES[code] || 'falha ao inicializar o banco de dados';
  return `${description} (${code})`;
}
