import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatDatabaseError,
  isTransientDatabaseError
} from '../database/errors.js';
import { initializeDatabase } from '../database/startup.js';

test('repete falhas transitórias com intervalos progressivos e limite definido', async () => {
  let bootstrapCalls = 0;
  let verifyCalls = 0;
  const delays = [];
  const warnings = [];

  await initializeDatabase({
    bootstrap: async () => {
      bootstrapCalls += 1;
      if (bootstrapCalls < 3) {
        const error = new Error('não deve aparecer no log');
        error.code = 'ECONNREFUSED';
        throw error;
      }
    },
    verify: async () => {
      verifyCalls += 1;
    },
    retryDelaysMs: [100, 300, 600],
    sleep: async (delay) => {
      delays.push(delay);
    },
    logger: {
      warn(message) {
        warnings.push(message);
      }
    }
  });

  assert.equal(bootstrapCalls, 3);
  assert.equal(verifyCalls, 1);
  assert.deepEqual(delays, [100, 300]);
  assert.equal(warnings.length, 2);
  assert.equal(warnings.some((message) => message.includes('não deve aparecer')), false);
});

test('não repete erro permanente de autenticação', async () => {
  let bootstrapCalls = 0;
  const accessDenied = Object.assign(new Error('senha-super-secreta'), {
    code: 'ER_ACCESS_DENIED_ERROR'
  });

  await assert.rejects(
    initializeDatabase({
      bootstrap: async () => {
        bootstrapCalls += 1;
        throw accessDenied;
      },
      verify: async () => {},
      retryDelaysMs: [1, 2, 3],
      sleep: async () => {
        throw new Error('não deveria aguardar');
      }
    }),
    (error) => error === accessDenied
  );

  assert.equal(bootstrapCalls, 1);
  assert.equal(isTransientDatabaseError(accessDenied), false);
});

test('formata erros sem expor mensagens que possam conter credenciais', () => {
  const error = Object.assign(new Error(
    'Access denied for mysql://admin:senha-super-secreta@host/banco'
  ), {
    code: 'ER_ACCESS_DENIED_ERROR'
  });
  const formattedError = formatDatabaseError(error);

  assert.equal(formattedError, 'autenticação recusada pelo MySQL (ER_ACCESS_DENIED_ERROR)');
  assert.equal(formattedError.includes('senha-super-secreta'), false);
  assert.equal(formattedError.includes('mysql://'), false);
});
