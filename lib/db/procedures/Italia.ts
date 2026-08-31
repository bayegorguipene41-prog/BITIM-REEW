// ==========================================
// PROCEDURE PER L'ITALIA
// ==========================================

import type { Procedure } from "@/lib/types";
import type { Procedura } from '../tipi';

export const procedureItalia: Procedure = {
  id: "IT-permesso-soggiorno-lavoro",
  countryCode: "IT",
  slug: "permesso-soggiorno-lavoro",
  title: { it: "Permesso di soggiorno per lavoro", en: "Residence permit for work" },
  description: {
    it: "Documenti per ottenere il permesso di soggiorno in Italia per motivi di lavoro subordinato.",
    en: "Documents required to obtain an Italian residence permit for subordinate work purposes.",
  },
  category: "immigration",
  sources: [
    {
      id: "source-IT-questura",
      name: "Portale Immigrazione",
      authority: "Ministero dell'Interno / Questura",
      url: "https://www.interno.gov.it/it/argomenti/immigrazione",
      lastVerifiedAt: "2026-08-25",
      confidence: "high",
    },
  ],
  requirements: [
    {
      id: "passaporto",
      code: "PASSPORT",
      name: { it: "Passaporto valido", en: "Valid passport" },
      description: {
        it: "Deve avere una validità residua di almeno 3 mesi oltre la durata del permesso richiesto.",
        en: "Must remain valid for at least 3 months beyond the requested permit.",
      },
      necessity: "required",
      whereToGet: {
        it: "Autorità del Paese di cittadinanza, Ambasciata o Consolato italiano.",
        en: "Issuing authority of your country of citizenship, Italian Embassy or Consulate.",
      },
      whatYouNeed: {
        it: "Un passaporto in corso di validità non scaduto.",
        en: "A non-expired, valid passport.",
      },
      translationRequired: false,
      apostilleRequired: false,
      validityPeriod: { it: "Durata del passaporto, min. 3 mesi oltre il permesso.", en: "Passport validity, min. 3 months beyond the permit." },
      estimatedCost: { it: "Variabile in base al Paese emittente.", en: "Varies by issuing country." },
      processingTime: { it: "Variabile.", en: "Varies." },
      sourceId: "source-IT-questura",
    },
    {
      id: "visto",
      code: "ENTRY_VISA",
      name: { it: "Visto di ingresso", en: "Entry visa" },
      description: {
        it: "Visto per lavoro rilasciato dall'Ambasciata o Consolato italiano nel Paese di origine.",
        en: "Entry visa issued by the Italian Embassy or Consulate in your country of origin.",
      },
      necessity: "required",
      whereToGet: {
        it: "Ambasciata o Consolato d'Italia nel Paese di origine.",
        en: "Italian Embassy or Consulate in your country of origin.",
      },
      whatYouNeed: {
        it: "Autorizzazione al lavoro (nulla osta) e passaporto valido.",
        en: "Work authorization (nulla osta) and a valid passport.",
      },
      translationRequired: false,
      apostilleRequired: false,
      validityPeriod: { it: "Come indicato nel visto.", en: "As stated on the visa." },
      estimatedCost: { it: "Variabile in base alla circoscrizione consolare.", en: "Varies by consular district." },
      processingTime: { it: "Da alcune settimane a pochi mesi.", en: "From a few weeks to a few months." },
      sourceId: "source-IT-questura",
    },
    {
      id: "contratto",
      code: "WORK_CONTRACT",
      name: { it: "Contratto di soggiorno", en: "Residence contract" },
      description: {
        it: "Contratto di soggiorno per lavoro subordinato, approvato dallo Sportello Unico per l'Immigrazione.",
        en: "Residence contract for subordinate work, approved by the One-Stop Immigration Desk.",
      },
      necessity: "required",
      whereToGet: {
        it: "Datore di lavoro, predisposto e registrato presso lo Sportello Unico per l'Immigrazione.",
        en: "Employer, drawn up and registered with the One-Stop Immigration Desk.",
      },
      whatYouNeed: {
        it: "Un contratto di lavoro sottoscritto da entrambe le parti.",
        en: "An employment contract signed by both parties.",
      },
      translationRequired: true,
      apostilleRequired: false,
      validityPeriod: { it: "Durata del rapporto di lavoro.", en: "Duration of the employment relationship." },
      processingTime: { it: "Variabile.", en: "Varies." },
      sourceId: "source-IT-questura",
    },
    {
      id: "assicurazione-sanitaria",
      code: "HEALTH_INSURANCE",
      name: { it: "Certificato di assicurazione sanitaria", en: "Health insurance certificate" },
      description: {
        it: "Copertura sanitaria valida per l'intera durata del permesso.",
        en: "Health coverage valid for the entire duration of the permit.",
      },
      necessity: "required",
      whereToGet: {
        it: "Azienda Sanitaria Locale (ASL) o assicurazione sanitaria privata.",
        en: "Local health authority (ASL) or private health insurance.",
      },
      whatYouNeed: {
        it: "Copia della polizza o del certificato di iscrizione.",
        en: "A copy of the policy or enrollment certificate.",
      },
      translationRequired: true,
      apostilleRequired: false,
      validityPeriod: { it: "Tutta la durata del permesso.", en: "Entire duration of the permit." },
      estimatedCost: { it: "Variabile secondo il fornitore.", en: "Varies by provider." },
      processingTime: { it: "Immediato.", en: "Immediate." },
      sourceId: "source-IT-questura",
    },
    {
      id: "foto",
      code: "PASSPORT_PHOTOS",
      name: { it: "Fotografie formato tessera", en: "Passport photos" },
      description: {
        it: "Fotografie recenti per la documentazione della pratica.",
        en: "Recent photographs for the application documents.",
      },
      necessity: "required",
      whereToGet: {
        it: "Fotografo autorizzato o cabina fotografica conforme.",
        en: "Authorized photographer or compliant photo booth.",
      },
      whatYouNeed: {
        it: "N. 4 fotografie formato tessera, sfondo chiaro.",
        en: "4 recent passport-size photographs on a light background.",
      },
      translationRequired: false,
      apostilleRequired: false,
      validityPeriod: { it: "Recenti (di norma non oltre 6 mesi).", en: "Recent (usually within 6 months)." },
      estimatedCost: { it: "Circa € 10-20.", en: "Around €10-20." },
      processingTime: { it: "Immediato.", en: "Immediate." },
      sourceId: "source-IT-questura",
    },
    {
      id: "certificato-nascita",
      code: "BIRTH_CERTIFICATE",
      name: { it: "Certificato di nascita", en: "Birth certificate" },
      description: {
        it: "Può essere richiesto in alcuni casi, ad esempio per il ricongiungimento familiare.",
        en: "May be required in some cases, e.g. for family reunification.",
      },
      necessity: "conditional",
      whereToGet: {
        it: "Comune di nascita o Consolato del Paese di origine.",
        en: "Municipality of birth or consulate of the country of origin.",
      },
      whatYouNeed: {
        it: "Estratto o copia integrale del certificato di nascita.",
        en: "Full or extract copy of the birth certificate.",
      },
      translationRequired: true,
      apostilleRequired: true,
      validityPeriod: { it: "Spesso limitato a 6 mesi dalla data di emissione.", en: "Often limited to 6 months from issue." },
      estimatedCost: { it: "Variabile; spesso gratuito al Comune, traduzione a parte.", en: "Varies; often free from the municipality, translation extra." },
      processingTime: { it: "Da alcuni giorni a settimane.", en: "From days to weeks." },
      sourceId: "source-IT-questura",
    },
  ],
  meta: {
    whoCanApply: {
      it: "Cittadino straniero in possesso di visto per lavoro rilasciato dalla Questura o dallo Sportello Unico.",
      en: "A foreign national holding a work visa issued by the Questura or the One-Stop Immigration Desk.",
    },
    whereToApply: {
      name: { it: "Questura — Ufficio Immigrazione", en: "Questura — Immigration Office" },
      address: { it: "Presso la Questura della provincia di residenza", en: "At the Questura of your province of residence" },
      hours: { it: "Lunedì, Mercoledì e Venerdì: 09:00-11:30", en: "Monday, Wednesday and Friday: 09:00-11:30" },
      appointment: { it: "Obbligatoria online sul sito della Questura o tramite il portale dedicato.", en: "Required online on the Questura website or via the dedicated portal." },
      phone: "Numero verde: 800 ...",
      website: "https://www.poliziadistato.it",
      notes: { it: "La domanda può essere consegnata anche tramite lo sportello postale autorizzato.", en: "The application can also be delivered through an authorized postal counter." },
    },
    method: { it: "Sportello postale autorizzato con modulo elettronico", en: "Authorized postal counter with electronic form" },
    estimatedCost: { it: "Circa € 100-150 (marche da bollo + spese di spedizione)", en: "Around €100-150 (stamp duties + postage fees)" },
    processingTime: { it: "Da 30 a 90 giorni", en: "From 30 to 90 days" },
    validity: { it: "Da 1 a 2 anni, rinnovabile", en: "From 1 to 2 years, renewable" },
    renewal: { it: "Presentare domanda almeno 60 giorni prima della scadenza", en: "Submit the application at least 60 days before the expiry" },
    appointmentRequired: true,
    steps: [
      { it: "Il datore di lavoro richiede l'autorizzazione al Ministero del Lavoro.", en: "The employer requests the authorization from the Ministry of Labour." },
      { it: "Ottenuta l'autorizzazione, si richiede il visto all'Ambasciata/Consolato.", en: "Once authorized, apply for the visa at the Embassy/Consulate." },
      { it: "Entrati in Italia, presentare domanda alla Questura entro 8 giorni.", en: "After entering Italy, apply to the Questura within 8 days." },
      { it: "Consegnare la domanda completa presso lo sportello postale autorizzato.", en: "Deliver the complete application at an authorized postal counter." },
      { it: "Ricevuta la ricevuta, attendere il ritiro del permesso.", en: "After receiving the receipt, wait to collect the permit." },
    ],
    note: { it: "I tempi e i costi possono variare in base alla Questura e alla tipologia di lavoro.", en: "Times and costs may vary based on the Questura and the type of work." },
  },
};

