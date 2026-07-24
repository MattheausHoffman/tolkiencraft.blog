import { eventMonthName, formatEventDate } from '../js/event-format.js';
import { SEED_EVENTS } from './seed-events.js';
import { SEED_RULES } from './seed-rules.js';

const title = (text) => ({ type: 'title', data: { text } });
const subtitle = (text) => ({ type: 'subtitle', data: { text } });
const paragraph = (html) => ({ type: 'paragraph', data: { html } });
const list = (items, ordered = false) => ({ type: ordered ? 'ordered_list' : 'list', data: { items } });
const notice = (heading, html, tone = 'notice') => ({ type: tone, data: { heading, html } });
const table = (headers, rows, alignment = 'left') => ({ type: 'table', data: { headers, rows, hasHeader: true, alignment } });

const warBlocks = [
  notice('Regra central', 'Nenhuma campanha militar é válida sem declaração oficial, pagamento da taxa e publicação nos canais da comunidade.'),
  title('Declaração de guerra'),
  paragraph('Uma guerra começa quando o Rei do Reino Atacante registra uma declaração oficial com a Administração e paga antecipadamente a taxa de campanha de <strong>25.000 Castares</strong>. A taxa não é devolvida em caso de desistência ou acordo de paz.'),
  subtitle('Informações obrigatórias'),
  list([
    'Reino atacante e reino defensor.',
    'Data da declaração.',
    'Motivo da guerra, com justificativa de roleplay.',
    'Objetivo da campanha: Estado Vassalo ou Reino Soberano.',
    'Condições de rendição propostas ao defensor.'
  ], true),
  paragraph('Após o pagamento, a Administração publica a declaração no canal de guerra do Discord e na comunidade do WhatsApp.'),
  title('Preparação e regras de elenco'),
  paragraph('Depois do anúncio, começa uma trégua obrigatória de <strong>48 horas</strong>. Durante esse período não pode haver combate entre os reinos envolvidos.'),
  list([
    'As cidadanias ficam congeladas até o encerramento do conflito.',
    'Nenhum membro pode entrar ou sair dos reinos envolvidos.',
    'A medida impede contratações de última hora exclusivamente para PvP.'
  ]),
  title('Formato dos combates e aliados'),
  list([
    'As batalhas utilizam o formato <strong>4 contra 4</strong> na Arena Oficial de Capture The Flag.',
    'O Rei ou os Generais definem a escalação.',
    'Não existe quórum mínimo. Uma equipe incompleta luta em desvantagem.',
    'O defensor pode convocar aliados para preencher vagas, sem conceder terras ou direitos políticos aos reforços.'
  ]),
  notice('Equipamentos padronizados', 'Itens próprios, poções, comidas, escudos e totens não podem ser levados à arena. Todos recebem kits idênticos fornecidos pelo servidor.'),
  title('Arena e campanha militar'),
  paragraph('O defensor joga como Time Azul e o atacante como Time Vermelho. Cada partida dura até 25 minutos e o round é vencido pela equipe que capturar mais vezes a bandeira adversária.'),
  list([
    'A campanha tem até cinco batalhas.',
    'O primeiro reino a conquistar três vitórias encerra a guerra.',
    'Se ninguém alcançar três vitórias, a campanha termina empatada, sem mudança de fronteiras ou indenização.'
  ]),
  title('Horários oficiais e Portal de Guerra'),
  paragraph('A Arena comporta no máximo duas guerras por noite.'),
  table(
    ['Fase', 'Turno 1', 'Turno 2'],
    [
      ['Abertura do portal', '21:50', '22:35'],
      ['Início da espera', '22:00', '22:45'],
      ['Fechamento do portal', '22:10', '22:55'],
      ['Fim da batalha', '22:25', '23:10']
    ]
  ),
  paragraph('Quem não atravessar o portal antes do fechamento fica fora da partida. A ausência total de um reino resulta em derrota automática naquele round.'),
  title('Consequências financeiras e dívida ativa'),
  list([
    '<strong>Vitória do atacante:</strong> devolução dos 25.000 Castares e indenização de 35.000 Castares paga pelo defensor.',
    '<strong>Vitória do defensor:</strong> preservação das terras e indenização de 20.000 Castares paga pelo atacante.',
    '<strong>Desistência do atacante:</strong> perda da taxa inicial e pagamento imediato de 20.000 Castares ao defensor.'
  ]),
  paragraph('Quando o reino perdedor não possui saldo suficiente, todo o banco é transferido ao vencedor e o restante vira dívida ativa. Até quitar o débito, o reino não poderá declarar guerras, criar postos avançados ou comprar expansões administrativas.'),
  title('Suserania e Estados Vassalos'),
  paragraph('Reinos soberanos protegidos por Estados Vassalos não podem ter sua capital atacada diretamente. Os vassalos devem ser conquistados primeiro.'),
  list([
    'O reino derrotado continua existindo e mantém construções, cidades, membros e liderança interna.',
    'O Estado Vassalo perde autonomia diplomática externa.',
    'Alianças, tratados e novas guerras dependem do aval do Rei Suserano.',
    'Um vassalo pode iniciar futuramente uma guerra de reconquista pela independência.'
  ]),
  title('Limitações e recuperação'),
  list([
    'Nenhum reino pode participar de dois conflitos simultaneamente.',
    'Após a campanha, atacante e defensor recebem imunidade de cinco dias.',
    'Durante a trégua, não podem declarar nem receber novos ataques.',
    'Quando houver excesso de declarações, a Administração organizará uma fila por ordem de registro.'
  ])
];

