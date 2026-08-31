// ==========================================
// ELENCO DELLE CATEGORIE E DELLE PROCEDURE
// ==========================================

import type { Categoria } from './tipi';

export const CATEGORIE: Categoria[] = [
  {
    id: "immigrazione",
    nome: "Immigrazione",
    icona: "🛂",
    descrizione: "Visti, permessi di soggiorno, cittadinanza e protezione internazionale",
    procedure: [
      "Visto turistico",
      "Visto per lavoro",
      "Visto per lavoro autonomo",
      "Visto per studio",
      "Visto per ricongiungimento familiare",
      "Permesso di soggiorno per lavoro",
      "Permesso di soggiorno per studio",
      "Permesso di soggiorno per motivi familiari",
      "Rinnovo del permesso di soggiorno",
      "Conversione del permesso di soggiorno",
      "Permesso di soggiorno permanente / lungo periodo",
      "Ricongiungimento familiare",
      "Residenza permanente",
      "Protezione internazionale / asilo",
      "Cittadinanza per naturalizzazione"
    ]
  },
  {
    id: "residenza",
    nome: "Residenza e documenti personali",
    icona: "🏠",
    descrizione: "Registrazione, certificati, codice fiscale e carta d'identità",
    procedure: [
      "Registrazione della residenza",
      "Cambio di residenza",
      "Certificato di residenza",
      "Certificato di nascita",
      "Certificato di stato civile",
      "Certificato di stato di famiglia",
      "Codice fiscale / Tax ID",
      "Numero di identificazione nazionale",
      "Carta d'identità",
      "Documento di viaggio sostitutivo"
    ]
  },
  {
    id: "lavoro",
    nome: "Lavoro",
    icona: "💼",
    descrizione: "Autorizzazioni, contratti, qualifiche e apertura attività",
    procedure: [
      "Autorizzazione al lavoro",
      "Registrazione del contratto di lavoro",
      "Lavoro subordinato",
      "Lavoro stagionale",
      "Lavoro autonomo",
      "Apertura di attività professionale",
      "Apertura di impresa",
      "Riconoscimento della qualifica professionale",
      "Riconoscimento del titolo di studio",
      "Registrazione previdenziale",
      "Numero di previdenza sociale"
    ]
  },
  {
    id: "studio",
    nome: "Studio",
    icona: "🎓",
    descrizione: "Iscrizioni, riconoscimento titoli e borse di studio",
    procedure: [
      "Iscrizione universitaria",
      "Iscrizione scolastica",
      "Visto per studio",
      "Permesso di soggiorno per studio",
      "Riconoscimento diploma",
      "Riconoscimento laurea",
      "Riconoscimento crediti/qualifiche",
      "Borsa di studio",
      "Tirocinio"
    ]
  },
  {
    id: "famiglia",
    nome: "Famiglia",
    icona: "👨‍👩‍👧",
    descrizione: "Matrimonio, nascita figli, ricongiungimento e adozione",
    procedure: [
      "Registrazione del matrimonio",
      "Matrimonio con cittadino straniero",
      "Registrazione della nascita di un figlio",
      "Ricongiungimento dei figli",
      "Divorzio",
      "Registrazione del divorzio",
      "Adozione",
      "Permesso di soggiorno per familiare"
    ]
  },
  {
    id: "patente",
    nome: "Patente e veicoli",
    icona: "🚗",
    descrizione: "Ottenimento, conversione patente e immatricolazione veicoli",
    procedure: [
      "Ottenimento della patente",
      "Conversione della patente straniera",
      "Patente internazionale",
      "Immatricolazione di un veicolo",
      "Importazione di un veicolo"
    ]
  },
  {
    id: "finanza",
    nome: "Finanza",
    icona: "🏦",
    descrizione: "Conto bancario, registrazione fiscale e dichiarazione redditi",
    procedure: [
      "Apertura di un conto bancario",
      "Registrazione fiscale / dichiarazione dei redditi"
    ]
  },
  {
    id: "documenti",
    nome: "Documenti",
    icona: "📄",
    descrizione: "Traduzione, legalizzazione e apostille di documenti stranieri",
    procedure: [
      "Traduzione ufficiale di documento",
      "Legalizzazione di documento",
      "Apostille di documento",
      "Utilizzo documento estero in Italia"
    ]
  }
];