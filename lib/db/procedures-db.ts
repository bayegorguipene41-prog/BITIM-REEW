import type { Procedure } from "@/lib/types";

export const PROCEDURES: Procedure[] = [
  {
    id: "IT-permesso-soggiorno-lavoro",
    countryCode: "IT",
    slug: "permesso-soggiorno-lavoro",
    title: { it: "Permesso di soggiorno per lavoro", en: "Residence permit for work" },
    description: {
      it: "Documenti per ottenere il permesso di soggiorno in Italia per motivi di lavoro.",
      en: "Documents required to obtain an Italian residence permit for work purposes.",
    },
    category: "residence",
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
          it: "Deve avere scadenza non inferiore a 3 mesi dalla richiesta.",
          en: "Must expire at least 3 months after the application date.",
        },
        necessity: "required",
        sourceId: "source-IT-questura",
      },
      {
        id: "visto",
        code: "ENTRY_VISA",
        name: { it: "Visto di ingresso", en: "Entry visa" },
        description: {
          it: "Rilasciato dall'Ambasciata/Consolato nel Paese di origine.",
          en: "Issued by the Italian Embassy/Consulate in your country of origin.",
        },
        necessity: "required",
        sourceId: "source-IT-questura",
      },
      {
        id: "contratto",
        code: "WORK_CONTRACT",
        name: { it: "Contratto di soggiorno", en: "Residence contract" },
        description: {
          it: "Approvato dallo Sportello Unico per l'Immigrazione.",
          en: "Approved by the One-Stop Immigration Desk.",
        },
        necessity: "required",
        sourceId: "source-IT-questura",
      },
    ],
  },
];