const terrainBlocks = [
  title('Habitação e comércio nas vilas iniciais'),
  paragraph('As vilas iniciais oferecem áreas planejadas para novos cidadãos e para o desenvolvimento da economia local.'),
  subtitle('Residências de vila'),
  { type: 'highlight', data: { heading: 'Dados do lote residencial', html: '<strong>Dimensões:</strong> 25 × 25 blocos · <strong>Área:</strong> 625 blocos² · <strong>Investimento:</strong> 7.000 Castares · <strong>Limite:</strong> 1 terreno residencial por cidadão.' } },
  paragraph('As construções devem seguir estética medieval ou fantástica. Projetos fora do padrão poderão receber notificação para readequação.'),
  subtitle('Zonas comerciais'),
  list([
    'Destinadas a tavernas, oficinas, mercados e serviços.',
    'Limite de até quatro terrenos comerciais por jogador, com no máximo um em cada vila.',
    'Lotes posicionados em áreas de alto fluxo, próximos às praças centrais.'
  ]),
  title('Expansão territorial no mundo aberto'),
  paragraph('O mundo aberto recebe fazendas, sedes de clãs, reinos e projetos de grande escala. O valor é calculado pela área total somada à taxa de proteção.'),
  { type: 'highlight', data: { heading: 'Fórmula de investimento', html: '<strong>(Área total ÷ 2) + 15.000 Castares</strong>' } },
  table(
    ['Classificação', 'Dimensão', 'Área', 'Investimento'],
    [
      ['Pequeno porte', '50 × 50', '2.500', '16.250 Castares'],
      ['Padrão', '100 × 100', '10.000', '20.000 Castares'],
      ['Médio porte', '200 × 200', '40.000', '35.000 Castares'],
      ['Grande porte', '300 × 300', '90.000', '60.000 Castares'],
      ['Domínio real', '400 × 400', '160.000', '95.000 Castares'],
      ['Limite máximo', '500 × 500', '250.000', '140.000 Castares']
    ]
  ),
  title('Terrenos customizados'),
  paragraph('A Administração pode demarcar áreas específicas ou proteger construções preexistentes.'),
  list([
    'A área mínima para solicitação customizada é de 100 × 100 blocos.',
    'A marcação manual possui taxa administrativa adicional de 5.000 Castares.',
    'Terrenos prontos do catálogo, já demarcados pela staff, não pagam essa taxa.'
  ]),
  title('Compra e gestão'),
  list([
    'Consulte o catálogo de lotes disponíveis.',
    'Visite o local e localize a placa branca de venda.',
    'Clique na placa. Havendo saldo suficiente, a posse é transferida imediatamente.'
  ], true),
  subtitle('Comando /terreno'),
  list([
    '<strong>Teleporte:</strong> retorno rápido à propriedade.',
    '<strong>Gestão de membros:</strong> adição ou remoção de permissões.',
    '<strong>Configurações:</strong> controle de entidades e acesso.',
    '<strong>Reset:</strong> restauração da área ao estado original.'
  ]),
  title('Código de urbanismo'),
  list([
    '<strong>Conectividade:</strong> todo terreno deve ficar junto a uma estrada oficial ou rio navegável.',
    '<strong>Orientação:</strong> a fachada e a entrada principal devem estar voltadas para a via de acesso.',
    '<strong>Isolamento:</strong> não é permitida proteção em local isolado sem conexão por estrada ou rio.'
  ], true)
];

const eventsByMonth = SEED_EVENTS.reduce((groups, event) => {
  const current = groups.get(event.mes) || [];
  current.push(event);
  groups.set(event.mes, current);
  return groups;
}, new Map());

