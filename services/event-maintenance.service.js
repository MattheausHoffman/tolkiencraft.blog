import { deleteEventsOutsideYear } from '../models/event.model.js';

let cleanupTimer = null;

export async function cleanupExpiredEvents() {
  const currentYear = new Date().getFullYear();
  const removed = await deleteEventsOutsideYear(currentYear);
  if (removed > 0) {
    console.info(`${removed} Evento(s) de anos anteriores removido(s) da agenda.`);
  }
  return removed;
}

function millisecondsUntilNextServerMidnight() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(nextMidnight.getTime() - now.getTime(), 1000);
}

function scheduleNextCleanup() {
  cleanupTimer = setTimeout(async () => {
    try {
      await cleanupExpiredEvents();
    } catch (error) {
      console.error('Não foi possível executar a limpeza anual de Eventos:', error);
    } finally {
      scheduleNextCleanup();
    }
  }, millisecondsUntilNextServerMidnight());
  cleanupTimer.unref?.();
}

export async function startEventMaintenance() {
  await cleanupExpiredEvents();
  scheduleNextCleanup();
}

export function stopEventMaintenance() {
  if (cleanupTimer) clearTimeout(cleanupTimer);
  cleanupTimer = null;
}
