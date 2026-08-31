// ==========================================
// TIPI COMUNI PER TUTTE LE PROCEDURE
// ==========================================

// 📄 Singolo documento richiesto (con logica condizionale)
export type DocumentoRichiesto = {
  nome: string;
  obbligatorio: boolean;
  condizione?: string;  // Es: "età >= 18", "coniugato == vero"
  dove_andarlo_a_fare?: string;
  indirizzo?: string;
  orari?: string;
  prenotazione?: string;
  note?: string;
};

// 📍 Luogo dove presentare la domanda
export type LuogoPresentazione = {
  nome: string;
  indirizzo: string;
  orari: string;
  prenotazione: string;
  telefono?: string;
  email?: string;
  sito_ufficiale?: string;
  note?: string;
};

// 📋 Procedura COMPLETA
export type Procedura = {
  id: string;
  paese: string;
  categoria: string;
  nome_procedura: string;
  descrizione: string;

  chi_puo_fare_richiesta: string;

  documenti_obbligatori: DocumentoRichiesto[];
  documenti_opzionali?: DocumentoRichiesto[];

  traduzione_richiesta: boolean;
  apostille_richiesta: boolean;
  legalizzazione_richiesta: boolean;

  foto_richieste: boolean;
  documento_indirizzo_richiesto: boolean;
  certificato_redditi_richiesto: boolean;

  metodo_presentazione: string;
  dove_presentare: LuogoPresentazione;

  appuntamento_obbligatorio: boolean;
  costo_stimato: string;
  tempo_attesa_stimato: string;

  validita: string;
  rinnovo: string;

  passaggi: string[];

  fonte_ufficiale: string;
  ultimo_aggiornamento: string;
  note_generali?: string;
};

// 📋 Categoria di procedure
export type Categoria = {
  id: string;
  nome: string;
  icona: string;
  descrizione: string;
  procedure: string[];
};

// 📋 Risposta al questionario
export type RisposteUtente = {
  paese_destinazione: string;
  paese_origine: string;
  eta: number;
  stato_civile: string;
  cosa_vuoi_fare: string;
  procedura_scelta?: string;
};