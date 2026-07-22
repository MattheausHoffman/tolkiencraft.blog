export const RULE_GROUPS = [
  {
    title: 'Construção responsável',
    summary: 'Preserve o mapa, respeite vizinhos e mantenha distância das vilas iniciais.',
    sections: [
      {
        title: 'Diretrizes',
        items: [
          'Mantenha no mínimo 200 blocos de distância das vilas iniciais.',
          'Antes de construir próximo a outro jogador, converse e alinhe os limites da área.',
          'Construções invasivas poderão ser removidas pela administração.',
          'Evite desmatamento ou mineração excessiva sem finalidade.',
          'Dentro de um reino, o Rei ou a Rainha poderá intermediar conflitos territoriais.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: advertência e correção obrigatória.',
          '2ª ocorrência: prisão de 5 dias.',
          '3ª ocorrência: prisão de 7 dias e multa de 10.000 Castares.',
          '4ª ocorrência: prisão de 15 dias e multa de 20.000 Castares.',
          '5ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Farms',
    summary: 'Farms são aceitas somente quando não geram recursos em escala abusiva nem prejudicam o desempenho do servidor.',
    sections: [
      {
        title: 'Permitidas sem causar lag',
        items: [
          'Farms de lã, bambu, cana-de-açúcar, ovos e casca de tatu.',
          'Sistemas moderados de separação de itens.',
          'Outras estruturas previamente validadas pela administração.'
        ]
      },
      {
        title: 'Proibidas',
        items: [
          'Farms que gerem recursos em escala abusiva.',
          'Estruturas que prejudiquem o desempenho do servidor.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: advertência e ajuste obrigatório.',
          '2ª ocorrência: prisão de 5 dias e multa de 5.000 Castares.',
          '3ª ocorrência: prisão de 7 dias e multa de 10.000 Castares.',
          '4ª ocorrência: prisão de 15 dias e multa de 20.000 Castares.',
          '5ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Proteção de recursos',
    summary: 'Baús, construções e áreas pertencentes a outros jogadores devem ser respeitados.',
    sections: [
      {
        title: 'É proibido',
        items: [
          'Abrir ou roubar itens de baús sem permissão.',
          'Modificar construções de outros jogadores.',
          'Praticar griefing ou destruição deliberada.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: advertência e devolução dos itens.',
          '2ª ocorrência: prisão de 5 dias e multa de 5.000 Castares.',
          '3ª ocorrência: prisão de 7 dias e multa de 10.000 Castares.',
          '4ª ocorrência: prisão de 15 dias e multa de 20.000 Castares.',
          '5ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Comércio e /market',
    summary: 'O comércio é livre, mas deve ser justo, rastreável e realizado pelo sistema oficial quando aplicável.',
    sections: [
      {
        title: 'Regras',
        items: [
          'Utilize o sistema oficial /market.',
          'Os preços devem seguir uma lógica de mercado.',
          'Itens com nomes ofensivos não são permitidos.',
          'Valores abusivos poderão ser corrigidos pela administração.',
          'O item irregular poderá ser removido e o valor debitado com multa.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: multa de 500 Castares.',
          '2ª ocorrência: multa de 5.000 Castares.',
          '3ª ocorrência: prisão de 2 dias e multa de 10.000 Castares.',
          '4ª ocorrência: prisão de 5 dias e multa de 15.000 Castares.',
          '5ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Uso de hacks',
    summary: 'Mods visuais sem vantagem competitiva são aceitos; hacks, automações e vantagens injustas são proibidos.',
    sections: [
      {
        title: 'Permitido',
        items: [
          'Mods e texturas visuais sem vantagem competitiva.',
          'Minimapa, otimizações de desempenho e mostradores informativos que não automatizem ações.'
        ]
      },
      {
        title: 'Proibido',
        items: [
          'X-Ray, macros, cheats e pesca automática.',
          'Qualquer automação ou modificação que gere vantagem injusta.'
        ]
      },
      {
        title: 'Punições',
        items: [
          '1ª ocorrência: suspensão de 15 dias.',
          '2ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Nicks inadequados',
    summary: 'O nome do jogador deve ser adequado à comunidade e não pode promover ódio, conteúdo sexual ou ofensas.',
    sections: [
      {
        title: 'Regras',
        items: [
          'Nomes ofensivos, de cunho sexual ou que promovam ódio não são permitidos.',
          'A administração poderá exigir a alteração do nick antes de liberar novo acesso.'
        ]
      },
      {
        title: 'Punições',
        items: [
          '1ª ocorrência: suspensão até a alteração do nick.',
          '2ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'PvP',
    summary: 'Combates devem ocorrer em áreas autorizadas ou mediante acordo entre os jogadores.',
    sections: [
      {
        title: 'Regras',
        items: [
          'PvP é permitido apenas em Angband, em duelos combinados ou pelo comando /duel.',
          'Ataques sem consentimento serão punidos.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: prisão de 2 dias.',
          '2ª ocorrência: prisão de 5 dias.',
          '3ª ocorrência: prisão de 7 dias.',
          '4ª ocorrência: prisão de 15 dias e multa de 20.000 Castares.',
          '5ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Envio de links',
    summary: 'Links e divulgações devem respeitar os canais oficiais e não podem promover serviços proibidos ou concorrentes.',
    sections: [
      {
        title: 'Proibido',
        items: [
          'Divulgação de servidores concorrentes.',
          'Apostas, IPTV, TVBox e serviços similares.',
          'Propaganda sem autorização.'
        ]
      },
      {
        title: 'Permitido',
        items: [
          'Divulgação moderada de outros jogos, exceto servidores de Minecraft.'
        ]
      },
      {
        title: 'Punições',
        items: [
          '1ª ocorrência: advertência.',
          '2ª ocorrência: suspensão de 7 dias.',
          '3ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Chat adequado',
    summary: 'Todos os ambientes oficiais devem permanecer seguros, respeitosos e adequados à comunidade.',
    sections: [
      {
        title: 'É proibido',
        items: [
          'Xingamentos, cyberbullying, insultos diretos ou indiretos.',
          'Discussões políticas ou ideológicas nos canais do servidor.',
          'Racismo, nazismo, homofobia e qualquer discurso de ódio.',
          'Figurinhas impróprias, assédio ou importunação.'
        ]
      },
      {
        title: 'Punições nos grupos',
        items: [
          '1ª ocorrência: suspensão de 2 dias.',
          '2ª ocorrência: suspensão de 7 dias.',
          '3ª ocorrência: suspensão de 15 dias.',
          '4ª ocorrência: banimento da comunidade.'
        ]
      },
      {
        title: 'Punições no servidor',
        items: [
          '1ª ocorrência: prisão de 2 dias.',
          '2ª ocorrência: prisão de 7 dias e multa de 10.000 Castares.',
          '3ª ocorrência: prisão de 15 dias e multa de 15.000 Castares.',
          '4ª ocorrência: banimento permanente.',
          'Infrações nos grupos oficiais poderão refletir no servidor e vice-versa.',
          'Casos envolvendo assédio ou importunação de menores poderão resultar em banimento imediato e medidas cabíveis.'
        ]
      }
    ]
  },
  {
    title: 'Ferrovias',
    summary: 'Linhas ferroviárias devem preservar a estética do mapa e evitar estruturas extensas expostas na superfície.',
    sections: [
      {
        title: 'Regras',
        items: [
          'Trilhos na superfície podem ter no máximo 50 blocos.',
          'Trechos de longa distância devem ser subterrâneos, com profundidade mínima de 10 blocos.',
          'Estações devem ser discretas e respeitar a distância de 200 blocos das vilas iniciais.',
          'Não são permitidos trilhos longos visíveis na superfície.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: advertência, multa de 800 Castares e correção da estrutura.',
          '2ª ocorrência: multa de 5.000 Castares.',
          '3ª ocorrência: prisão de 3 dias e multa de 10.000 Castares.',
          '4ª ocorrência: prisão de 7 dias e multa de 20.000 Castares.',
          '5ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Uso e relato de bugs',
    summary: 'Falhas devem ser reportadas de forma privada. Explorar ou divulgar bugs é proibido.',
    sections: [
      {
        title: 'Regras',
        items: [
          'Comunique qualquer falha em privado a um administrador.',
          'Não divulgue bugs em grupos, chats ou canais públicos.',
          'Não explore falhas para obter vantagem própria.',
          'Uma falha inédita e crítica poderá gerar recompensa de 500 Castares ao responsável pelo relato.'
        ]
      },
      {
        title: 'Punições',
        items: [
          '1ª ocorrência: advertência.',
          '2ª ocorrência: suspensão de 5 dias.',
          '3ª ocorrência: banimento permanente.'
        ]
      }
    ]
  },
  {
    title: 'Contas secundárias',
    summary: 'Contas alternativas são permitidas, mas não podem ser usadas para burlar regras ou punições.',
    sections: [
      {
        title: 'Consequências',
        items: [
          'Todas as contas envolvidas serão punidas quando houver tentativa de evasão.',
          'A punição original será automaticamente dobrada.'
        ]
      }
    ]
  },
  {
    title: 'Pedidos à administração',
    summary: 'A equipe administrativa deve ser acionada apenas por motivos legítimos e pelos canais adequados.',
    sections: [
      {
        title: 'É proibido',
        items: [
          'Pedir teleporte sem justificativa, itens, modo criativo ou mudança de clima.',
          'Realizar falso relato de bugs ou denúncias falsas.',
          'Cobrar a aplicação de regras inexistentes.',
          'Insistir em duelos com administradores.'
        ]
      },
      {
        title: 'Punições progressivas',
        items: [
          '1ª ocorrência: advertência e multa de 200 Castares.',
          '2ª ocorrência: multa de 500 Castares.',
          '3ª ocorrência: multa de 1.500 Castares.',
          'Ocorrências posteriores mantêm o valor da 3ª ocorrência.'
        ]
      }
    ]
  },
  {
    title: 'Alto Conselho',
    summary: 'Faltas graves poderão ser avaliadas por um conselho formado pela administração e pela liderança do reino do jogador.',
    sections: [
      {
        title: 'Procedimento',
        items: [
          'O Alto Conselho poderá ser convocado em casos extremos de desrespeito ou faltas graves.',
          'Por maioria simples, poderá ser decidido o banimento permanente.',
          'A decisão do conselho será final e não passível de apelação.'
        ]
      }
    ]
  },
  {
    title: 'Disposição final',
    summary: 'As regras se aplicam a todos os ambientes oficiais do TolkienCraft.',
    sections: [
      {
        title: 'Aplicação',
        items: [
          'A administração poderá aplicar as medidas conforme a gravidade e o contexto do caso.',
          'Situações não previstas serão avaliadas pela equipe administrativa.',
          'A permanência no servidor e nos grupos oficiais representa concordância com o regulamento.'
        ]
      }
    ]
  }
];