// ==========================================
// EXPORT LEGACY DETTAGLIATO (tipo Procedura)
// ==========================================

export const permessoSoggiornoLavoroItalia: Procedura = {
  id: "permesso-soggiorno-lavoro-italia",
  paese: "Italia",
  categoria: "Immigrazione",
  nome_procedura: "Permesso di soggiorno per lavoro",
  descrizione: "Permesso che consente di soggiornare e lavorare in Italia per un periodo determinato.",

  chi_puo_fare_richiesta: "Cittadino straniero in possesso di visto per lavoro rilasciato dalla Questura.",

  documenti_obbligatori: [
    {
      nome: "Passaporto o documento equivalente",
      obbligatorio: true,
      dove_andarlo_a_fare: "Autorità del Paese di cittadinanza / Ambasciata o Consolato",
      note: "Deve essere valido per almeno 3 mesi oltre la data di scadenza del permesso richiesto"
    },
    {
      nome: "Visto per lavoro",
      obbligatorio: true,
      dove_andarlo_a_fare: "Ambasciata o Consolato d'Italia nel Paese di origine",
      note: "Rilasciato dopo autorizzazione del Ministero dell'Interno"
    },
    {
      nome: "Contratto di lavoro",
      obbligatorio: true,
      dove_andarlo_a_fare: "Il datore di lavoro — deve essere già registrato al Ministero del Lavoro",
      note: "Sottoscritto sia dal lavoratore che dal datore di lavoro"
    },
    {
      nome: "Certificato di assicurazione sanitaria",
      obbligatorio: true,
      dove_andarlo_a_fare: "Azienda Sanitaria Locale (ASL) o assicurazione privata",
      note: "Copertura per tutto il periodo di validità del permesso"
    },
    {
      nome: "Fotografie formato tessera",
      obbligatorio: true,
      dove_andarlo_a_fare: "Fotografo autorizzato",
      note: "N. 4 fotografie recenti, formato 3x4 cm, sfondo bianco"
    }
  ],

  documenti_opzionali: [
    {
      nome: "Certificato di nascita",
      obbligatorio: false,
      dove_andarlo_a_fare: "Comune di nascita o Consolato",
      note: "Può essere richiesto in alcuni casi"
    }
  ],

  traduzione_richiesta: true,
  apostille_richiesta: true,
  legalizzazione_richiesta: true,

  foto_richieste: true,
  documento_indirizzo_richiesto: true,
  certificato_redditi_richiesto: false,

  metodo_presentazione: "Sportello postale autorizzato con modulo elettronico",

  dove_presentare: {
    nome: "Questura — Ufficio Immigrazione",
    indirizzo: "Presso la Questura della provincia di residenza",
    orari: "Lunedì, Mercoledì e Venerdì: 09:00-11:30",
    prenotazione: "Obbligatoria online sul sito della Questura o tramite portale dedicato",
    telefono: "Numero verde: 800 ...",
    sito_ufficiale: "www.poliziadistato.it",
    note: "Consegnare la domanda allo sportello postale autorizzato"
  },

  appuntamento_obbligatorio: true,
  costo_stimato: "Circa € 100-150 (marche da bollo + spese di spedizione)",
  tempo_attesa_stimato: "Da 30 a 90 giorni",

  validita: "Da 1 a 2 anni, rinnovabile",
  rinnovo: "Presentare domanda almeno 60 giorni prima della scadenza",

  passaggi: [
    "1. Il datore di lavoro richiede l'autorizzazione al Ministero del Lavoro",
    "2. Ottenuta l'autorizzazione, si richiede il visto all'Ambasciata/Consolato",
    "3. Entrati in Italia, presentare domanda alla Questura entro 8 giorni",
    "4. Consegnare la domanda completa presso lo sportello postale autorizzato",
    "5. Ricevuta la ricevuta, attendere il ritiro del permesso"
  ],

  fonte_ufficiale: "Ministero dell'Interno — www.interno.gov.it",
  ultimo_aggiornamento: "30/08/2026",
  note_generali: "I tempi e i costi possono variare in base alla Questura e alla tipologia di lavoro."
};

