/**
 * Curated subset of Portuguese geography for demo.
 * Full list (18 distritos + 308 concelhos + ~3.000 freguesias) is a future task.
 * Source: typical official names per concelho.
 */

export const PT_DISTRITOS = [
  'Lisboa',
  'Porto',
  'Setúbal',
  'Braga',
  'Coimbra',
  'Faro',
] as const

export type PtDistrito = (typeof PT_DISTRITOS)[number]

export const PT_CONCELHOS: Record<string, readonly string[]> = {
  Lisboa: [
    'Lisboa',
    'Sintra',
    'Cascais',
    'Oeiras',
    'Loures',
    'Amadora',
    'Mafra',
    'Odivelas',
    'Vila Franca de Xira',
  ],
  Porto: [
    'Porto',
    'Vila Nova de Gaia',
    'Matosinhos',
    'Maia',
    'Gondomar',
    'Valongo',
    'Póvoa de Varzim',
  ],
  Setúbal: ['Setúbal', 'Almada', 'Seixal', 'Barreiro', 'Montijo', 'Palmela'],
  Braga: ['Braga', 'Guimarães', 'Vila Nova de Famalicão', 'Barcelos'],
  Coimbra: ['Coimbra', 'Figueira da Foz', 'Cantanhede', 'Montemor-o-Velho'],
  Faro: ['Faro', 'Loulé', 'Albufeira', 'Portimão', 'Olhão', 'Tavira'],
}

export const PT_FREGUESIAS: Record<string, readonly string[]> = {
  // Lisboa
  Lisboa: [
    'Alvalade',
    'Avenidas Novas',
    'Belém',
    'Campo de Ourique',
    'Estrela',
    'Misericórdia',
    'Santa Maria Maior',
    'Santo António',
    'São Vicente',
  ],
  Sintra: [
    'Algueirão-Mem Martins',
    'Cacém e São Marcos',
    'Colares',
    'Queluz e Belas',
    'Sintra (Santa Maria e São Miguel)',
  ],
  Cascais: ['Cascais e Estoril', 'Alcabideche', 'São Domingos de Rana', 'Carcavelos e Parede'],
  Oeiras: ['Oeiras e São Julião da Barra', 'Algés, Linda-a-Velha e Cruz Quebrada-Dafundo', 'Carnaxide e Queijas'],
  Loures: ['Loures', 'Sacavém e Prior Velho', 'Camarate, Unhos e Apelação', 'Moscavide e Portela'],
  Amadora: ['Águas Livres', 'Alfornelos', 'Falagueira-Venda Nova', 'Mina de Água'],
  Mafra: ['Mafra', 'Ericeira', 'Malveira e São Miguel de Alcainça'],
  Odivelas: ['Odivelas', 'Pontinha e Famões', 'Ramada e Caneças'],
  'Vila Franca de Xira': ['Vila Franca de Xira', 'Alverca do Ribatejo e Sobralinho', 'Póvoa de Santa Iria e Forte da Casa'],

  // Porto
  Porto: [
    'Bonfim',
    'Cedofeita, Santo Ildefonso, Sé, Miragaia, São Nicolau e Vitória',
    'Paranhos',
    'Ramalde',
    'Campanhã',
  ],
  'Vila Nova de Gaia': ['Mafamude e Vilar do Paraíso', 'Santa Marinha e São Pedro da Afurada', 'Canidelo'],
  Matosinhos: ['Matosinhos e Leça da Palmeira', 'Senhora da Hora', 'São Mamede de Infesta e Senhora da Hora'],
  Maia: ['Maia', 'Águas Santas', 'Pedrouços'],
  Gondomar: ['Gondomar (São Cosme), Valbom e Jovim', 'Rio Tinto', 'Fânzeres e São Pedro da Cova'],
  Valongo: ['Valongo', 'Ermesinde', 'Alfena'],
  'Póvoa de Varzim': ['Póvoa de Varzim, Beiriz e Argivai', 'Aver-o-Mar, Amorim e Terroso'],

  // Setúbal
  Setúbal: ['Setúbal (São Sebastião)', 'Setúbal (Nossa Senhora da Anunciada)', 'Azeitão (São Lourenço e São Simão)'],
  Almada: ['Almada, Cova da Piedade, Pragal e Cacilhas', 'Costa da Caparica', 'Charneca de Caparica e Sobreda'],
  Seixal: ['Amora', 'Corroios', 'Seixal, Arrentela e Aldeia de Paio Pires'],
  Barreiro: ['Barreiro e Lavradio', 'Alto do Seixalinho, Santo André e Verderena'],
  Montijo: ['Montijo e Afonsoeiro', 'Atalaia e Alto-Estanqueiro-Jardia'],
  Palmela: ['Palmela', 'Pinhal Novo', 'Quinta do Anjo'],

  // Braga
  Braga: ['Braga (São Vicente)', 'Braga (Maximinos, Sé e Cividade)', 'Lomar e Arcos'],
  Guimarães: ['Guimarães (Oliveira, São Paio e São Sebastião)', 'Creixomil', 'Azurém'],
  'Vila Nova de Famalicão': ['Vila Nova de Famalicão e Calendário', 'Joane', 'Ribeirão'],
  Barcelos: ['Barcelos, Vila Boa e Vila Frescaínha (São Martinho e São Pedro)', 'Arcozelo', 'Barqueiros'],

  // Coimbra
  Coimbra: ['Sé Nova, Santa Cruz, Almedina e São Bartolomeu', 'Santo António dos Olivais', 'Eiras e São Paulo de Frades'],
  'Figueira da Foz': ['Buarcos e São Julião', 'Tavarede', 'São Pedro'],
  Cantanhede: ['Cantanhede e Pocariça', 'Tocha', 'Febres'],
  'Montemor-o-Velho': ['Montemor-o-Velho e Gatões', 'Pereira', 'Carapinheira'],

  // Faro
  Faro: ['Faro (Sé e São Pedro)', 'Montenegro', 'Santa Bárbara de Nexe'],
  Loulé: ['Loulé (São Clemente)', 'Almancil', 'Quarteira'],
  Albufeira: ['Albufeira e Olhos de Água', 'Guia', 'Paderne'],
  Portimão: ['Portimão', 'Alvor', 'Mexilhoeira Grande'],
  Olhão: ['Olhão', 'Pechão', 'Quelfes'],
  Tavira: ['Tavira (Santa Maria e Santiago)', 'Conceição e Cabanas de Tavira', 'Luz de Tavira e Santo Estêvão'],
}

export function getConcelhos(distrito: string | undefined): readonly string[] {
  if (!distrito) return []
  return PT_CONCELHOS[distrito] ?? []
}

export function getFreguesias(concelho: string | undefined): readonly string[] {
  if (!concelho) return []
  return PT_FREGUESIAS[concelho] ?? []
}

export function findDistritoOfConcelho(concelho: string): string | undefined {
  for (const [distrito, concelhos] of Object.entries(PT_CONCELHOS)) {
    if (concelhos.includes(concelho)) return distrito
  }
  return undefined
}
