export const EVENT_MONTHS = Object.freeze([
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]);

export function eventMonthName(month) {
  return EVENT_MONTHS[Number(month) - 1] || 'Mês inválido';
}

export function formatEventDate(event) {
  if (event?.diaInicial === null || event?.diaInicial === undefined) return 'A definir';
  const start = String(event.diaInicial).padStart(2, '0');
  if (event.diaFinal === null || event.diaFinal === undefined) return start;
  return `${start}–${String(event.diaFinal).padStart(2, '0')}`;
}

export function eventMonthSlug(month) {
  return eventMonthName(month)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