// ==========================================
// ESEMPIO DI APPLICABILITÀ CONDIZIONALE
// ==========================================
// Questa procedura dimostra il meccanismo delle condizioni: è applicabile
// solo quando il contesto utente riporta stato civile "married".
// È un esempio della feature, NON una regola normativa ufficiale.
export const procedureItaliaRicongiungimento: Procedure = {
  id: "IT-ricongiungimento-familiare",
  countryCode: "IT",
  slug: "ricongiungimento-familiare",
  title: { it: "Ricongiungimento familiare (coniuge)", en: "Family reunification (spouse)" },
  description: {
    it: "Documenti per ricongiungersi con il coniuge già residente in Italia.",
    en: "Documents to reunite with a spouse already residing in Italy.",
  },
  category: "immigration",
  condition: { field: "maritalStatus", operator: "eq", value: "married" },
  sources: [
    {
      id: "source-IT-questura",
      name: "Portale Immigrazione",
      authority: "Ministero dell'Interno / Questura",
      url: "https://www.interno.gov.it/it/argomenti/immigrazione",
      lastVerifiedAt: "2026-08-30",
      confidence: "medium",
    },
  ],
  requirements: [
    {
      id: "certificato-matrimonio",
      code: "MARRIAGE_CERTIFICATE",
      name: { it: "Certificato di matrimonio", en: "Marriage certificate" },
      description: {
        it: "Certificato di matrimonio tradotto e apostillato.",
        en: "Translated and apostilled marriage certificate.",
      },
      necessity: "required",
      translationRequired: true,
      apostilleRequired: true,
      sourceId: "source-IT-questura",
    },
    {
      id: "permesso-coniuge",
      code: "SPOUSE_RESIDENCE_PERMIT",
      name: { it: "Permesso di soggiorno del coniuge", en: "Residence permit of the spouse" },
      description: {
        it: "Copia del permesso di soggiorno del coniuge residente.",
        en: "Copy of the residence permit of the resident spouse.",
      },
      necessity: "required",
      sourceId: "source-IT-questura",
    },
  ],
};

// Esporta tutte le procedure dell'Italia
export const PROCEDURE_ITALIA: Procedura[] = [
  permessoSoggiornoLavoroItalia
];