const eventBlocks = [];
for (const [month, events] of eventsByMonth.entries()) {
  eventBlocks.push(title(eventMonthName(month)));
  eventBlocks.push(table(
    ['Data', 'Evento', 'Tipo'],
    events.map((event) => [formatEventDate(event), event.nome, event.descricao])
  ));
}

const ruleBlocks = SEED_RULES.flatMap((group) => {
  const blocks = [title(group.title), paragraph(group.summary)];
  for (const section of group.sections) {
    blocks.push(subtitle(section.title));
    blocks.push(list(section.items));
  }
  return blocks;
});

export const SEED_PUBLICATIONS = [
  {
    title: 'Código de Guerra dos Reinos',
    slug: 'codigo-de-guerra-dos-reinos',
    summary: 'Declaração de guerra, preparação, batalhas CTF, indenizações, suserania e períodos de trégua.',
    coverImageUrl: '/assets/images/codigo-guerra.png',
    coverImageAlt: 'Vista aérea da Arena Oficial de Guerra do servidor TolkienCraft',
    author: 'ADMIN',
    status: 'published',
    displayOrder: 10,
    publishedAt: '2026-07-12 12:00:00',
    seoTitle: 'Código de Guerra dos Reinos | TolkienCraft',
    metaDescription: 'Conheça o regulamento oficial das guerras entre reinos do TolkienCraft.',
    metaKeywords: 'TolkienCraft, guerra, reinos, Minecraft, Beleriand',
    ogTitle: 'Código de Guerra dos Reinos',
    ogDescription: 'Regulamento completo das campanhas militares entre reinos.',
    ogImageUrl: '/assets/images/codigo-guerra.png',
    blocks: warBlocks
  },
  {
    title: 'Sistema de Terrenos do Servidor',
    slug: 'sistema-de-terrenos-do-servidor',
    summary: 'Valores, dimensões, lotes customizados, comandos de gestão e código de urbanismo.',
    coverImageUrl: '/assets/images/sistema-terrenos.png',
    coverImageAlt: 'Etapas de avaliação, compra, construção e comércio em um lote',
    author: 'ADMIN',
    status: 'published',
    displayOrder: 20,
    publishedAt: '2026-03-09 12:00:00',
    seoTitle: 'Sistema de Terrenos | TolkienCraft',
    metaDescription: 'Consulte valores, dimensões e regras para compra e gestão de terrenos no TolkienCraft.',
    metaKeywords: 'TolkienCraft, terrenos, lotes, construção, Minecraft',
    ogTitle: 'Sistema de Terrenos do Servidor',
    ogDescription: 'Guia completo de compra, expansão e gestão de terrenos.',
    ogImageUrl: '/assets/images/sistema-terrenos.png',
    blocks: terrainBlocks
  },
  {
    title: 'Calendário de Eventos da Primeira Era',
    slug: 'calendario-de-eventos-da-primeira-era',
    summary: 'Quests, campanhas narrativas e grandes batalhas organizadas de junho a dezembro.',
    coverImageUrl: '/assets/images/angband.png',
    coverImageAlt: 'Exércitos e criaturas em uma batalha nas proximidades de Angband',
    author: 'ADMIN',
    status: 'published',
    displayOrder: 30,
    publishedAt: '2026-06-20 12:00:00',
    seoTitle: 'Eventos da Primeira Era | TolkienCraft',
    metaDescription: 'Consulte o calendário oficial de eventos, quests e batalhas do TolkienCraft.',
    metaKeywords: 'TolkienCraft, eventos, quests, Angband, Beleriand',
    ogTitle: 'Calendário de Eventos da Primeira Era',
    ogDescription: 'Todos os eventos oficiais da temporada em um único calendário.',
    ogImageUrl: '/assets/images/angband.png',
    blocks: eventBlocks
  },
  {
    title: 'Regras Gerais do Servidor',
    slug: 'regras-gerais-do-servidor',
    summary: 'Regulamento completo em 15 tópicos sobre convivência, PvP, construção, comércio, segurança e administração.',
    coverImageUrl: '/assets/images/hero.png',
    coverImageAlt: 'Construção medieval do servidor TolkienCraft',
    author: 'ADMIN',
    status: 'published',
    displayOrder: 40,
    publishedAt: '2026-03-01 12:00:00',
    seoTitle: 'Regras Gerais do Servidor | TolkienCraft',
    metaDescription: 'Conheça os 15 tópicos das regras gerais do servidor TolkienCraft.',
    metaKeywords: 'TolkienCraft, regras, Minecraft, comunidade, servidor',
    ogTitle: 'Regras Gerais do TolkienCraft',
    ogDescription: 'Regulamento completo da comunidade e do servidor.',
    ogImageUrl: '/assets/images/hero.png',
    blocks: ruleBlocks
  }
];
